import { SessionService } from '../services/sessionService.js';

export class SessionController {
  static createSession(req, res) {
    try {
      const port = req.socket.localPort || process.env.PORT || 5000;
      const { customHost } = req.body || {};
      const session = SessionService.createSession(port, customHost);

      res.json({
        success: true,
        session
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static validateSession(req, res) {
    try {
      const { sessionId, token } = req.body;
      const result = SessionService.validateSession(sessionId, token);

      if (!result.valid) {
        return res.status(401).json({ success: false, error: result.reason });
      }

      res.json({ success: true, session: result.session });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
