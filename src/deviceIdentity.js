const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

function load() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch {
      // fall through to regenerate a fresh identity
    }
  }
  const identity = {
    id: crypto.randomUUID(),
    name: os.hostname() || 'Dispositivo LAN Drop'
  };
  save(identity);
  return identity;
}

function save(identity) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(identity, null, 2));
}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

module.exports = { load, save, getLocalIp };
