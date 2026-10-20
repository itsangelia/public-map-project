// Approved drink-shop artwork overlaid near the existing northwest cafe.
// This phase adds placement and the existing proximity cue, not game mechanics.
(() => {
  const base = new URL('.', document.currentScript.src);
  const sprite = new Image();
  sprite.src = new URL('drink-shop.png', base).href;
  const shop = { x: 260 * 1.6, y: 150 * 1.6, width: 258 * 1.6, height: 234 * 1.6 };
  let proximityGlow = null;
  let emphasis = 0;
  let lastFrame = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  sprite.onload = () => {
    // Cache the alpha-shaped outline once; avoid per-frame blur on phones.
    const padding = 40;
    const silhouette = document.createElement('canvas');
    silhouette.width = Math.ceil(shop.width);
    silhouette.height = Math.ceil(shop.height);
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
  window.drinkShop = {
    draw() {
      if (!sprite.complete || !sprite.naturalWidth) return;
      const x = shop.x - cameraX, y = shop.y - cameraY;
      const active = !displayMode && page === 'map' && !window.wishingTree?.isOpen()
        && Math.hypot(playerX - shop.x, playerY - (shop.y + shop.height / 2 - 74)) <= 230;
      const now = performance.now();
      const elapsed = Math.min(100, now - lastFrame);
      lastFrame = now;
      emphasis += ((active ? 1 : 0) - emphasis) * (1 - Math.exp(-elapsed / 160));
      const pulse = reducedMotion.matches ? 0 : Math.sin(now / 430);
      const enlargement = 1 + emphasis * (0.035 + pulse * 0.008);
      const drawWidth = shop.width * enlargement, drawHeight = shop.height * enlargement;
      const left = x - drawWidth / 2;
      const top = y + shop.height / 2 - drawHeight;
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
    }
  };
})();
