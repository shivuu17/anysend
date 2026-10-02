const ADJECTIVES = [
  'Neon', 'Cyber', 'Cosmic', 'Hyper', 'Quantum', 'Sonic', 'Velvet',
  'Electric', 'Astro', 'Solar', 'Lunar', 'Turbo', 'Vortex', 'Shadow',
  'Starlight', 'Glitch', 'Pixel', 'Blaze', 'Thunder', 'Spectra',
  'Phantom', 'Pulse', 'Zenith', 'Apex', 'Orbit', 'Mirage', 'Titan',
  'Vapor', 'Aura', 'Fusion', 'Silver', 'Golden', 'Mystic', 'Cobalt',
  'Radiant', 'Stellar', 'Sovereign', 'Astral', 'Obsidian', 'Luminous'
];

const NOUNS = [
  'Falcon', 'Tiger', 'Dolphin', 'Phoenix', 'Panther', 'Lynx', 'Dragon',
  'Hawk', 'Cheetah', 'Fox', 'Whale', 'Raven', 'Cobra', 'Eagle',
  'Jaguar', 'Owl', 'Viper', 'Wolf', 'Leopard', 'Panda', 'Griffin',
  'Stallion', 'Puma', 'Bison', 'Condor', 'Mantis', 'Orca', 'Sphinx',
  'Pegasus', 'Kraken', 'Raptor', 'Valkyrie', 'Sentinel', 'Vanguard'
];

export function generateCoolDeviceName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}
