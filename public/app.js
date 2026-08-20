const socket = io();

const deviceNameInput = document.getElementById('deviceName');
const deviceAddress = document.getElementById('deviceAddress');
const deviceList = document.getElementById('deviceList');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectedFileEl = document.getElementById('selectedFile');
const sendBtn = document.getElementById('sendBtn');
const transfersEl = document.getElementById('transfers');
const receivedList = document.getElementById('receivedList');

let selectedFile = null;
let selectedDeviceId = null;
let devices = [];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

function updateSendButton() {
  sendBtn.disabled = !(selectedFile && selectedDeviceId);
}

// --- Self identity ---

fetch('/api/self')
  .then((r) => r.json())
  .then((self) => {
    deviceNameInput.value = self.name;
    deviceAddress.textContent = `${self.ip}:${self.httpPort}`;
  });

deviceNameInput.addEventListener('change', () => {
  const name = deviceNameInput.value.trim();
  if (!name) return;
  fetch('/api/name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
});

// --- Device discovery (the recipients register) ---

function renderDevices() {
  if (devices.length === 0) {
    deviceList.innerHTML = `
      <li class="manifest-empty">
        <span class="listen-blip" aria-hidden="true"></span>
        Nenhum destinatário no registro ainda.
      </li>
    `;
    return;
  }

  deviceList.innerHTML = '';
  for (const device of devices) {
    const li = document.createElement('li');
    const isSelected = device.id === selectedDeviceId;
    li.className = 'manifest-row' + (isSelected ? ' selected' : '');
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-pressed', String(isSelected));
    li.innerHTML = `
      <span class="manifest-signal" aria-hidden="true"></span>
      <span class="manifest-name">${device.name}</span>
      <span class="manifest-leader" aria-hidden="true"></span>
      <span class="manifest-code">${device.ip}:${device.httpPort}</span>
    `;
    const select = () => {
      selectedDeviceId = device.id;
      renderDevices();
      updateSendButton();
    };
    li.addEventListener('click', select);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select();
      }
    });
    deviceList.appendChild(li);
  }
}

socket.on('devices-updated', (list) => {
  devices = list;
  if (selectedDeviceId && !devices.some((d) => d.id === selectedDeviceId)) {
    selectedDeviceId = null;
  }
  renderDevices();
  updateSendButton();
});

// --- File selection ---

function setSelectedFile(file) {
  selectedFile = file;
  selectedFileEl.textContent = file ? `${file.name} · ${formatBytes(file.size)}` : '';
  updateSendButton();
}

fileInput.addEventListener('change', () => setSelectedFile(fileInput.files[0] || null));

['dragenter', 'dragover'].forEach((evt) =>
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  })
);

['dragleave', 'drop'].forEach((evt) =>
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  })
);

dropZone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) setSelectedFile(file);
});

// --- Dispatching (sending) ---

function setTickFill(ticket, percent) {
  ticket.querySelector('.tick-fill').style.transform = `scaleX(${percent / 100})`;
}

function createTicket(transferId, filename, targetName) {
  const ticket = document.createElement('div');
  ticket.className = 'transfer-ticket';
  ticket.id = `transfer-${transferId}`;
  ticket.innerHTML = `
    <div class="ticket-row">
      <span class="ticket-file">${filename} → ${targetName}</span>
      <span class="ticket-status">despachando&hellip;</span>
    </div>
    <div class="tick-track"><div class="tick-fill" style="width:0%"></div></div>
  `;
  transfersEl.prepend(ticket);
  return ticket;
}

sendBtn.addEventListener('click', () => {
  if (!selectedFile || !selectedDeviceId) return;
  const target = devices.find((d) => d.id === selectedDeviceId);
  if (!target) return;

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('targetId', selectedDeviceId);
  formData.append('socketId', socket.id);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/send');

  let ticket = null;

  xhr.upload.addEventListener('progress', (e) => {
    if (!e.lengthComputable) return;
    const percent = Math.round((e.loaded / e.total) * 50); // leg 1 = first half of the track
    if (ticket) setTickFill(ticket, percent);
  });

  xhr.addEventListener('load', () => {
    if (xhr.status !== 200) {
      alert('Não foi possível iniciar o despacho.');
      return;
    }
    const response = JSON.parse(xhr.responseText);
    const transferId = response.transferId;
    ticket = createTicket(transferId, selectedFile.name, target.name);
    setTickFill(ticket, 50);
    pendingTickets[transferId] = ticket;
  });

  xhr.send(formData);

  setSelectedFile(null);
  fileInput.value = '';
});

const pendingTickets = {};

socket.on('transfer-progress', ({ transferId, percent }) => {
  const ticket = pendingTickets[transferId];
  if (!ticket) return;
  const relayPercent = 50 + Math.round(percent / 2); // leg 2 = second half of the track
  setTickFill(ticket, relayPercent);
  ticket.querySelector('.ticket-status').textContent = 'em trânsito…';
});

socket.on('transfer-complete', ({ transferId, integrityOk, target }) => {
  const ticket = pendingTickets[transferId];
  if (!ticket) return;
  ticket.classList.add(integrityOk ? 'done' : 'error');
  setTickFill(ticket, 100);
  ticket.querySelector('.ticket-status').textContent = integrityOk
    ? `entregue a ${target}`
    : 'entregue, mas a conferência falhou';

  if (integrityOk) {
    const stamp = document.createElement('span');
    stamp.className = 'impact-stamp';
    stamp.textContent = 'conferido';
    ticket.appendChild(stamp);
  }

  delete pendingTickets[transferId];
});

socket.on('transfer-error', ({ transferId, message }) => {
  const ticket = pendingTickets[transferId];
  if (!ticket) return;
  ticket.classList.add('error');
  ticket.querySelector('.ticket-status').textContent = `não entregue — ${message}`;
  delete pendingTickets[transferId];
});

// --- Receiving (the delivery ledger) ---

socket.on('file-received', ({ name, size, from, ok, downloadUrl }) => {
  if (receivedList.querySelector('.ledger-empty')) receivedList.innerHTML = '';

  const li = document.createElement('li');
  li.className = 'ledger-row';
  li.innerHTML = `
    <span class="ledger-file">${name}</span>
    <span class="ledger-from">${from}</span>
    <span class="ledger-stamp ${ok ? 'ok' : 'void'}">${ok ? 'conferido' : 'rejeitado'}</span>
    <a class="ledger-claim" href="${downloadUrl}" download>
      <span>retirar</span>
      <span class="claim-meta">${formatBytes(size)}</span>
    </a>
  `;
  receivedList.prepend(li);
});
