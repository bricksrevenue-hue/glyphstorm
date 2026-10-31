import { FLEET, shipFor } from './fleet.js';
import { NEON } from './neon.js';

// Decode once, then cache a small Canvas texture for the animation loop.
// Failed images keep the original vector ship playable, without blocking a room.
export class ShipSprites {
  constructor() {
    this.textures = new Map();
    this.activeTextures = new Map();
    this.ready = Promise.all(FLEET.map(ship => this.load(ship)));
  }
  async load(ship) {
    try {
      const image = new Image();
      image.src = ship.src;
      await image.decode();
      const texture = document.createElement('canvas');
      texture.width = texture.height = 256;
      const ctx = texture.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image,0,0,256,256);
      this.textures.set(ship.id,texture);
      // Cache a green tint once. Original ship artwork and selection previews stay intact.
      const active=document.createElement('canvas');active.width=active.height=256;
      const tint=active.getContext('2d');tint.drawImage(texture,0,0);
      tint.globalCompositeOperation='source-atop';tint.globalAlpha=.55;tint.fillStyle=NEON.lime;tint.fillRect(0,0,256,256);
      this.activeTextures.set(ship.id,active);
      return true;
    } catch { return false; }
  }
  // Called after translating to the pilot and rotating by the synchronized aim.
  draw(ctx, shipId, size, active=false) {
    const texture = (active?this.activeTextures:this.textures).get(shipFor(shipId).id);
    if (!texture) return false;
    ctx.drawImage(texture,-size/2,-size/2,size,size);
    return true;
  }
}
