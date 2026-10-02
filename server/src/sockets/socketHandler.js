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
        const { senderDevice, receiverSocketId, targetDevice, files, sessionId, token } = payload;
        const targetSocketId = receiverSocketId || (targetDevice ? targetDevice.socketId : null);

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
          senderSocketId: socket.id,
          receiverSocketId: targetSocketId,
          files,
          sessionId,
          token
        });

        // Join private transfer room for sender
        const transferRoom = `transfer_room_${transfer.id}`;
        socket.join(transferRoom);

        if (targetSocketId && io.sockets.sockets.get(targetSocketId)) {
          const targetSocket = io.sockets.sockets.get(targetSocketId);
          targetSocket.join(transferRoom);
          io.to(targetSocketId).emit('transfer:incoming', { transfer });
          logger.info(`Targeted transfer:incoming ${transfer.id} to receiver socket ${targetSocketId}`);
        } else {
          // Fallback: emit to other connected sockets excluding sender
          socket.broadcast.emit('transfer:incoming', { transfer });
          logger.info(`Broadcasted incoming transfer request ${transfer.id} excluding sender`);
        }

        if (callback) callback({ success: true, transferId: transfer.id, transfer });
      } catch (err) {
        logger.error('Error handling transfer:request socket event:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Receiver approves incoming transfer
    socket.on('transfer:accept', (data, callback) => {
      try {
        const { transferId } = data;
        const transfer = TransferService.acceptTransfer(transferId, socket.id);
        const transferRoom = `transfer_room_${transferId}`;

        socket.join(transferRoom);
        
        // Notify ONLY sender & assigned receiver in the private transfer room
        io.to(transferRoom).emit('transfer:accepted', { transferId, transfer });
        logger.info(`Socket emitted transfer:accepted to room ${transferRoom}`);
        if (callback) callback({ success: true, transfer });
      } catch (err) {
        logger.error(`Error accepting transfer ${data?.transferId}:`, err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Receiver rejects incoming transfer
    socket.on('transfer:reject', (data, callback) => {
      try {
        const { transferId, reason } = data;
        const defaultReason = reason || 'Receiver declined the approval';
        const transfer = TransferService.rejectTransfer(transferId, socket.id, defaultReason);
        const transferRoom = `transfer_room_${transferId}`;

        io.to(transferRoom).emit('transfer:rejected', { transferId, reason: defaultReason });
        logger.info(`Socket emitted transfer:rejected to room ${transferRoom}`);
        if (callback) callback({ success: true, transfer });
      } catch (err) {
        logger.error(`Error rejecting transfer ${data?.transferId}:`, err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Cancel ongoing transfer
    socket.on('transfer:cancel', (data, callback) => {
      try {
        const { transferId, reason } = data;
        TransferService.cancelTransfer(transferId, reason);
        const transferRoom = `transfer_room_${transferId}`;

        io.to(transferRoom).emit('transfer:cancelled', { transferId, reason });
        logger.info(`Socket emitted transfer:cancelled to room ${transferRoom}`);
        if (callback) callback({ success: true });
      } catch (err) {
        logger.error(`Error cancelling transfer ${data?.transferId}:`, err);
        if (callback) callback({ success: false, error: err.message });
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
