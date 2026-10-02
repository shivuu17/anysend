import { generateTransferId } from '../utils/crypto.js';
import { MetadataStore } from '../storage/metadataStore.js';
import { FileService } from './fileService.js';
import { logger } from '../utils/logger.js';

const activeTransfers = new Map();

export class TransferService {
  /**
   * Registers a new file transfer request with receiver targeting.
   */
  static createTransferRequest({ senderDevice, senderSocketId = null, receiverSocketId = null, files, sessionId, token }) {
    const transferId = generateTransferId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min TTL

    const transferData = {
      id: transferId,
      sessionId,
      senderSocketId: senderSocketId || null,
      receiverSocketId: receiverSocketId || null,
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
      createdAt: new Date().toISOString(),
      expiresAt
    };

    activeTransfers.set(transferId, transferData);
    logger.info(`Created targeted transfer request ${transferId} [Sender: ${senderSocketId}, Receiver: ${receiverSocketId}]`);

    return transferData;
  }

  static getTransfer(transferId) {
    return activeTransfers.get(transferId) || null;
  }

  /**
   * Assigned receiver accepts a transfer request.
   */
  static acceptTransfer(transferId, receiverSocketId = null) {
    const transfer = activeTransfers.get(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found or expired`);
    }

    if (new Date() > new Date(transfer.expiresAt)) {
      transfer.status = 'failed';
      transfer.error = 'Transfer session expired';
      activeTransfers.set(transferId, transfer);
      throw new Error('Transfer session has expired');
    }

    if (transfer.status !== 'pending') {
      throw new Error(`Transfer is in status '${transfer.status}', cannot accept`);
    }

    if (transfer.receiverSocketId && receiverSocketId && transfer.receiverSocketId !== receiverSocketId) {
      throw new Error('Unauthorized: Only the assigned target receiver can accept this transfer request');
    }

    if (!transfer.receiverSocketId && receiverSocketId) {
      transfer.receiverSocketId = receiverSocketId;
    }

    transfer.status = 'accepted';
    transfer.startTime = new Date().toISOString();
    activeTransfers.set(transferId, transfer);

    logger.info(`Transfer ${transferId} accepted by receiver ${receiverSocketId || 'unknown'}`);
    return transfer;
  }

  /**
   * Assigned receiver rejects a transfer request.
   */
  static rejectTransfer(transferId, receiverSocketId = null, reason = 'Transfer rejected by receiver') {
    const transfer = activeTransfers.get(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    if (transfer.status !== 'pending') {
      throw new Error(`Transfer is in status '${transfer.status}', cannot reject`);
    }

    if (transfer.receiverSocketId && receiverSocketId && transfer.receiverSocketId !== receiverSocketId) {
      throw new Error('Unauthorized: Only the assigned target receiver can decline this transfer request');
    }

    transfer.status = 'rejected';
    transfer.endTime = new Date().toISOString();
    transfer.error = reason;

    // Save record to metadata store
    MetadataStore.addTransfer(transfer);
    activeTransfers.delete(transferId);

    logger.info(`Transfer ${transferId} rejected by receiver ${receiverSocketId || 'unknown'}: ${reason}`);
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
