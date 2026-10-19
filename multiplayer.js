import { initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, signInAnonymously } from 'firebase/auth';
import { getDatabase, ref, onValue, onDisconnect, set, update, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import QRCode from 'qrcode';

const params = new URLSearchParams(location.search);
const room = params.get('room') || 'campus';
const roomValid = /^[a-zA-Z0-9_-]{1,40}$/.test(room);
const status = document.createElement('div');
status.id = 'connection-status';
status.setAttribute('role', 'status');
document.body.appendChild(status);
status.textContent = 'Connecting to shared map…';
const state = { players: {}, connected: false, joined: false, readReady: false };
let authInstance;
let appInstance;
let lastErrorCode = '';
let roomReadError;
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
const blessingBusy = new Set();
const blessedWishIds = new Set();
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
  window.dispatchEvent(new CustomEvent('map-connection-updated'));
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
  async waitForJoined(timeoutMs = 15000) {
    const started = performance.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        if (state.joined && state.readReady && state.players[window.mapNetwork.ownKey]) return resolve();
        if (lastErrorCode && !['auth/network-request-failed', 'auth/timeout'].includes(lastErrorCode)) {
          return reject(new Error(connectionError));
        }
        if (performance.now() - started >= timeoutMs) {
          return reject(new Error('Unable to join yet. Check your connection and tap ENTER THE MAP to retry.'));
        }
        setTimeout(check, 100);
      };
      check();
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
  subscribeWishes(receive, reportError) {
    if (!database || !user || !state.joined) throw new Error('Join the map before opening the tree.');
    // This listener is deliberately independent of player presence and chat.
    return onValue(query(ref(database, `rooms/${room}/wishes`), orderByChild('createdAt'), limitToLast(100)), snapshot => {
      const wishes = Object.entries(snapshot.val() || {}).map(([id, value]) => ({ ...value, id }))
        .filter(wish => typeof wish.name === 'string' && typeof wish.text === 'string' && Number.isFinite(wish.createdAt))
        .sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
      receive(wishes);
    }, () => reportError(new Error('Wishes are unavailable. Ask the host to publish the wishing-tree database rules, then reopen the tree.')));
  },
  async sendWish(value, id) {
    const text = String(value).trim();
    if (!text || text.length > 160) throw new Error('Use 1–160 characters.');
    if (!state.connected || !state.joined || !state.readReady || !user) throw new Error('Reconnect to the map before hanging your wish.');
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid wish identifier.');
    // A caller retains this ID until acknowledgement; reconnect cannot duplicate it.
    const record = { name: nickname, text, owner: user.uid, connection: connectionId, createdAt: serverTimestamp() };
    try { await set(ref(database, `rooms/${room}/wishes/${id}`), record); }
    catch (error) {
      throw new Error(['PERMISSION_DENIED', 'permission-denied'].includes(error.code)
        ? 'Wish could not be saved. Ask the host to check the wishing-tree rules.'
        : 'Wish could not be saved. Your draft is still here; check your connection.');
    }
  },
  subscribeBlessings(id, receive, reportError) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid wish identifier.');
    if (!database || !user || !state.joined) throw new Error('Join the map before reading blessings.');
    // Subscribe only to the open paper. Errors never affect player presence.
    return onValue(ref(database, `rooms/${room}/wishBlessings/${id}`), snapshot => {
      const votes = snapshot.val() || {};
      const blessed = votes[user.uid] === true;
      if (blessed) blessedWishIds.add(id); else blessedWishIds.delete(id);
      receive({ count: Object.values(votes).filter(value => value === true).length, blessed });
    }, () => reportError(new Error('Blessings are unavailable. Please ask the host to publish the blessing rules.')));
  },
  async blessWish(id) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid wish identifier.');
    if (!database || !user || !state.connected || !state.joined || !state.readReady) throw new Error('Reconnect to the map before sending a blessing.');
    if (blessedWishIds.has(id) || blessingBusy.has(id)) throw new Error('You have already sent this wish a blessing.');
    blessingBusy.add(id);
    try {
      // One immutable record per anonymous player: simultaneous blessings from
      // different players cannot overwrite or lose each other's contributions.
      await set(ref(database, `rooms/${room}/wishBlessings/${id}/${user.uid}`), true);
      blessedWishIds.add(id);
    } catch (error) {
      throw new Error(['PERMISSION_DENIED', 'permission-denied'].includes(error.code)
        ? 'Blessing could not be saved. Please ask the host to check the blessing rules.'
        : 'Blessing could not be saved. Check your connection and try again.');
    } finally { blessingBusy.delete(id); }
  },
  createWishId: makeId,
  ownKey: null
};
function fail(error) { lastErrorCode = error.code || ''; connectionError = `Connection error: ${error.code || error.message}`; refreshStatus(); }
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
    joinAttempts = 0;
    if (roomReadError) {
      fail(roomReadError);
    } else {
      connectionError = '';
      lastErrorCode = '';
      message(state.readReady ? `Online · room ${room}` : `Waiting for shared map · room ${room}`);
    }
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
    if (!authInstance) {
      // Firebase's optional heartbeat storage also probes IndexedDB, even for
      // memory-only Auth. Some iOS webviews leave open() pending forever.
      // Report storage as unavailable only during synchronous SDK startup;
      // restore the browser API before yielding or making network requests.
      const descriptor = Object.getOwnPropertyDescriptor(window, 'indexedDB');
      let restored = false;
      try {
        try {
          Object.defineProperty(window, 'indexedDB', { configurable: true, value: undefined });
          restored = true;
        } catch { /* Memory Auth still works where the browser forbids overriding this property. */ }
        appInstance = initializeApp(config.firebase);
        authInstance = initializeAuth(appInstance, { persistence: inMemoryPersistence });
      } finally {
        if (restored) {
          if (descriptor) Object.defineProperty(window, 'indexedDB', descriptor);
          else delete window.indexedDB;
        }
      }
    }
    const app = appInstance;
    const auth = authInstance;
    user = (await signInAnonymously(auth)).user;
    connectionError = '';
    lastErrorCode = '';
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
      state.readReady = true;
      roomReadError = null;
      // A late disconnect cleanup can remove an acknowledged connection record.
      // Re-register rather than silently leaving the phone playable but invisible.
      if (state.joined && window.mapNetwork.ownKey && !players[window.mapNetwork.ownKey]) {
        state.joined = false;
        message(`Rejoining · room ${room}`);
        retryJoin();
      }
      refreshStatus();
      window.dispatchEvent(new CustomEvent('map-players-updated'));
    }, error => { state.readReady = false; roomReadError = error; fail(error); });
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
