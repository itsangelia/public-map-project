import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence, inMemoryPersistence, signInAnonymously } from 'firebase/auth';
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
let joinRequested = false;
let connectionEpoch = 0;
let retryTimer;
let joinAttempts = 0;
let nickname, avatar, latestPosition, lastSent;
let connectionMessage = 'Connecting';
let connectionError = '';
let lastChatSent = -Infinity;
let chatSending = false;
let serverTimeOffset = 0;
function makeId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Older phone webviews support secure random bytes but not randomUUID().
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
const connectionId = makeId();
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
    joinRequested = true;
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
    const sent = { x, y };
    lastSent = sent;
    update(ownRef, { x, y, updatedAt: serverTimestamp() }).catch(error => {
      if (lastSent === sent) lastSent = null;
      fail(error);
    });
  },
  now: () => Date.now() + serverTimeOffset,
  async sendChat(value) {
    const text = String(value).trim();
    if (!text || text.length > 80) throw new Error('Use 1–80 characters.');
    if (!state.connected || !state.joined || !ownRef) throw new Error('Connect to the map before sending.');
    if (chatSending || performance.now() - lastChatSent < 1500) throw new Error('Please wait a moment before sending again.');
    chatSending = true;
    try {
      await update(ownRef, { speech: { id: makeId(), text, sentAt: serverTimestamp() }, updatedAt: serverTimestamp() });
      lastChatSent = performance.now();
    } catch (error) {
      throw new Error(error.code === 'PERMISSION_DENIED' || error.code === 'permission-denied'
        ? 'Chat is unavailable. Please ask the host to publish the chat database rules.'
        : 'Message could not be sent. Check your connection.');
    } finally { chatSending = false; }
  },
  ownKey: null
};
function fail(error) { connectionError = `Connection error: ${error.code || error.message}`; refreshStatus(); }
function retryJoin() {
  if (retryTimer || !state.connected || !joinRequested || state.joined) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    publishJoin();
  }, Math.min(1000 * 2 ** joinAttempts++, 10000));
}
async function publishJoin() {
  if (joining || !joinRequested || !latestPosition || !state.connected || !user) return;
  joining = true;
  const epoch = connectionEpoch;
  const sentPosition = { ...latestPosition };
  let retryable = true;
  try {
    ownRef = ref(database, `rooms/${room}/players/${user.uid}/${connectionId}`);
    window.mapNetwork.ownKey = `${user.uid}/${connectionId}`;
    message(`Joining · room ${room}`);
    await onDisconnect(ownRef).remove();
    if (epoch !== connectionEpoch || !state.connected) return;
    await set(ownRef, { nickname, avatar, ...sentPosition, updatedAt: serverTimestamp() });
    if (epoch !== connectionEpoch || !state.connected) return;
    lastSent = sentPosition;
    state.joined = true;
    connectionError = '';
    joinAttempts = 0;
    message(`Online · room ${room}`);
  } catch (error) {
    state.joined = false;
    retryable = !['PERMISSION_DENIED', 'permission-denied'].includes(error.code);
    fail(error);
  } finally {
    joining = false;
    if (retryable) retryJoin();
  }
}
async function init() {
  if (!roomValid) { message('Invalid room identifier'); return; }
  const config = window.PUBLIC_MAP_CONFIG;
  const qrPanel = document.createElement('section');
  qrPanel.id = 'join-qr';
  if (params.get('mode') === 'display') {
    const url = new URL(config?.publicBaseUrl || location.href);
    url.search = new URLSearchParams({ room, v: window.PUBLIC_MAP_RELEASE || 'stable-1', scan: String(Date.now()) }).toString();
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
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch {
      // Some QR in-app browsers disable session storage; keep this session usable.
      await setPersistence(auth, inMemoryPersistence);
    }
    user = (await signInAnonymously(auth)).user;
    connectionError = '';
    database = getDatabase(app);
    onValue(ref(database, '.info/serverTimeOffset'), snapshot => { serverTimeOffset = snapshot.val() || 0; });
    onValue(ref(database, `rooms/${room}/players`), snapshot => {
      const players = {};
      for (const [uid, connections] of Object.entries(snapshot.val() || {})) {
        for (const [id, player] of Object.entries(connections || {})) {
          if (player && Number.isFinite(player.x) && Number.isFinite(player.y) && Number.isInteger(player.avatar) && player.avatar >= 0 && player.avatar < 3) {
            players[`${uid}/${id}`] = player;
          }
        }
      }
      state.players = players;
      refreshStatus();
      window.dispatchEvent(new CustomEvent('map-players-updated'));
    }, fail);
    onValue(ref(database, '.info/connected'), async snapshot => {
      connectionEpoch++;
      clearTimeout(retryTimer);
      retryTimer = null;
      state.connected = snapshot.val() === true;
      state.joined = false;
      message(state.connected ? `Connected · room ${room}` : 'Disconnected · reconnecting');
      if (state.connected) await publishJoin();
    }, fail);
  } catch (error) {
    fail(error);
    if (['auth/network-request-failed', 'auth/timeout'].includes(error.code)) {
      setTimeout(() => initFirebaseRetry(), 3000);
    }
  }
}
// Retry authentication without rebuilding the QR or attaching duplicate UI.
async function initFirebaseRetry() {
  if (database) return;
  // Reuse the existing QR panel rather than stacking one on every retry.
  document.getElementById('join-qr')?.remove();
  await init();
}
init().catch(fail);
