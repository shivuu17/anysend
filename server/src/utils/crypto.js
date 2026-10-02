import crypto from 'crypto';
import fs from 'fs';

export function generateToken(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

export function generateSessionId() {
  return 'sess_' + crypto.randomBytes(8).toString('hex');
}

export function generateTransferId() {
  return 'tr_' + crypto.randomBytes(8).toString('hex');
}

/**
 * Calculates SHA-256 hash of a file using Node.js readable stream.
 * Does not load the whole file into RAM.
 */
export function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', chunk => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', err => {
      reject(err);
    });
  });
}
