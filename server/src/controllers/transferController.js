import fs from 'fs';
import path from 'path';
import { TransferService } from '../services/transferService.js';
import { FileService } from '../services/fileService.js';
import { RelayService } from '../services/relayService.js';
import { RelayController } from './relayController.js';
import { MetadataStore } from '../storage/metadataStore.js';
import { logger } from '../utils/logger.js';

export class TransferController {
  static createRequest(req, res) {
    try {
      const { senderDevice, files, sessionId, token } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files provided in transfer request' });
      }

      const transfer = TransferService.createTransferRequest({
        senderDevice,
        files,
        sessionId,
        token
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('transfer:incoming', { transfer });
      }

      res.json({ success: true, transferId: transfer.id, transfer });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static accept(req, res) {
    try {
      const { id } = req.params;
      const transfer = TransferService.acceptTransfer(id);

      const io = req.app.get('io');
      if (io) {
        io.emit('transfer:accepted', { transferId: id, transfer });
      }

      res.json({ success: true, transfer });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const transfer = TransferService.rejectTransfer(id, reason);

      const io = req.app.get('io');
      if (io) {
        io.emit('transfer:rejected', { transferId: id, reason: transfer.error });
      }

      res.json({ success: true, transfer });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static getResumeInfo(req, res) {
    try {
      const { id: transferId } = req.params;
      const { fileId } = req.query;

      if (!fileId) {
        return res.status(400).json({ success: false, error: 'fileId required for resume info' });
      }

      const resumeInfo = FileService.getResumeInfo(transferId, fileId);
      res.json({ success: true, resumeInfo });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async uploadChunk(req, res) {
    const { id: transferId } = req.params;
    const { fileId, chunkIndex, totalChunks, isLastChunk, hash } = req.body;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: 'Chunk buffer missing' });
    }

    let transfer = TransferService.getTransfer(transferId);
    if (!transfer) {
      // Check if transferId is a 6-digit internet code relay session
      const relaySession = RelayService.getSession(transferId);
      if (relaySession) {
        req.params.code = transferId;
        return RelayController.uploadChunk(req, res);
      }
      return res.status(404).json({ success: false, error: 'Transfer session not found or expired' });
    }

    if (transfer.status === 'cancelled' || transfer.status === 'rejected') {
      return res.status(400).json({ success: false, error: `Transfer is ${transfer.status}` });
    }

    try {
      const cIdx = parseInt(chunkIndex, 10);
      const tChunks = parseInt(totalChunks, 10);
      const chunkSize = req.file.buffer.length;

      await FileService.appendChunk(transferId, fileId, cIdx, req.file.buffer);
      const progressData = TransferService.updateChunkProgress(transferId, fileId, cIdx, tChunks, chunkSize);

      const io = req.app.get('io');
      if (io) {
        io.emit('transfer:progress', {
          transferId,
          fileId,
          progressPercent: progressData.progressPercent,
          bytesTransferred: progressData.transfer.bytesTransferred,
          totalBytes: progressData.transfer.totalBytes,
          file: progressData.file
        });
      }

      const lastChunkFlag = isLastChunk === 'true' || isLastChunk === true || cIdx === tChunks - 1;

      if (lastChunkFlag) {
        const fileObj = transfer.files.find(f => f.id === fileId);
        const originalName = fileObj ? fileObj.name : 'unnamed_file';
        const expectedHash = hash || (fileObj ? fileObj.hash : null);

        const finalizeResult = await FileService.finalizeUpload(
          transferId,
          fileId,
          originalName,
          expectedHash
        );

        if (!finalizeResult.success) {
          TransferService.cancelTransfer(transferId, finalizeResult.error);
          if (io) {
            io.emit('transfer:failed', { transferId, fileId, error: finalizeResult.error });
          }
          return res.status(422).json({ success: false, error: finalizeResult.error });
        }

        const updatedTransfer = TransferService.markFileComplete(transferId, fileId, finalizeResult);

        if (updatedTransfer && updatedTransfer.status === 'completed') {
          if (io) {
            io.emit('transfer:completed', { transferId, transfer: updatedTransfer });
          }
        }

        return res.json({
          success: true,
          completed: true,
          fileCompleted: true,
          finalFile: finalizeResult.filename,
          hashVerified: true,
          hash: finalizeResult.hash
        });
      }

      return res.json({
        success: true,
        completed: false,
        chunkIndex: cIdx
      });

    } catch (err) {
      logger.error(`Error uploading chunk ${chunkIndex} for transfer ${transferId}:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const transfer = TransferService.cancelTransfer(id, reason);

      const io = req.app.get('io');
      if (io) {
        io.emit('transfer:cancelled', { transferId: id, reason });
      }

      res.json({ success: true, transfer });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static getStatus(req, res) {
    try {
      const { id } = req.params;
      const transfer = TransferService.getTransfer(id);
      if (!transfer) {
        return res.status(404).json({ success: false, error: 'Transfer not found' });
      }
      res.json({ success: true, transfer });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static getHistory(req, res) {
    try {
      const transfers = MetadataStore.getTransfers();
      res.json({ success: true, transfers });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static downloadFile(req, res) {
    try {
      const { id } = req.params;
      const transfers = MetadataStore.getTransfers();

      let targetFile = null;
      for (const t of transfers) {
        if (t.files) {
          const match = t.files.find(f => f.id === id || f.storedName === id);
          if (match && match.filePath && fs.existsSync(match.filePath)) {
            targetFile = match;
            break;
          }
        }
      }

      if (!targetFile) {
        return res.status(404).json({ success: false, error: 'File not found on disk' });
      }

      res.download(targetFile.filePath, targetFile.name);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static deleteFile(req, res) {
    try {
      const { id } = req.params;
      const transfers = MetadataStore.getTransfers();

      let deleted = false;
      for (const t of transfers) {
        if (t.files) {
          const fileIndex = t.files.findIndex(f => f.id === id || f.storedName === id);
          if (fileIndex !== -1) {
            const fileObj = t.files[fileIndex];
            if (fileObj.filePath && fs.existsSync(fileObj.filePath)) {
              fs.unlinkSync(fileObj.filePath);
            }
            t.files.splice(fileIndex, 1);
            deleted = true;
            MetadataStore.updateTransfer(t.id, { files: t.files });
            break;
          }
        }
      }

      if (!deleted) {
        MetadataStore.deleteTransfer(id);
      }

      res.json({ success: true, deleted: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
