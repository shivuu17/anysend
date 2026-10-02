import { getLocalIpAddresses } from '../utils/network.js';
import { MetadataStore } from '../storage/metadataStore.js';
import { PROTOCOL_VERSION } from '../config/constants.js';

export class DeviceController {
  static getDeviceInfo(req, res) {
    try {
      const { primaryIp, primaryInterface, allAddresses } = getLocalIpAddresses();
      const settings = MetadataStore.getSettings();

      res.json({
        success: true,
        version: PROTOCOL_VERSION,
        deviceName: settings.deviceName || 'LocalDrop Host',
        ip: primaryIp,
        interface: primaryInterface,
        allAddresses,
        port: req.socket.localPort || process.env.PORT || 5000,
        settings
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static getSettings(req, res) {
    try {
      const settings = MetadataStore.getSettings();
      res.json({ success: true, settings });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static updateSettings(req, res) {
    try {
      const updated = MetadataStore.updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
