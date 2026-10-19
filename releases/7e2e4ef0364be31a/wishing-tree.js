// The approved wishing tree is an additive map overlay, not a replacement map.
(() => {
  const base = new URL('.', document.currentScript.src);
  const sprite = new Image();
  sprite.src = new URL('wishing-tree.png', base).href;
  const tree = { x: 724 * 1.6, y: 417 * 1.6, width: 240 * 1.6, height: 160 * 1.6 };
  let frame = null;
  let hovered = false;
  let near = false;
  const entry = document.createElement('button');
  entry.id = 'wishing-tree-entry';
  entry.type = 'button';
  entry.setAttribute('aria-label', 'Open Wishing Tree');
  entry.hidden = true;
  Object.assign(entry.style, { position: 'fixed', zIndex: '10', background: 'transparent', border: '0', padding: '0', borderRadius: '35%', touchAction: 'manipulation', cursor: 'pointer' });
  entry.onpointerenter = () => { hovered = true; };
  entry.onpointerleave = () => { hovered = false; };
  entry.onclick = () => {
    if (!near || frame || page !== 'map') return;
    stopMovement();
    frame = document.createElement('iframe');
    frame.id = 'wishing-tree-panel';
    frame.title = 'Wishing Tree';
    frame.src = new URL('wishing-tree-board.html', base).href;
    Object.assign(frame.style, { position: 'fixed', inset: '0', width: '100%', height: '100dvh', border: '0', zIndex: '100', background: '#f4f0e6' });
    document.body.appendChild(frame);
    entry.hidden = true;
    updateTouchControls();
  };
  document.body.appendChild(entry);
  window.wishingTree = {
    isOpen: () => frame !== null,
    close() {
      frame?.remove();
      frame = null;
      stopMovement();
      updateTouchControls();
      entry.focus({ preventScroll: true });
    },
    draw() {
      if (!sprite.complete || !sprite.naturalWidth) return;
      const x = tree.x - cameraX, y = tree.y - cameraY;
      near = !displayMode && Math.hypot(playerX - tree.x, playerY - (tree.y + 70)) <= 230;
      const context = drawingContext;
      context.save();
      context.shadowColor = near || hovered ? '#fff0a9' : 'rgba(255,245,188,.6)';
      context.shadowBlur = (near || hovered ? 11 : 5) + Math.sin(performance.now() / 900) * 2;
      context.drawImage(sprite, x - tree.width / 2, y - tree.height / 2, tree.width, tree.height);
      context.restore();
      entry.hidden = displayMode || page !== 'map' || !!frame;
      if (entry.hidden) return;
      const canvas = document.querySelector('main canvas');
      if (!canvas) return;
      const bounds = canvas.getBoundingClientRect();
      const scaleX = bounds.width / width, scaleY = bounds.height / height;
      Object.assign(entry.style, { left: `${bounds.left + (x - tree.width / 2) * scaleX}px`, top: `${bounds.top + (y - tree.height / 2) * scaleY}px`, width: `${tree.width * scaleX}px`, height: `${tree.height * scaleY}px` });
      entry.disabled = !near;
      entry.title = near ? 'Wishing Tree' : 'Move closer to the Wishing Tree';
    }
  };
})();
