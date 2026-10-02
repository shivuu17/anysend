import { logger } from '../utils/logger.js';
import { TransferService } from '../services/transferService.js';
import { SessionService } from '../services/sessionService.js';

// Map socketId -> device details
const connectedDevices = new Map();

export function setupSocketHandler(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Register device info
    socket.on('device:register', (data) => {
      const device = {
        socketId: socket.id,
        deviceName: data.deviceName || 'Unknown Device',
        deviceType: data.deviceType || 'web',
        isReceiver: !!data.isReceiver,
        registeredAt: new Date().toISOString()
      };
      connectedDevices.set(socket.id, device);
      logger.info(`Device registered: ${device.deviceName} (${socket.id}) [Receiver: ${device.isReceiver}]`);

      // Broadcast list of active receivers to all sockets
      broadcastReceivers(io);
    });

    // Sender requests file transfer
    socket.on('transfer:request', (payload, callback) => {
      try {
        const { senderDevice, files, sessionId, token } = payload;

        // Session validation
        if (sessionId) {
          const val = SessionService.validateSession(sessionId, token);
          if (!val.valid) {
            if (callback) callback({ success: false, error: val.reason });
            return;
          }
        }

        const transfer = TransferService.createTransferRequest({
          senderDevice,
          files,
          sessionId,
          token
        });

        // Broadcast incoming request to receiver sockets
        io.emit('transfer:incoming', {
          transfer,
          senderSocketId: socket.id
        });

        logger.info(`Broadcasted incoming transfer request ${transfer.id}`);
        if (callback) callback({ success: true, transferId: transfer.id, transfer });
      } catch (err) {
        logger.error('Error handling transfer:request socket event:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Receiver approves incoming transfer
    socket.on('transfer:accept', (data) => {
      try {
        const { transferId } = data;
        const transfer = TransferService.acceptTransfer(transferId);
        
        // Notify all sockets that transfer was accepted
        io.emit('transfer:accepted', { transferId, transfer });
        logger.info(`Socket emitted transfer:accepted for ${transferId}`);
      } catch (err) {
        logger.error(`Error accepting transfer ${data.transferId}:`, err);
      }
    });

    // Receiver rejects incoming transfer
    socket.on('transfer:reject', (data) => {
      try {
        const { transferId, reason } = data;
        const transfer = TransferService.rejectTransfer(transferId, reason);

        io.emit('transfer:rejected', { transferId, reason });
        logger.info(`Socket emitted transfer:rejected for ${transferId}`);
      } catch (err) {
        logger.error(`Error rejecting transfer ${data.transferId}:`, err);
      }
    });

    // Cancel ongoing transfer
    socket.on('transfer:cancel', (data) => {
      try {
        const { transferId, reason } = data;
        TransferService.cancelTransfer(transferId, reason);

        io.emit('transfer:cancelled', { transferId, reason });
        logger.info(`Socket emitted transfer:cancelled for ${transferId}`);
      } catch (err) {
        logger.error(`Error cancelling transfer ${data.transferId}:`, err);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      connectedDevices.delete(socket.id);
      broadcastReceivers(io);
    });
  });
}

function broadcastReceivers(io) {
  const receivers = Array.from(connectedDevices.values()).filter(d => d.isReceiver);
  io.emit('receivers:list', receivers);
}
