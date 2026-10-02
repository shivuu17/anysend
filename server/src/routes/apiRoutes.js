import express from 'express';
import multer from 'multer';
import { DeviceController } from '../controllers/deviceController.js';
import { SessionController } from '../controllers/sessionController.js';
import { TransferController } from '../controllers/transferController.js';
import { RelayController } from '../controllers/relayController.js';
import { apiLimiter, sessionCreateLimiter, chunkUploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Apply global API rate limiter
router.use(apiLimiter);

// Health & Device Info
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
router.get('/device/info', DeviceController.getDeviceInfo);
router.get('/device/settings', DeviceController.getSettings);
router.post('/device/settings', DeviceController.updateSettings);

// Session & QR Pairing
router.post('/session/create', sessionCreateLimiter, SessionController.createSession);
router.post('/session/validate', SessionController.validateSession);

// Transfer Management (Local Wi-Fi)
router.post('/transfer/request', sessionCreateLimiter, TransferController.createRequest);
router.post('/transfer/:id/accept', TransferController.accept);
router.post('/transfer/:id/reject', TransferController.reject);
router.get('/transfer/:id/resume-info', TransferController.getResumeInfo);
router.post('/transfer/:id/chunk', chunkUploadLimiter, upload.single('chunk'), TransferController.uploadChunk);
router.post('/transfer/:id/cancel', TransferController.cancel);
router.get('/transfer/:id/status', TransferController.getStatus);

// Internet 6-Digit Code Relay Transfer (Cross-Network)
router.post('/relay/create', sessionCreateLimiter, RelayController.create);
router.post('/relay/lookup', RelayController.lookup);
router.post('/relay/pair', RelayController.pair);
router.post('/relay/:code/chunk', chunkUploadLimiter, upload.single('chunk'), RelayController.uploadChunk);
router.get('/relay/:code/download', RelayController.download);
router.post('/relay/:code/cancel', RelayController.cancel);

// Transfers History & Download
router.get('/transfers', TransferController.getHistory);
router.get('/files/download/:id', TransferController.downloadFile);
router.delete('/files/:id', TransferController.deleteFile);

export default router;
