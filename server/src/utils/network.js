import os from 'os';

/**
 * Returns a list of active non-internal IPv4 addresses and selects a primary address.
 */
export function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const interfaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[interfaceName]) {
      // Filter out internal (127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: interfaceName,
          address: iface.address,
          netmask: iface.netmask,
          mac: iface.mac,
        });
      }
    }
  }

  // Prioritize typical Wi-Fi / LAN IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const primary = addresses.find(addr => 
    addr.address.startsWith('192.168.') ||
    addr.address.startsWith('10.') ||
    (addr.address.startsWith('172.') && parseInt(addr.address.split('.')[1], 10) >= 16 && parseInt(addr.address.split('.')[1], 10) <= 31)
  ) || addresses[0] || { address: '127.0.0.1', interface: 'loopback' };

  return {
    primaryIp: primary.address,
    primaryInterface: primary.interface,
    allAddresses: addresses,
  };
}
