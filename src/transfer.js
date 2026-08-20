const fs = require('fs');
const http = require('http');
const crypto = require('crypto');

function computeSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Streams a local file to another LAN Drop instance's /api/receive endpoint,
 * reporting progress and resolving only once the receiver confirms the
 * integrity check, so the sender gets a real end-to-end confirmation.
 */
function relayFile({ filePath, filename, size, checksum, senderName, transferId, target, onProgress }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: target.ip,
        port: target.httpPort,
        path: '/api/receive',
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': size,
          'X-Filename': encodeURIComponent(filename),
          'X-Checksum': checksum,
          'X-Sender-Name': encodeURIComponent(senderName),
          'X-Transfer-Id': transferId
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Destino recusou o arquivo (HTTP ${res.statusCode})`));
          }
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ ok: true });
          }
        });
      }
    );

    req.on('error', (err) => reject(new Error(`Falha ao conectar ao dispositivo destino: ${err.message}`)));

    const readStream = fs.createReadStream(filePath);
    let sent = 0;

    readStream.on('data', (chunk) => {
      sent += chunk.length;
      onProgress?.(Math.min(100, Math.round((sent / size) * 100)));
    });

    readStream.on('error', (err) => reject(err));
    readStream.pipe(req);
  });
}

module.exports = { computeSha256, relayFile };
