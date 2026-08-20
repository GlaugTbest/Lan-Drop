const dgram = require('dgram');
const { EventEmitter } = require('events');

const BEACON_PORT = 41234;
const BEACON_INTERVAL_MS = 3000;
const OFFLINE_AFTER_MS = 12000;
const SWEEP_INTERVAL_MS = 5000;

class Discovery extends EventEmitter {
  constructor({ id, getName, httpPort }) {
    super();
    this.id = id;
    this.getName = getName;
    this.httpPort = httpPort;
    this.peers = new Map(); // id -> { id, name, ip, httpPort, lastSeen }
  }

  start() {
    this._startListener();
    this._startBroadcasting();
    this._sweepTimer = setInterval(() => this._sweepOfflinePeers(), SWEEP_INTERVAL_MS);
  }

  stop() {
    clearInterval(this._beaconTimer);
    clearInterval(this._sweepTimer);
    this.listener?.close();
    this.sender?.close();
  }

  listPeers() {
    return Array.from(this.peers.values()).map(({ id, name, ip, httpPort }) => ({
      id,
      name,
      ip,
      httpPort
    }));
  }

  _startListener() {
    this.listener = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    this.listener.on('message', (msg, rinfo) => {
      let packet;
      try {
        packet = JSON.parse(msg.toString());
      } catch {
        return;
      }
      if (packet.type !== 'lan-drop-announce' || packet.id === this.id) return;

      const isNew = !this.peers.has(packet.id);
      this.peers.set(packet.id, {
        id: packet.id,
        name: packet.name,
        ip: rinfo.address,
        httpPort: packet.httpPort,
        lastSeen: Date.now()
      });
      if (isNew) this.emit('changed', this.listPeers());
    });

    this.listener.on('error', (err) => {
      console.error('[discovery] listener error:', err.message);
    });

    this.listener.bind(BEACON_PORT, () => {
      this.listener.setBroadcast(true);
    });
  }

  _startBroadcasting() {
    this.sender = dgram.createSocket('udp4');
    this.sender.bind(() => {
      this.sender.setBroadcast(true);
      this._beaconTimer = setInterval(() => this._sendBeacon(), BEACON_INTERVAL_MS);
      this._sendBeacon();
    });
  }

  _sendBeacon() {
    const payload = Buffer.from(
      JSON.stringify({
        type: 'lan-drop-announce',
        id: this.id,
        name: this.getName(),
        httpPort: this.httpPort
      })
    );
    this.sender.send(payload, 0, payload.length, BEACON_PORT, '255.255.255.255', (err) => {
      if (err) console.error('[discovery] beacon error:', err.message);
    });
  }

  _sweepOfflinePeers() {
    const now = Date.now();
    let changed = false;
    for (const [id, peer] of this.peers) {
      if (now - peer.lastSeen > OFFLINE_AFTER_MS) {
        this.peers.delete(id);
        changed = true;
      }
    }
    if (changed) this.emit('changed', this.listPeers());
  }
}

module.exports = { Discovery, BEACON_PORT };
