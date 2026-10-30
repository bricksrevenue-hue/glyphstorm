import {scoreWord, RULES} from '../public/rules.js';
const indexes=new WeakMap();
export const letterCounts=text=>{const counts={};for(const letter of text)counts[letter]=(counts[letter]||0)+1;return counts;};
export const canMake=(word,counts)=>{const needed=letterCounts(word);return Object.keys(needed).every(l=>needed[l]<=(counts[l]||0));};
const signature=text=>[...text].sort().join('');
export function wordIndex(words){
  if(indexes.has(words))return indexes.get(words);
  const byLetters=new Map(),shortWords=[];
  for(const word of words){
    if(!/^[A-Z]{3,10}$/.test(word))continue;
    const key=signature(word);if(!byLetters.has(key))byLetters.set(key,[]);byLetters.get(key).push(word);
    if(word.length<=5)shortWords.push(word);
  }
  const cache=new Map();
  const index={shortWords,find(text){
    const key=signature(text);if(cache.has(key))return cache.get(key);
    const groups=Object.entries(letterCounts(key)),found=[];
    function visit(i,letters){
      if(i===groups.length){if(letters.length>=RULES.minWord)found.push(...(byLetters.get(letters)||[]));return;}
      const [letter,count]=groups[i];
      for(let n=0;n<=count&&letters.length+n<=RULES.maxWord;n++)visit(i+1,letters+letter.repeat(n));
    }
    visit(0,'');cache.set(key,found);if(cache.size>512)cache.delete(cache.keys().next().value);return found;
  }};
  indexes.set(words,index);return index;
}
export function wordTiles(word,tray){
  // Prefer a star when duplicate letters exist; one or more stars still mean x2 once.
  const remaining=[...tray].sort((a,b)=>Number(Boolean(b.doubleScore))-Number(Boolean(a.doubleScore)));
  const tiles=[];
  for(const letter of word){const i=remaining.findIndex(t=>t.letter===letter);if(i<0)return null;tiles.push(remaining.splice(i,1)[0]);}
  return tiles;
}
export function wordOffer(word,tray){
  const tiles=wordTiles(word,tray);if(!tiles)return null;
  const multiplier=tiles.some(t=>t.doubleScore)?2:1;
  return {word,length:word.length,tileIds:tiles.map(t=>t.id),points:scoreWord(word)*multiplier,multiplier};
}
