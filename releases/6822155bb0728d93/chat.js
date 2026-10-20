// Room messages use the same player identity as movement. No HTML from users.
(() => {
  if (new URLSearchParams(location.search).get('mode') === 'display') return;
  const toggle = document.createElement('button');
  toggle.id = 'chat-toggle';
  toggle.type = 'button';
  toggle.hidden = true;
  toggle.setAttribute('aria-label', 'Open room chat');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'chat-panel');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="11" r="1"/><circle cx="16" cy="11" r="1"/></svg>';
  const panel = document.createElement('section');
  panel.id = 'chat-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Room chat');
  panel.innerHTML = `<header><strong>Room chat</strong><button type="button" class="chat-close" aria-label="Close chat">×</button></header>
    <div class="chat-messages" role="log" aria-label="Recent messages" aria-live="polite"></div>
    <div class="chat-reactions" aria-label="Quick reactions"></div>
    <form><input aria-label="Message" placeholder="Say hello…" maxlength="80" autocomplete="off" enterkeyhint="send"><button type="submit" aria-label="Send message">➤</button></form>
    <div class="chat-feedback" role="status"></div>`;
  const input = panel.querySelector('input');
  const feedback = panel.querySelector('.chat-feedback');
  const log = panel.querySelector('.chat-messages');
  const buttons = () => [...panel.querySelectorAll('form button, .chat-reactions button')];
  let visible = false;
  let sending = false;
  let cooldownUntil = 0;
  let cooldownTimer;
  const seen = new Set();
  const history = [];
  const startedAt = Date.now();
  const empty = document.createElement('p');
  empty.className = 'chat-empty';
  empty.textContent = '👋';
  log.appendChild(empty);
  function close() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    input.blur();
  }
  function open() {
    if (!visible) return;
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    // Opening the chat should never leave held movement running.
    stopMovement();
    input.focus();
  }
  toggle.addEventListener('click', () => panel.hidden ? open() : close());
  panel.querySelector('.chat-close').addEventListener('click', () => { close(); toggle.focus(); });
  panel.addEventListener('keydown', event => {
    event.stopPropagation();
    if (!event.isComposing && event.key === 'Escape') { close(); toggle.focus(); }
  });
  function updateButtons() {
    const disabled = sending || performance.now() < cooldownUntil;
    buttons().forEach(button => { button.disabled = disabled; });
  }
  async function send(value, clearInput = false) {
    const text = value.trim();
    if (!text || sending || performance.now() < cooldownUntil) return;
    sending = true;
    updateButtons();
    feedback.textContent = 'Sending…';
    try {
      if (!window.mapNetwork) throw new Error('Connect to the map before sending.');
      await window.mapNetwork.sendChat(text);
      if (clearInput && input.value.trim() === text) input.value = '';
      feedback.textContent = '';
      cooldownUntil = performance.now() + 1500;
      clearTimeout(cooldownTimer);
      cooldownTimer = setTimeout(updateButtons, 1550);
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      sending = false;
      updateButtons();
    }
  }
  panel.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    send(input.value, true);
  });
  for (const [emoji, label] of [['👋', 'Wave'], ['😊', 'Smile'], ['👍', 'Thumbs up'], ['❤️', 'Heart']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = emoji;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => send(emoji));
    panel.querySelector('.chat-reactions').appendChild(button);
  }
  window.addEventListener('map-players-updated', () => {
    const network = window.mapNetwork;
    const now = network.now();
    const incoming = Object.entries(network.state.players).sort((a, b) => (a[1].speech?.sentAt || 0) - (b[1].speech?.sentAt || 0));
    for (const [key, player] of incoming) {
      const speech = player.speech;
      if (!speech || typeof speech.text !== 'string' || !Number.isFinite(speech.sentAt) || speech.sentAt < startedAt - 10000 || speech.sentAt > now + 10000) continue;
      const id = `${key}:${speech.id || `${speech.sentAt}:${speech.text}`}`;
      if (seen.has(id)) continue;
      seen.add(id);
      // Bound session memory during a long public demonstration.
      if (seen.size > 300) seen.delete(seen.values().next().value);
      history.push({ nickname: String(player.nickname || 'Guest'), text: speech.text.slice(0, 80) });
      if (history.length > 30) history.shift();
    }
    log.replaceChildren();
    if (!history.length) log.appendChild(empty);
    for (const item of history) {
      const row = document.createElement('p');
      const name = document.createElement('strong');
      name.textContent = `${item.nickname}: `;
      row.append(name, document.createTextNode(item.text));
      log.appendChild(row);
    }
    log.scrollTop = log.scrollHeight;
  });
  window.mapChat = {
    setVisible(next) {
      if (next === visible) return;
      visible = next;
      toggle.hidden = !next;
      if (!next) close();
    },
    isOpen: () => !panel.hidden
  };
  document.body.append(toggle, panel);
})();
