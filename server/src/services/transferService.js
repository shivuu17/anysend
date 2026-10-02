import { generateTransferId } from '../utils/crypto.js';
import { MetadataStore } from '../storage/metadataStore.js';
import { FileService } from './fileService.js';
import { logger } from '../utils/logger.js';

const activeTransfers = new Map();

export class TransferService {
  /**
   * Registers a new file transfer request.
   */
  static createTransferRequest({ senderDevice, files, sessionId, token }) {
    const transferId = generateTransferId();

    const transferData = {
      id: transferId,
      sessionId,
      senderDevice: senderDevice || 'Unknown Sender',
      status: 'pending', // pending, accepted, rejected, transferring, completed, cancelled, failed
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
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString()
    };

    activeTransfers.set(transferId, transferData);
    logger.info(`Created transfer request ${transferId} with ${files.length} file(s) from ${senderDevice}`);

    return transferData;
  }

  static getTransfer(transferId) {
    return activeTransfers.get(transferId) || null;
  }

  /**
   * Receiver accepts a transfer request.
   */
  static acceptTransfer(transferId) {
    const transfer = activeTransfers.get(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    if (transfer.status !== 'pending') {
      throw new Error(`Transfer is in status '${transfer.status}', cannot accept`);
    }

    transfer.status = 'accepted';
    transfer.startTime = new Date().toISOString();
    activeTransfers.set(transferId, transfer);

    logger.info(`Transfer ${transferId} accepted`);
    return transfer;
  }

  /**
   * Receiver rejects a transfer request.
   */
  static rejectTransfer(transferId, reason = 'Transfer rejected by receiver') {
    const transfer = activeTransfers.get(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    transfer.status = 'rejected';
    transfer.endTime = new Date().toISOString();
    transfer.error = reason;

    // Save record to metadata store
    MetadataStore.addTransfer(transfer);
    activeTransfers.delete(transferId);

    logger.info(`Transfer ${transferId} rejected: ${reason}`);
    return transfer;
  }

  /**
   * Updates progress for a chunk received.
   */
  static updateChunkProgress(transferId, fileId, chunkIndex, totalChunks, chunkSize) {
    const transfer = activeTransfers.get(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    if (transfer.status === 'accepted') {
      transfer.status = 'transferring';
    }

    const file = transfer.files.find(f => f.id === fileId);
    if (file) {
      file.status = 'transferring';
      file.chunksReceived = chunkIndex + 1;
      file.bytesReceived += chunkSize;
    }

    transfer.bytesTransferred += chunkSize;
    activeTransfers.set(transferId, transfer);

    return {
      transfer,
      file,
      progressPercent: Math.min(100, Math.round((transfer.bytesTransferred / transfer.totalBytes) * 100))
    };
  }

  /**
   * Marks a file within transfer as finalized & verified.
   */
  static markFileComplete(transferId, fileId, finalizedResult) {
    const transfer = activeTransfers.get(transferId);
    if (!transfer) return null;

    const file = transfer.files.find(f => f.id === fileId);
    if (file) {
      file.status = 'completed';
      file.storedName = finalizedResult.filename;
      file.filePath = finalizedResult.filePath;
      file.verifiedHash = finalizedResult.hash;
    }

    const allCompleted = transfer.files.every(f => f.status === 'completed');
    if (allCompleted) {
      transfer.status = 'completed';
      transfer.endTime = new Date().toISOString();
      
      // Save metadata record
      MetadataStore.addTransfer(transfer);
      activeTransfers.delete(transferId);
      logger.info(`Transfer ${transferId} fully completed and saved to history.`);
    } else {
      activeTransfers.set(transferId, transfer);
    }

    return transfer;
  }

  /**
   * Cancels an ongoing transfer.
   */
  static cancelTransfer(transferId, reason = 'Cancelled by user') {
    const transfer = activeTransfers.get(transferId);
    if (!transfer) {
      return null;
    }

    transfer.status = 'cancelled';
    transfer.endTime = new Date().toISOString();
    transfer.error = reason;

    // Clean up all temporary chunk files
    for (const file of transfer.files) {
      FileService.cleanupTempFile(transferId, file.id);
    }

    MetadataStore.addTransfer(transfer);
    activeTransfers.delete(transferId);

    logger.info(`Transfer ${transferId} cancelled`);
    return transfer;
  }
}
