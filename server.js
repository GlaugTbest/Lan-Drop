const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');

const deviceIdentity = require('./src/deviceIdentity');
const { Discovery } = require('./src/discovery');
const { computeSha256, relayFile } = require('./src/transfer');

const HTTP_PORT = Number(process.env.PORT) || 4000;
const RECEIVED_DIR = path.join(__dirname, 'received');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

for (const dir of [RECEIVED_DIR, UPLOADS_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const identity = deviceIdentity.load();
const localIp = deviceIdentity.getLocalIp();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/downloads', express.static(RECEIVED_DIR));

const upload = multer({ dest: UPLOADS_DIR });

const discovery = new Discovery({
  id: identity.id,
  getName: () => identity.name,
  httpPort: HTTP_PORT
});

discovery.on('changed', (peers) => io.emit('devices-updated', peers));
discovery.start();

app.get('/api/self', (req, res) => {
  res.json({ id: identity.id, name: identity.name, ip: localIp, httpPort: HTTP_PORT });
});

app.get('/api/devices', (req, res) => {
  res.json(discovery.listPeers());
});

app.post('/api/name', express.json(), (req, res) => {
  const name = (req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Nome invalido.' });
  identity.name = name.slice(0, 60);
  deviceIdentity.save(identity);
  res.json({ ok: true, name: identity.name });
});

// Leg 1: browser uploads the file to its own LAN Drop instance.
// Leg 2: this instance relays the file directly to the target device
// and only confirms success to the browser once the target has verified
// the SHA-256 checksum end-to-end.
app.post('/api/send', upload.single('file'), async (req, res) => {
  const { targetId, socketId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  const target = discovery.listPeers().find((p) => p.id === targetId);
  if (!target) {
    fs.unlink(file.path, () => {});
    return res.status(404).json({ error: 'Dispositivo destino nao encontrado na rede.' });
  }

  const transferId = crypto.randomUUID();
  res.json({ transferId });

  try {
    const checksum = await computeSha256(file.path);

    const result = await relayFile({
      filePath: file.path,
      filename: file.originalname,
      size: file.size,
      checksum,
      senderName: identity.name,
      transferId,
      target,
      onProgress: (percent) => {
        if (socketId) io.to(socketId).emit('transfer-progress', { transferId, percent });
      }
    });

    if (socketId) {
      io.to(socketId).emit('transfer-complete', {
        transferId,
        integrityOk: result.ok !== false,
        target: target.name
      });
    }
  } catch (err) {
    if (socketId) io.to(socketId).emit('transfer-error', { transferId, message: err.message });
  } finally {
    fs.unlink(file.path, () => {});
  }
});

// Receiving end: another LAN Drop instance streams a file directly here.
app.post('/api/receive', (req, res) => {
  const filenameRaw = req.headers['x-filename'];
  const checksumExpected = req.headers['x-checksum'];
  const senderName = decodeURIComponent(req.headers['x-sender-name'] || 'Dispositivo desconhecido');
  const transferId = req.headers['x-transfer-id'] || crypto.randomUUID();

  if (!filenameRaw || !checksumExpected) {
    res.status(400).json({ error: 'Cabecalhos de transferencia ausentes.' });
    return;
  }

  const originalName = decodeURIComponent(filenameRaw);
  const safeName = `${Date.now()}-${originalName.replace(/[/\\?%*:|"<>]/g, '_')}`;
  const destPath = path.join(RECEIVED_DIR, safeName);

  const hash = crypto.createHash('sha256');
  const writeStream = fs.createWriteStream(destPath);

  req.on('data', (chunk) => hash.update(chunk));
  req.pipe(writeStream);

  req.on('error', (err) => {
    writeStream.destroy();
    fs.unlink(destPath, () => {});
    res.status(500).json({ error: err.message });
  });

  writeStream.on('finish', () => {
    const actualChecksum = hash.digest('hex');
    const ok = actualChecksum === checksumExpected;

    io.emit('file-received', {
      name: originalName,
      size: fs.statSync(destPath).size,
      from: senderName,
      ok,
      downloadUrl: `/downloads/${encodeURIComponent(safeName)}`
    });

    res.json({ ok, transferId });
  });

  writeStream.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
});

io.on('connection', (socket) => {
  socket.emit('devices-updated', discovery.listPeers());
});

server.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`LAN Drop rodando em http://${localIp}:${HTTP_PORT}`);
  console.log(`Dispositivo: ${identity.name} (${identity.id})`);
});

process.on('SIGINT', () => {
  discovery.stop();
  process.exit(0);
});
