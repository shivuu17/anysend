export function parseQrPayload(qrString) {
  try {
    const data = JSON.parse(qrString);
    if (data && data.host && data.port && data.sessionId) {
      return { valid: true, payload: data };
    }
    return { valid: false, error: 'Invalid AnySend QR code schema' };
  } catch (err) {
    return { valid: false, error: 'Malformed JSON payload in QR code' };
  }
}

export function getApiBaseUrl() {
  const windowHost = window.location.hostname;
  const windowPort = window.location.port;

  if (!windowPort || windowPort === '3000') {
    return `http://${windowHost}:5000`;
  }

  return `${window.location.protocol}//${window.location.host}`;
}
