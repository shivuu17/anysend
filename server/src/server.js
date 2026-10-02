import express from 'express';
import http from 'http';
import https from 'https';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { DEFAULT_PORT, UPLOAD_DIR } from './config/constants.js';
import { getLocalIpAddresses } from './utils/network.js';
import { logger } from './utils/logger.js';
import { ensureDirectoriesExist } from './storage/metadataStore.js';
import { setupSocketHandler } from './sockets/socketHandler.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads and metadata directories exist
ensureDirectoriesExist();

const app = express();

let server;
let protocol = 'http';

const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCertPath = process.env.SSL_CERT_PATH;

if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  const options = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };
  server = https.createServer(options, app);
  protocol = 'https';
  logger.info('🔒 HTTPS SSL certificates loaded successfully.');
} else {
  server = http.createServer(app);
}

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

app.set('io', io);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(UPLOAD_DIR));

const clientBuildPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.use('/api', apiRoutes);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>AnySend Backend</title></head>
        <body style="font-family: system-ui; padding: 2rem; background: #FAF7F0; color: #121212;">
          <h2>AnySend Backend Service Active</h2>
          <p>API status: <a href="/api/health">/api/health</a></p>
          <p>Device info: <a href="/api/device/info">/api/device/info</a></p>
        </body>
      </html>
    `);
  }
});

setupSocketHandler(io);
app.use(errorHandler);

const PORT = process.env.PORT || DEFAULT_PORT;

server.listen(PORT, '0.0.0.0', () => {
  const { primaryIp, allAddresses } = getLocalIpAddresses();
  logger.info(`=======================================================`);
  logger.info(`🚀 AnySend Server running on port ${PORT} (${protocol.toUpperCase()})`);
  logger.info(`📡 Primary Local IP: ${protocol}://${primaryIp}:${PORT}`);
  allAddresses.forEach(addr => {
    logger.info(`   - Network Interface (${addr.interface}): ${protocol}://${addr.address}:${PORT}`);
  });
  logger.info(`=======================================================`);
});
