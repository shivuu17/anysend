import { generateSessionId, generateToken } from '../utils/crypto.js';
import { getLocalIpAddresses } from '../utils/network.js';
import { PROTOCOL_VERSION, SESSION_TTL_MS } from '../config/constants.js';

// In-memory store for active pairing sessions
const activeSessions = new Map();

export class SessionService {
  /**
   * Creates a new pairing session with temporary QR payload details.
   */
  static createSession(port, customHost = null) {
    const sessionId = generateSessionId();
    const token = generateToken(16);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    const { primaryIp } = getLocalIpAddresses();
    const host = customHost || primaryIp;

    const sessionData = {
      version: PROTOCOL_VERSION,
      host,
      port: parseInt(port, 10),
      sessionId,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
      activeTransfers: []
    };

    activeSessions.set(sessionId, sessionData);

    return sessionData;
  }

  /**
   * Validates a session payload or token.
   */
  static validateSession(sessionId, token) {
    if (!sessionId || !activeSessions.has(sessionId)) {
      return { valid: false, reason: 'Session not found or expired' };
    }

    const session = activeSessions.get(sessionId);

    if (new Date() > new Date(session.expiresAt)) {
      activeSessions.delete(sessionId);
      return { valid: false, reason: 'Session has expired' };
    }

    if (token && session.token !== token) {
      return { valid: false, reason: 'Invalid session token' };
    }

    return { valid: true, session };
  }

  /**
   * Extends session expiration time.
   */
  static refreshSession(sessionId) {
    if (activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      session.expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
      activeSessions.set(sessionId, session);
      return session;
    }
    return null;
  }

  /**
   * Revokes a session manually.
   */
  static revokeSession(sessionId) {
    return activeSessions.delete(sessionId);
  }

  /**
   * Purges all expired sessions periodically.
   */
  static purgeExpiredSessions() {
    const now = new Date();
    for (const [sessionId, session] of activeSessions.entries()) {
      if (now > new Date(session.expiresAt)) {
        activeSessions.delete(sessionId);
      }
    }
  }
}

// Clean up expired sessions every 5 minutes
setInterval(() => {
  SessionService.purgeExpiredSessions();
}, 5 * 60 * 1000);
