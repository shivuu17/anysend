import fs from 'fs';
import { RelayService } from '../services/relayService.js';
import { MetadataStore } from '../storage/metadataStore.js';
import { logger } from '../utils/logger.js';

export class RelayController {
  static create(req, res) {
    try {
      const { files, senderDevice, socketId } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files provided for code generation' });
      }

      const session = RelayService.createSession({
        files,
        senderDevice,
        senderSocketId: socketId
      });

      res.json({
        success: true,
        code: session.code,
        formattedCode: session.formattedCode,
        session
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static lookup(req, res) {
    try {
      const { code } = req.body;
      const session = RelayService.getSession(code);

      if (!session) {
        return res.status(404).json({ success: false, error: 'Invalid or expired 6-digit code' });
      }

      res.json({
        success: true,
        code: session.code,
        formattedCode: session.formattedCode,
        senderDevice: session.senderDevice,
        files: session.files,
        totalBytes: session.totalBytes,
        status: session.status
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static pair(req, res) {
    try {
      const { code, socketId } = req.body;
      const result = RelayService.pairReceiver(code, socketId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      const io = req.app.get('io');
      if (io) {
        io.emit(`relay:${result.session.code}:paired`, { session: result.session });
      }

      res.json({ success: true, session: result.session });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async uploadChunk(req, res) {
    const { code } = req.params;
    const { fileId, chunkIndex, totalChunks, isLastChunk, hash } = req.body;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: 'Chunk buffer missing' });
    }

    const session = RelayService.getSession(code);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Relay code session expired' });
    }

    try {
      const cIdx = parseInt(chunkIndex, 10);
      const tChunks = parseInt(totalChunks, 10);
      const chunkSize = req.file.buffer.length;

      await RelayService.appendChunk(code, fileId, cIdx, req.file.buffer);
      const progress = RelayService.updateProgress(code, fileId, cIdx, tChunks, chunkSize);

      const io = req.app.get('io');
      if (io) {
        io.emit(`relay:${session.code}:progress`, {
          code: session.code,
          fileId,
          percent: progress.percent,
          bytesTransferred: progress.session.bytesTransferred,
          totalBytes: progress.session.totalBytes
        });
      }

      const lastChunkFlag = isLastChunk === 'true' || isLastChunk === true || cIdx === tChunks - 1;

      if (lastChunkFlag) {
        const fileObj = session.files.find(f => f.id === fileId);
        const originalName = fileObj ? fileObj.name : 'unnamed_file';
        const expectedHash = hash || (fileObj ? fileObj.hash : null);

        const finalizeResult = await RelayService.finalizeFile(code, fileId, originalName, expectedHash);

        if (!finalizeResult.success) {
          RelayService.cancelSession(code, finalizeResult.error);
          if (io) io.emit(`relay:${session.code}:failed`, { error: finalizeResult.error });
          return res.status(422).json({ success: false, error: finalizeResult.error });
        }

        const completed = RelayService.completeSession(code, finalizeResult);
        if (io) io.emit(`relay:${session.code}:completed`, { session: completed, finalizedFile: finalizeResult });

        return res.json({
          success: true,
          completed: true,
          finalFile: finalizeResult.filename,
          hash: finalizeResult.hash
        });
      }

      return res.json({ success: true, completed: false, chunkIndex: cIdx });
    } catch (err) {
      logger.error(`Error uploading relay chunk for code ${code}:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static download(req, res) {
    try {
      const { code } = req.params;
      const cleanCode = RelayService.sanitizeCodeInput(code);
      const session = RelayService.getSession(cleanCode);

      if (session && session.finalFile && fs.existsSync(session.finalFile.filePath)) {
        const fileObj = session.files[0];
        const filename = fileObj ? fileObj.name : session.finalFile.filename;
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        return res.download(session.finalFile.filePath, filename);
      }

      // Fallback: Check MetadataStore history for relay_<cleanCode>
      const transfers = MetadataStore.getTransfers();
      const match = transfers.find(t => t.id === `relay_${cleanCode}`);
      if (match && match.files && match.files[0] && match.files[0].filePath && fs.existsSync(match.files[0].filePath)) {
        const filename = match.files[0].name;
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        return res.download(match.files[0].filePath, filename);
      }

      return res.status(404).json({ success: false, error: 'File not ready or expired' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static cancel(req, res) {
    try {
      const { code } = req.params;
      RelayService.cancelSession(code, 'Cancelled by user');

      const io = req.app.get('io');
      if (io) {
        io.emit(`relay:${code}:cancelled`, { reason: 'Cancelled by user' });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
