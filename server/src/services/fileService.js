import fs from 'fs';
import path from 'path';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from '../config/constants.js';
import { getUniqueFilePath, sanitizeFilename } from '../utils/sanitize.js';
import { calculateFileHash } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export class FileService {
  /**
   * Appends binary chunk data to the temporary file.
   */
  static appendChunk(transferId, fileId, chunkIndex, chunkBuffer) {
    return new Promise((resolve, reject) => {
      const tempFilename = `${transferId}_${fileId}.part`;
      const tempFilePath = path.join(TEMP_UPLOAD_DIR, tempFilename);

      fs.appendFile(tempFilePath, chunkBuffer, (err) => {
        if (err) {
          logger.error(`Failed to append chunk ${chunkIndex} for ${tempFilename}:`, err);
          return reject(err);
        }
        resolve(tempFilePath);
      });
    });
  }

  /**
   * Retrieves resume information for an interrupted transfer.
   * Checks size of existing .part file to determine completed chunks.
   */
  static getResumeInfo(transferId, fileId, chunkSize = 4 * 1024 * 1024) {
    const tempFilename = `${transferId}_${fileId}.part`;
    const tempFilePath = path.join(TEMP_UPLOAD_DIR, tempFilename);

    if (fs.existsSync(tempFilePath)) {
      const stats = fs.statSync(tempFilePath);
      const chunksCompleted = Math.floor(stats.size / chunkSize);
      const bytesReceived = stats.size;
      return {
        exists: true,
        bytesReceived,
        chunksCompleted,
        resumeChunkIndex: chunksCompleted
      };
    }

    return {
      exists: false,
      bytesReceived: 0,
      chunksCompleted: 0,
      resumeChunkIndex: 0
    };
  }

  /**
   * Finalizes completed upload: computes SHA-256, verifies match, moves to uploads directory.
   */
  static async finalizeUpload(transferId, fileId, originalFilename, expectedHash = null, targetDir = UPLOAD_DIR) {
    const tempFilename = `${transferId}_${fileId}.part`;
    const tempFilePath = path.join(TEMP_UPLOAD_DIR, tempFilename);

    if (!fs.existsSync(tempFilePath)) {
      throw new Error(`Temporary file ${tempFilename} does not exist`);
    }

    try {
      const actualHash = await calculateFileHash(tempFilePath);

      if (expectedHash && expectedHash.toLowerCase() !== actualHash.toLowerCase()) {
        logger.warn(`Hash mismatch for ${originalFilename}! Expected ${expectedHash}, got ${actualHash}`);
        this.cleanupTempFile(transferId, fileId);
        return {
          success: false,
          error: 'Integrity verification failed (SHA-256 mismatch)',
          expectedHash,
          actualHash
        };
      }

      const safeFilename = sanitizeFilename(originalFilename);
      const { filePath: finalPath, filename: finalFilename } = getUniqueFilePath(targetDir, safeFilename);

      await fs.promises.rename(tempFilePath, finalPath);
      const stats = await fs.promises.stat(finalPath);

      logger.info(`File finalized successfully: ${finalFilename} (${stats.size} bytes), SHA-256: ${actualHash}`);

      return {
        success: true,
        filename: finalFilename,
        filePath: finalPath,
        size: stats.size,
        hash: actualHash
      };
    } catch (err) {
      logger.error(`Error finalizing upload for ${originalFilename}:`, err);
      this.cleanupTempFile(transferId, fileId);
      throw err;
    }
  }

  static cleanupTempFile(transferId, fileId) {
    try {
      const tempFilename = `${transferId}_${fileId}.part`;
      const tempFilePath = path.join(TEMP_UPLOAD_DIR, tempFilename);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        logger.info(`Cleaned up temporary file: ${tempFilename}`);
      }
    } catch (err) {
      logger.error(`Error cleaning up temp file for transfer ${transferId}:`, err);
    }
  }
}
