import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_PORT = process.env.PORT || 5000;
export const DEFAULT_DEVICE_NAME = process.env.DEVICE_NAME || 'AnySend Host';
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
export const TEMP_UPLOAD_DIR = path.resolve(UPLOAD_DIR, 'temp');
export const METADATA_FILE = path.resolve(UPLOAD_DIR, 'transfers.json');
export const SETTINGS_FILE = path.resolve(UPLOAD_DIR, 'settings.json');

export const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const PROTOCOL_VERSION = 1;
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024 * 1024; // 100 GB limit
