import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR, TEMP_UPLOAD_DIR, METADATA_FILE, SETTINGS_FILE, DEFAULT_DEVICE_NAME } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export function ensureDirectoriesExist() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
    fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
  }

  if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      deviceName: DEFAULT_DEVICE_NAME,
      downloadFolder: UPLOAD_DIR,
      autoAccept: false,
      maxConcurrentTransfers: 5,
      theme: 'system'
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
  }
}

export class MetadataStore {
  static getTransfers() {
    try {
      ensureDirectoriesExist();
      const data = fs.readFileSync(METADATA_FILE, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      logger.error('Failed to read transfer metadata:', err);
      return [];
    }
  }

  static addTransfer(transferRecord) {
    try {
      const transfers = this.getTransfers();
      transfers.unshift(transferRecord);
      fs.writeFileSync(METADATA_FILE, JSON.stringify(transfers, null, 2), 'utf-8');
      return transferRecord;
    } catch (err) {
      logger.error('Failed to save transfer metadata:', err);
      throw err;
    }
  }

  static updateTransfer(transferId, updates) {
    try {
      const transfers = this.getTransfers();
      const index = transfers.findIndex(t => t.id === transferId);
      if (index !== -1) {
        transfers[index] = { ...transfers[index], ...updates, updatedAt: new Date().toISOString() };
        fs.writeFileSync(METADATA_FILE, JSON.stringify(transfers, null, 2), 'utf-8');
        return transfers[index];
      }
      return null;
    } catch (err) {
      logger.error('Failed to update transfer metadata:', err);
      throw err;
    }
  }

  static deleteTransfer(transferId) {
    try {
      let transfers = this.getTransfers();
      const target = transfers.find(t => t.id === transferId);
      transfers = transfers.filter(t => t.id !== transferId);
      fs.writeFileSync(METADATA_FILE, JSON.stringify(transfers, null, 2), 'utf-8');
      return target;
    } catch (err) {
      logger.error('Failed to delete transfer metadata:', err);
      throw err;
    }
  }

  static getSettings() {
    try {
      ensureDirectoriesExist();
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data || '{}');
    } catch (err) {
      logger.error('Failed to read settings:', err);
      return {
        deviceName: DEFAULT_DEVICE_NAME,
        downloadFolder: UPLOAD_DIR,
        autoAccept: false,
        maxConcurrentTransfers: 5,
        theme: 'system'
      };
    }
  }

  static updateSettings(updates) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...updates };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch (err) {
      logger.error('Failed to update settings:', err);
      throw err;
    }
  }
}
