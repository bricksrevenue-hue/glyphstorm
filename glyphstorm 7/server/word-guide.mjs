import { RULES, VALUES, scoreWord, distance } from '../public/rules.js';

import {wordIndex,letterCounts,canMake,wordOffer} from './word-index.mjs';

export const starters='CAT DOG SUN STAR MOON MAP CAR HAT BAT RAT CUP TOP PEN PET NET RED BED BOX FOX ANT ART SEA EAR TEA EAT ATE AIR RAIN SNOW WIND TREE LEAF ROCK DUST COMET RING GLOW FLY SKY SHIP FISH BIRD LION BEAR BOOK HOME GAME PLAY TIME FIRE LIGHT WATER STONE SPACE ORBIT'.split(' ');

// A bounded multiset index finds anagrams without trying every permutation.
export function inspectTray(tray,used,words){
  const entries=[];
  for(let start=0;start<tray.length;start++)for(let end=start+RULES.minWord;end<=tray.length;end++){
    const tiles=tray.slice(start,end),word=tiles.map(t=>t.letter).join('');
    const status=!words.has(word)?'unknown':used.has(word)?'used':'valid',multiplier=tiles.some(t=>t.doubleScore)?2:1;
    entries.push({start,end,length:end-start,word,status,points:status==='valid'?scoreWord(word)*multiplier:0,multiplier});
  }
  const text=tray.map(t=>t.letter).join(''),index=wordIndex(words),counts=letterCounts(text);
  const possible=index.find(text).filter(w=>!used.has(w)),offers=possible.map(w=>wordOffer(w,tray));
  const best=[...offers].sort((a,b)=>b.points-a.points||b.length-a.length||a.word.localeCompare(b.word))[0]||null;
  const longest=[...offers].sort((a,b)=>b.length-a.length||b.points-a.points||a.word.localeCompare(b.word))[0]||null;
  const shortWord=[...offers].sort((a,b)=>Number(!starters.includes(a.word))-Number(!starters.includes(b.word))||a.length-b.length||b.points-a.points)[0]||null;
  const useful={};
  for(const l of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){
    const after=index.find(text+l).filter(w=>!used.has(w));
    useful[l]=after.some(w=>(letterCounts(w)[l]||0)>(counts[l]||0))?'useful':
      text.length>=2&&!after.length?'dim':'neutral';
  }
  const utility=tray.map((t,i)=>{
    const remaining=text.slice(0,i)+text.slice(i+1),c=letterCounts(remaining);
    const retained=possible.filter(w=>canMake(w,c)).length;
    const usage=possible.filter(w=>(letterCounts(w)[t.letter]||0)>=(counts[t.letter]||0)).length;
    // Removing a tile never creates an anagram; rank retained words, then room for a vowel.
    const recovery=possible.length?0:Math.max(...'AEIOU'.split('').map(v=>index.find(remaining+v).filter(w=>!used.has(w)).length));
    return {id:t.id,retained,usage,recovery,rare:VALUES[t.letter],star:Boolean(t.doubleScore)};
  }).sort((a,b)=>b.retained-a.retained||b.recovery-a.recovery||Number(a.star)-Number(b.star)||a.usage-b.usage||b.rare-a.rare);
  const smart=utility[0];
  const leastUseful=smart?utility.filter(t=>t.retained===smart.retained&&t.recovery===smart.recovery&&!t.star).map(t=>t.id):[];
  return {trayKey:tray.map(t=>t.id).join('|'),entries,best,longest,shortWord,possibleCount:possible.length,
    usefulness:useful,leastUseful,smartDiscard:smart?{tileId:smart.id,retainedWords:smart.retained,
      recoveryWords:smart.recovery,reason:possible.length?'Keeps the most available words.':'Makes room for a useful vowel.'}:null};
}

export function pickupReason(player,letter,mode,now){
  if(player.resetUntil>now)return 'Ship resetting — collection resumes when you return.';
  if(player.wordMode)return 'Review open — resume flying to collect letters.';
  if(player.shieldUntil>now||player.protectionUntil>now)return 'Temporary protection — collect when the ship shield ends.';
  if(player.tray.length>=RULES.trayLimit)return 'Board full — submit a word or discard a letter.';
  if(letter?.priorityUntil>now&&letter.ownerId!==player.id&&!(mode==='teams'&&letter.team===player.team))return 'Reserved for another pilot or team — wait for the pickup ring to fade.';
  return '';
}

export function suggestWord(player,room,now){
  const text=player.tray.map(t=>t.letter).join(''),counts=letterCounts(text);
  const supply={...counts};
  for(const item of [...room.letters,...room.crystals]){
    if(item.opened||item.expiresAt<=now)continue;
    if(Number.isFinite(item.x)&&distance(item,player)>600)continue;
    if(item.priorityUntil>now&&item.ownerId!==player.id&&!(room.settings.mode==='teams'&&item.team===player.team))continue;
    supply[item.letter]=(supply[item.letter]||0)+1;
  }
  const candidates=starters.filter(w=>room.words.has(w)&&!player.used.has(w));
  const missing=w=>{const c=letterCounts(w);return Object.entries(c).reduce((n,[l,k])=>n+Math.max(0,k-(counts[l]||0)),0);};
  const possible=candidates.filter(w=>canMake(w,supply));
  let word=possible.sort((a,b)=>missing(a)-missing(b)||a.length-b.length)[0];
  if(!word){
    const partial=candidates.filter(w=>[...text].some(l=>w.includes(l))||!text.length);
    word=partial.includes(player.guideTarget)?player.guideTarget:partial.sort((a,b)=>missing(a)-missing(b)||a.length-b.length)[0];
  }
  if(!word)return null;
  const remaining={...counts};let next=null,progress=0;
  for(const l of word){if(remaining[l]>0){remaining[l]--;progress++;}else if(!next)next=l;}
  return {word,next,progress,available:next?(supply[next]||0)>(counts[next]||0):true};
}
