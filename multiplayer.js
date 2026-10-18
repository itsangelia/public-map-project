import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence, signInAnonymously } from 'firebase/auth';
import { getDatabase, ref, onValue, onDisconnect, set, update, serverTimestamp } from 'firebase/database';
import QRCode from 'qrcode';

const params = new URLSearchParams(location.search);
const room = params.get('room') || 'campus';
const roomValid = /^[a-zA-Z0-9_-]{1,40}$/.test(room);
const status = document.createElement('div');
status.id = 'connection-status';
status.setAttribute('role', 'status');
document.body.appendChild(status);
const state = { players: {}, connected: false, joined: false };
let ownRef, database, user, lastWrite = 0, joining = false;
let nickname, avatar, latestPosition, lastSent;
let connectionMessage = 'Connecting';
let connectionError = '';
const connectionId = crypto.randomUUID();
const message = text => {
  connectionMessage = text;
  refreshStatus();
};
function refreshStatus() {
  const names = Object.values(state.players).map(player => player.nickname || 'Guest');
  status.textContent = `${connectionError || connectionMessage} · players: ${names.length}`;
  status.title = names.join(', ');
  if (params.get('debug') === '1') status.textContent += ` · ${names.join(', ') || 'no players received'}`;
}
window.mapNetwork = {
  state,
  async join(name, character, x, y) {
    nickname = name.trim().slice(0, 18) || 'Guest';
    avatar = character;
    x = Math.round(x * 1000) / 1000;
    y = Math.round(y * 1000) / 1000;
    latestPosition = { x, y };
    connectionError = '';
    if (!database || !state.connected || !user) return;
    await publishJoin();
  },
  move(x, y) {
    x = Math.round(x * 1000) / 1000;
    y = Math.round(y * 1000) / 1000;
    latestPosition = { x, y };
    if (!state.joined || !state.connected || performance.now() - lastWrite < 80) return;
    if (lastSent && lastSent.x === x && lastSent.y === y) return;
    lastWrite = performance.now();
    lastSent = { x, y };
    update(ownRef, { x, y, updatedAt: serverTimestamp() }).catch(fail);
  },
  ownKey: null
};
function fail(error) { connectionError = `Connection error: ${error.code || error.message}`; refreshStatus(); }
async function publishJoin() {
  if (joining || !latestPosition || !state.connected) return;
  joining = true;
  try {
    ownRef = ref(database, `rooms/${room}/players/${user.uid}/${connectionId}`);
    window.mapNetwork.ownKey = `${user.uid}/${connectionId}`;
    await onDisconnect(ownRef).remove();
    await set(ownRef, { nickname, avatar, ...latestPosition, updatedAt: serverTimestamp() });
    lastSent = { ...latestPosition };
    state.joined = true;
    message(`Online · room ${room}`);
  } catch (error) { fail(error); } finally { joining = false; }
}
async function init() {
  if (!roomValid) { message('Invalid room identifier'); return; }
  const config = window.PUBLIC_MAP_CONFIG;
  const qrPanel = document.createElement('section');
  qrPanel.id = 'join-qr';
  if (params.get('mode') === 'display') {
    const url = new URL(config?.publicBaseUrl || location.href);
    url.search = new URLSearchParams({ room, v: 'sync-check-1' }).toString();
    url.hash = '';
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      qrPanel.textContent = 'Deploy to HTTPS to enable phone joining';
    } else {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, url.href, { width: 160, margin: 2, errorCorrectionLevel: 'M' });
      const label = document.createElement('div');
      label.textContent = 'Scan to join';
      qrPanel.append(canvas, label);
    }
    document.body.appendChild(qrPanel);
  }
  if (!config?.firebase) { message('Local preview · multiplayer not configured'); return; }
  try {
    const app = initializeApp(config.firebase);
    const auth = getAuth(app);
    await setPersistence(auth, browserSessionPersistence);
    user = (await signInAnonymously(auth)).user;
    database = getDatabase(app);
    onValue(ref(database, `rooms/${room}/players`), snapshot => {
      const players = {};
      for (const [uid, connections] of Object.entries(snapshot.val() || {})) {
        for (const [id, player] of Object.entries(connections || {})) {
          if (Number.isFinite(player.x) && Number.isFinite(player.y) && Number.isInteger(player.avatar) && player.avatar >= 0 && player.avatar < 3) {
            players[`${uid}/${id}`] = player;
          }
        }
      }
      state.players = players;
      refreshStatus();
    }, fail);
    onValue(ref(database, '.info/connected'), async snapshot => {
      state.connected = snapshot.val() === true;
      state.joined = false;
      message(state.connected ? `Connected · room ${room}` : 'Disconnected · reconnecting');
      if (state.connected) await publishJoin();
    }, fail);
  } catch (error) { fail(error); }
}
init().catch(fail);
