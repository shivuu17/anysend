export function parseQrPayload(qrString) {
  try {
    const data = JSON.parse(qrString);
    if (data && (data.code || (data.host && data.sessionId))) {
      return { valid: true, payload: data };
    }
    return { valid: false, error: 'Invalid AnySend QR code schema' };
  } catch (err) {
    if (typeof qrString === 'string' && qrString.includes('code=')) {
      const match = qrString.match(/code=(\d{6})/);
      if (match) {
        return { valid: true, payload: { code: match[1], isRelay: true } };
      }
    }
    return { valid: false, error: 'Malformed payload in QR code' };
  }
}

export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const windowHost = window.location.hostname;
  const windowPort = window.location.port;

  // Local standalone development (Vite running on 3000 without proxy)
  if (windowPort === '3000') {
    return `http://${windowHost}:5000`;
  }

  // If running on Vercel or custom domain, use same origin relative path or Render backend fallback
  if (windowHost && windowHost !== 'localhost' && !windowHost.includes('127.0.0.1')) {
    return `${window.location.protocol}//${window.location.host}`;
  }

  return 'https://anysend-hrvy.onrender.com';
}
