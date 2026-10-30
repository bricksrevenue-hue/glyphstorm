import { FLEET, shipFor } from './fleet.js';

// Decode once, then cache a small Canvas texture for the animation loop.
// Failed images keep the original vector ship playable, without blocking a room.
export class ShipSprites {
  constructor() {
    this.textures = new Map();
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
      return true;
    } catch { return false; }
  }
  // Called after translating to the pilot and rotating by the synchronized aim.
  draw(ctx, shipId, size) {
    const texture = this.textures.get(shipFor(shipId).id);
    if (!texture) return false;
    ctx.drawImage(texture,-size/2,-size/2,size,size);
    return true;
  }
}
