// The approved wishing tree is an additive map overlay, not a replacement map.
(() => {
  const base = new URL('.', document.currentScript.src);
  const sprite = new Image();
  sprite.src = new URL('wishing-tree.png', base).href;
  const tree = { x: 724 * 1.6, y: 417 * 1.6, width: 240 * 1.6, height: 160 * 1.6 };
  let frame = null;
  let near = false;
  let proximityGlow = null;
  let emphasis = 0;
  let lastFrame = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  sprite.onload = () => {
    // Cache the alpha-shaped outline once; avoid per-frame blur on phones.
    const padding = 40;
    const silhouette = document.createElement('canvas');
    silhouette.width = Math.ceil(tree.width);
    silhouette.height = Math.ceil(tree.height);
    const ink = silhouette.getContext('2d');
    ink.drawImage(sprite, 0, 0, silhouette.width, silhouette.height);
    ink.globalCompositeOperation = 'source-in';
    ink.fillStyle = '#ffe79a';
    ink.fillRect(0, 0, silhouette.width, silhouette.height);
    proximityGlow = document.createElement('canvas');
    proximityGlow.width = silhouette.width + padding * 2;
    proximityGlow.height = silhouette.height + padding * 2;
    const glow = proximityGlow.getContext('2d');
    glow.shadowColor = '#ffdc77';
    glow.shadowBlur = 22;
    for (const [dx, dy] of [[-3,0],[3,0],[0,-3],[0,3]]) {
      glow.drawImage(silhouette, padding + dx, padding + dy);
    }
  };
  const entry = document.createElement('button');
  entry.id = 'wishing-tree-entry';
  entry.type = 'button';
  entry.setAttribute('aria-label', 'Open Wishing Tree');
  entry.hidden = true;
  Object.assign(entry.style, { position: 'fixed', zIndex: '10', background: 'transparent', border: '0', padding: '0', borderRadius: '35%', touchAction: 'manipulation', cursor: 'pointer' });
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
      frame?.contentWindow?.disposeWishingTree?.();
      frame?.remove();
      frame = null;
      stopMovement();
      updateTouchControls();
      entry.focus({ preventScroll: true });
    },
    syncVisibility() { entry.hidden = displayMode || page !== 'map' || !!frame; },
    draw() {
      if (!sprite.complete || !sprite.naturalWidth) return;
      const x = tree.x - cameraX, y = tree.y - cameraY;
      near = !displayMode && Math.hypot(playerX - tree.x, playerY - (tree.y + 70)) <= 230;
      const now = performance.now();
      const elapsed = Math.min(100, now - lastFrame);
      lastFrame = now;
      const active = near && !frame;
      emphasis += ((active ? 1 : 0) - emphasis) * (1 - Math.exp(-elapsed / 160));
      const pulse = reducedMotion.matches ? 0 : Math.sin(now / 430);
      const enlargement = 1 + emphasis * (0.035 + pulse * 0.008);
      const drawWidth = tree.width * enlargement, drawHeight = tree.height * enlargement;
      // Anchor at the trunk so the tree does not slide across the plaza.
      const left = x - drawWidth / 2;
      const top = y + tree.height / 2 - drawHeight;
      const context = drawingContext;
      context.save();
      if (proximityGlow && emphasis > 0.01) {
        context.globalAlpha = emphasis * (reducedMotion.matches ? 0.85 : 0.8 + pulse * 0.15);
        context.drawImage(proximityGlow, left - 40 * enlargement, top - 40 * enlargement,
          proximityGlow.width * enlargement, proximityGlow.height * enlargement);
        context.globalAlpha = 1;
      }
      context.shadowColor = 'rgba(255,245,188,.6)';
      context.shadowBlur = 5;
      context.drawImage(sprite, left, top, drawWidth, drawHeight);
      context.restore();
      entry.hidden = displayMode || page !== 'map' || !!frame;
      if (entry.hidden) return;
      const canvas = document.querySelector('main canvas');
      if (!canvas) return;
      const bounds = canvas.getBoundingClientRect();
      const scaleX = bounds.width / width, scaleY = bounds.height / height;
      Object.assign(entry.style, { left: `${bounds.left + left * scaleX}px`, top: `${bounds.top + top * scaleY}px`, width: `${drawWidth * scaleX}px`, height: `${drawHeight * scaleY}px` });
      entry.disabled = !near;
      entry.title = near ? 'Wishing Tree' : 'Move closer to the Wishing Tree';
    }
  };
})();
