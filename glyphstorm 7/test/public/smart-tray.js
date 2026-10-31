import { scoreWord } from './rules.js';

// A small, bundled subset of the game's dictionary. This is advice, never validation.
export const PREVIEW_WORDS = Object.freeze(('CAT DOG SUN STAR MOON MAP CAR HAT BAT RAT CUP TOP PEN PET NET RED BED BOX FOX ANT ART SEA EAR TEA EAT ATE AIR RAIN SNOW WIND TREE LEAF ROCK DUST COMET RING GLOW FLY SKY SHIP FISH BIRD LION BEAR BOOK HOME GAME PLAY TIME FIRE LIGHT WATER STONE SPACE ORBIT').split(' '));
const candidates = PREVIEW_WORDS.map(word => ({ word, counts: countsFor(word) }));
function countsFor(text) {
  const counts = Object.create(null);
  for (const letter of text) counts[letter] = (counts[letter] || 0) + 1;
  return counts;
}
export function localWordOffer(tray, used = new Set()) {
  const counts = countsFor(tray.map(t => t.letter).join(''));
  let best = null;
  for (const { word, counts: needed } of candidates) {
    if (used.has(word) || !Object.keys(needed).every(l => needed[l] <= (counts[l] || 0))) continue;
    const remaining = [...tray].sort((a, b) => Number(Boolean(b.doubleScore)) - Number(Boolean(a.doubleScore)));
    const tiles = [...word].map(l => remaining.splice(remaining.findIndex(t => t.letter === l), 1)[0]);
    const multiplier = tiles.some(t => t.doubleScore) ? 2 : 1;
    const offer = { word, length: word.length, tileIds: tiles.map(t => t.id), points: scoreWord(word) * multiplier, multiplier };
    if (!best || offer.length > best.length || (offer.length === best.length && offer.points > best.points)) best = offer;
  }
  return best;
}
export class SmartTrayPreview {
  constructor() { this.key = ''; this.value = { offer: null, confirmed: false }; }
  read(self, matchId) {
    const tray = self?.tray || [], guide = self?.wordGuide;
    const history = (self?.history || []).map(entry => entry.word);
    const fresh = guide?.trayKey === tray.map(t => t.id).join('|');
    const key = JSON.stringify([matchId, tray, history, fresh, guide?.longest]);
    if (key === this.key) return this.value;
    this.key = key;
    const local = localWordOffer(tray, new Set(history));
    // Full-dictionary, unused-word advice wins when it arrives. No extra socket event.
    this.value = { offer: fresh ? guide.longest : local, confirmed: Boolean(fresh) };
    return this.value;
  }
}
