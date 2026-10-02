import fs from 'fs';
import path from 'path';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from '../config/constants.js';
import { calculateFileHash } from '../utils/crypto.js';
import { getUniqueFilePath, sanitizeFilename } from '../utils/sanitize.js';
import { MetadataStore } from '../storage/metadataStore.js';
import { logger } from '../utils/logger.js';

const activeRelaySessions = new Map(); // code -> session object
const RELAY_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL for download access

export class RelayService {
  static generateCode() {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (activeRelaySessions.has(code));
    return code;
  }

  static formatCodeDisplay(code) {
    if (!code || code.length !== 6) return code;
    return `${code.substring(0, 3)}-${code.substring(3)}`;
  }

  static sanitizeCodeInput(input) {
    if (!input) return '';
    return input.toString().replace(/[^0-9]/g, '');
  }

  static createSession({ files, senderDevice, senderSocketId }) {
    const rawCode = this.generateCode();
    const formattedCode = this.formatCodeDisplay(rawCode);
    const expiresAt = new Date(Date.now() + RELAY_TTL_MS).toISOString();

    const sessionData = {
      code: rawCode,
      formattedCode,
      senderDevice: senderDevice || 'Internet Sender',
      senderSocketId: senderSocketId || null,
      receiverSocketId: null,
      status: 'waiting', // waiting, paired, transferring, completed, cancelled, failed
      files: files.map((file, idx) => ({
        id: file.id || `file_${idx}_${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        totalChunks: file.totalChunks || 1,
        chunksReceived: 0,
        bytesReceived: 0,
        hash: file.hash || null,
        status: 'pending'
      })),
      totalBytes: files.reduce((acc, f) => acc + (f.size || 0), 0),
      bytesTransferred: 0,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    activeRelaySessions.set(rawCode, sessionData);
    logger.info(`Created Internet Relay Session Code: ${formattedCode} for ${senderDevice}`);

    return sessionData;
  }

  static getSession(code) {
    const cleanCode = this.sanitizeCodeInput(code);
    if (!activeRelaySessions.has(cleanCode)) return null;

    const session = activeRelaySessions.get(cleanCode);
    if (new Date() > new Date(session.expiresAt)) {
      this.cancelSession(cleanCode, 'Relay code expired');
      return null;
    }

    return session;
  }

  static pairReceiver(code, receiverSocketId = null) {
    const cleanCode = this.sanitizeCodeInput(code);
    const session = this.getSession(cleanCode);

    if (!session) {
      return { success: false, error: 'Invalid or expired 6-digit code' };
    }

    session.status = 'paired';
    session.receiverSocketId = receiverSocketId;
    activeRelaySessions.set(cleanCode, session);

    logger.info(`Internet Relay Session ${session.formattedCode} paired with receiver`);
    return { success: true, session };
  }

  static async appendChunk(code, fileId, chunkIndex, chunkBuffer) {
    const cleanCode = this.sanitizeCodeInput(code);
    const tempFilename = `relay_${cleanCode}_${fileId}.part`;
    const tempFilePath = path.join(TEMP_UPLOAD_DIR, tempFilename);

    await fs.promises.appendFile(tempFilePath, chunkBuffer);
    return tempFilePath;
  }

  static updateProgress(code, fileId, chunkIndex, totalChunks, chunkSize) {
    const cleanCode = this.sanitizeCodeInput(code);
    const session = activeRelaySessions.get(cleanCode);
    if (!session) return null;

    session.status = 'transferring';
    const file = session.files.find(f => f.id === fileId);
    if (file) {
      file.status = 'transferring';
      file.chunksReceived = chunkIndex + 1;
      file.bytesReceived += chunkSize;
    }

    session.bytesTransferred += chunkSize;
    activeRelaySessions.set(cleanCode, session);

    const percent = Math.min(100, Math.round((session.bytesTransferred / session.totalBytes) * 100));
    return { session, file, percent };
  }

  static async finalizeFile(code, fileId, originalFilename, expectedHash = null) {
    const cleanCode = this.sanitizeCodeInput(code);
    const tempFilename = `relay_${cleanCode}_${fileId}.part`;
    const tempFilePath = path.join(TEMP_UPLOAD_DIR, tempFilename);

    if (!fs.existsSync(tempFilePath)) {
      throw new Error(`Temporary relay file missing for code ${cleanCode}`);
    }

    const actualHash = await calculateFileHash(tempFilePath);

    if (expectedHash && expectedHash.toLowerCase() !== actualHash.toLowerCase()) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return { success: false, error: 'SHA-256 mismatch' };
    }

    const safeName = sanitizeFilename(originalFilename);
    const { filePath: finalPath, filename: finalFilename } = getUniqueFilePath(UPLOAD_DIR, safeName);

    await fs.promises.rename(tempFilePath, finalPath);
    const stats = await fs.promises.stat(finalPath);

    return {
      success: true,
      filename: finalFilename,
      filePath: finalPath,
      size: stats.size,
      hash: actualHash
    };
  }

  static completeSession(code, finalizedFile) {
    const cleanCode = this.sanitizeCodeInput(code);
    const session = activeRelaySessions.get(cleanCode);
    if (!session) return null;

    session.status = 'completed';
    session.finalFile = finalizedFile;
    session.endTime = new Date().toISOString();

    MetadataStore.addTransfer({
      id: `relay_${cleanCode}`,
      senderDevice: session.senderDevice,
      status: 'completed',
      files: session.files.map(f => ({
        ...f,
        storedName: finalizedFile.filename,
        filePath: finalizedFile.filePath,
        verifiedHash: finalizedFile.hash
      })),
      totalBytes: session.totalBytes,
      createdAt: session.createdAt
    });

    // Retain completed session in Map so receiver can download
    activeRelaySessions.set(cleanCode, session);
    return session;
  }

  static cancelSession(code, reason = 'Cancelled') {
    const cleanCode = this.sanitizeCodeInput(code);
    const session = activeRelaySessions.get(cleanCode);
    if (session) {
      for (const f of session.files) {
        const tempFilename = `relay_${cleanCode}_${f.id}.part`;
        const tempPath = path.join(TEMP_UPLOAD_DIR, tempFilename);
        if (fs.existsSync(tempPath)) {
          try { fs.unlinkSync(tempPath); } catch (e) {}
        }
      }
      activeRelaySessions.delete(cleanCode);
    }
  }

  static purgeExpiredSessions() {
    const now = new Date();
    for (const [code, session] of activeRelaySessions.entries()) {
      if (now > new Date(session.expiresAt)) {
        this.cancelSession(code, 'Expired');
      }
    }
  }
}

setInterval(() => RelayService.purgeExpiredSessions(), 3 * 60 * 1000);
