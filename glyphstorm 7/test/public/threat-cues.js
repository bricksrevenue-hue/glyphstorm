import { WORLD, RULES, delta } from './rules.js';
import { NEON } from './neon.js';

export const THREAT_CUES = Object.freeze({ lowIntegrity: 30, proximity: 90, maxVectors: 6 });
// Clip a segment to the viewport. Both endpoints may be outside it.
export function clipSegment(a, b, width, height, inset = 8) {
  if (width <= inset * 2 || height <= inset * 2) return null;
  const dx = b.x - a.x, dy = b.y - a.y;
  let start = 0, end = 1;
  for (const [p, q] of [[-dx, a.x - inset], [dx, width - inset - a.x], [-dy, a.y - inset], [dy, height - inset - a.y]]) {
    if (p === 0) { if (q < 0) return null; continue; }
    const t = q / p;
    if (p < 0) start = Math.max(start, t); else end = Math.min(end, t);
    if (start > end) return null;
  }
  if (Math.hypot(dx, dy) < 1) return null;
  return { from: { x: a.x + dx * start, y: a.y + dy * start }, to: { x: a.x + dx * end, y: a.y + dy * end } };
}
export function defenseAlert(state) {
  const d = state?.defense;
  if (state?.phase !== 'playing' || !d?.enabled) return { active: false, label: '' };
  const low = d.earthHealth < THREAT_CUES.lowIntegrity;
  const close = state.letters.some(l => l.incoming && Math.hypot(delta(l.x, d.x, WORLD.width), delta(l.y, d.y, WORLD.height)) <= d.barrierRadius + RULES.letterRadius + THREAT_CUES.proximity);
  return { active: low || close, label: low ? 'EARTH CRITICAL · SPELL TO REPAIR' : close ? 'THREAT NEAR EARTH · PULSE TO INTERCEPT' : '' };
}
export function drawThreatVectors(ctx, state, project, scale, width, height) {
  if (state?.phase !== 'playing' || !state.defense?.enabled) return;
  const earth = state.defense, sectors = new Set();
  ctx.save(); ctx.strokeStyle = NEON.pink; ctx.fillStyle = NEON.pink;
  ctx.globalAlpha = .38; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]);
  for (const letter of state.letters) {
    if (!letter.incoming) continue;
    const from = project(letter.x, letter.y);
    const margin = RULES.letterRadius * scale;
    if (from.x >= -margin && from.x <= width + margin && from.y >= -margin && from.y <= height + margin) continue;
    // Use Earth's image nearest this threat, so a torus seam never reverses the arrow.
    const dx = delta(earth.x, letter.x, WORLD.width) * scale, dy = delta(earth.y, letter.y, WORLD.height) * scale;
    const distance = Math.hypot(dx, dy), stop = Math.max(0, distance - earth.barrierRadius * scale);
    if (!distance) continue;
    const segment = clipSegment(from, { x: from.x + dx / distance * stop, y: from.y + dy / distance * stop }, width, height);
    if (!segment) continue;
    const sector = Math.round(Math.atan2(from.y - height / 2, from.x - width / 2) / (Math.PI / 6));
    if (sectors.has(sector)) continue;
    sectors.add(sector);
    const { from: a, to: b } = segment;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const arrow = Math.min(26, length * .5), angle = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.save(); ctx.setLineDash([]); ctx.globalAlpha = .8;
    ctx.translate(a.x + Math.cos(angle) * arrow, a.y + Math.sin(angle) * arrow); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-3, -4); ctx.lineTo(-3, 4); ctx.closePath(); ctx.fill(); ctx.restore();
    if (sectors.size >= THREAT_CUES.maxVectors) break;
  }
  ctx.restore();
}
