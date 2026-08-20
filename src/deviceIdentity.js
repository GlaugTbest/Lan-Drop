const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_PORT = 4000;

// Two instances started from the same folder on the same machine (e.g. to
// test send/receive locally before having a second physical device) must
// not share an identity file: discovery filters out a peer whose id matches
// this.id, so two instances with the same id silently ignore each other.
// The default port keeps the plain `config.json` name so existing installs
// aren't orphaned; any other port gets its own file.
function configPath(port) {
  const suffix = port && port !== DEFAULT_PORT ? `-${port}` : '';
  return path.join(__dirname, '..', `config${suffix}.json`);
}

function load(port) {
  const configPath_ = configPath(port);
  if (fs.existsSync(configPath_)) {
    try {
      return JSON.parse(fs.readFileSync(configPath_, 'utf8'));
    } catch {
      // fall through to regenerate a fresh identity
    }
  }
  const identity = {
    id: crypto.randomUUID(),
    name: os.hostname() || 'Dispositivo LAN Drop'
  };
  save(identity, port);
  return identity;
}

function save(identity, port) {
  fs.writeFileSync(configPath(port), JSON.stringify(identity, null, 2));
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
