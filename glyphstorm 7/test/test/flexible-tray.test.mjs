import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameRoom} from '../server/game.mjs';
import {inspectTray} from '../server/word-guide.mjs';
import {wordIndex} from '../server/word-index.mjs';
import {submissionChoice} from '../public/word-guide.js';
import {TraySelection,FlightTips,moveTile} from '../public/tray-controls.js';
import {RULES,scoreWord,VALUES,distance} from '../public/rules.js';
import {TILE_FREQUENCIES,VOWELS,drawLetter,vowelShare,replenishNearbyLetters,balanceDistantCrystals} from '../server/letter-supply.mjs';
import {drawEarth} from '../public/planet.js';
import wordListPath from 'word-list';

const words=new Set(['CAT','CATS','CAST','DOG','STAR','TEA','EAT','ATE','TEN','NET','TANGLE','ELEGANCE']);
const tiles=text=>[...text].map((letter,i)=>({id:'t'+i,letter}));
const text=p=>p.tray.map(t=>t.letter).join('');
function setup(dictionary=words){
  const room=new GameRoom('TRAYQA',{words:dictionary,now:1000});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1000);a.ready=b.ready=true;
  room.start(a.id,1000);room.tick(0,4000);room.crystals=[];room.asteroids=[];room.letters=[];
  room.nextSupplyAt=Infinity;room.replenishFields=()=>{};
  for(const [i,p]of [a,b].entries())Object.assign(p,{x:100+1000*i,y:100,protectionUntil:0});
  return {room,a,b};
}
function submit(room,p,ids,now=7000){room.wordMode(p.id,true,now);return room.submit(p.id,ids,now);}
function seeded(seed=17){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};}

test('desktop drag and mobile two-tap swap rearrange owned tiles; selected middle word keeps both sides',()=>{
  for(const input of ['drag','touch']){
    const {room,a}=setup();a.tray=tiles('XTACY');const selection=new TraySelection();
    let ids;
    if(input==='drag'){ids=moveTile(a.tray.map(t=>t.id),'t3','t1');ids=moveTile(ids,'t2','t1');}
    else {assert.equal(selection.tap('t1',a.tray),null);ids=selection.tap('t3',a.tray);}
    room.arrange(a.id,ids,7000);assert.equal(text(a),'XCATY');
    selection.mode='range';selection.tap('t1',a.tray);selection.tap('t3',a.tray);
    const choice=submissionChoice(room.privateState(a.id,7000),selection.range(a.tray));
    assert.equal(choice.word,'CAT');assert.equal(choice.keep,'XY');
    const result=submit(room,a,choice.tileIds);assert.equal(result.points,scoreWord('CAT'));assert.equal(text(a),'XY');
    selection.useAll();assert.equal(selection.range(a.tray),null);
  }
});
test('rearrange rejects forged, duplicate, partial or stale inventories without losing tiles',()=>{
  const {room,a}=setup();a.tray=tiles('CAT');const before=structuredClone(a.tray);
  for(const ids of [['t0','t0','t2'],['t0','t1','fake'],['t0','t1'],null]){
    assert.throws(()=>room.arrange(a.id,ids,7000),/tray changed/);assert.deepEqual(a.tray,before);
  }
  a.tray.push({id:'new',letter:'S'});assert.throws(()=>room.arrange(a.id,before.map(t=>t.id),7000),/tray changed/);
});
test('middle discard and default last discard preserve every other tile and cooldown',()=>{
  const {room,a}=setup();a.tray=tiles('CXAT');room.discard(a.id,'t1',7000);assert.equal(text(a),'CAT');
  assert.throws(()=>room.discard(a.id,'t2',7500),/Wait/);room.discard(a.id,a.tray.at(-1).id,8000);assert.equal(text(a),'CA');
});
test('shuffle is free, preserves inventory and star flags, and enforces three seconds',()=>{
  const {room,a}=setup();a.tray=tiles('CATS');a.tray[0].doubleScore=true;room.random=()=>0;
  const original=structuredClone(a.tray);room.shuffle(a.id,7000);assert.notEqual(text(a),'CATS');
  assert.deepEqual([...a.tray].sort((x,y)=>x.id.localeCompare(y.id)),original);assert.equal(a.score,0);
  assert.throws(()=>room.shuffle(a.id,9999),/3 seconds/);room.shuffle(a.id,10000);assert.equal(a.shuffleReadyAt,13000);
});
test('full dead tray has no offers and useful discard guidance; a full solvable tray is not declared dead',()=>{
  const dead=inspectTray(tiles('QZXJKQZXJK'),new Set(),words);
  assert.equal(dead.possibleCount,0);assert.equal(dead.best,null);assert.ok(dead.leastUseful.length);assert.ok(dead.smartDiscard);
  const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  assert.match(source,/const stuck=\(full\|\|state.self.tray.length>=6\)&&guide\?\.possibleCount===0/);
  assert.ok(source.includes('No words from these letters, discard one or Shuffle.'));
  const solvable=inspectTray(tiles('ETANGLEENC'),new Set(),words);assert.ok(solvable.possibleCount>0);assert.equal(solvable.best.word,'ELEGANCE');
});
test('reported ETANGLEENC works with the real bundled dictionary, including ELEGANCE for 61 points',()=>{
  const dictionary=new Set(readFileSync(wordListPath,'utf8').split('\n').map(w=>w.toUpperCase()).filter(w=>/^[A-Z]{3,10}$/.test(w)));
  const guide=inspectTray(tiles('ETANGLEENC'),new Set(),dictionary);
  assert.equal(guide.longest.word,'ELEGANCE');assert.equal(guide.best.points,61);assert.ok(guide.possibleCount>100);
  const index=wordIndex(dictionary);assert.deepEqual(index.find('ETANGLEENC'),index.find('CNEELGNATE'));
});
test('smart discard keeps most possible words and otherwise chooses the best vowel recovery slot',()=>{
  const {room,a}=setup();a.tray=tiles('CATX');let advice=room.trayAdvice(a);assert.equal(advice.smartDiscard.tileId,'t3');
  room.smartDiscard(a.id,7000);assert.equal(text(a),'CAT');assert.equal(a.score,0);
  a.tray=tiles('CTQ');advice=room.trayAdvice(a);assert.equal(advice.smartDiscard.tileId,'t2');assert.equal(advice.smartDiscard.recoveryWords,1);
  room.smartDiscard(a.id,8000);assert.equal(text(a),'CT');
});
test('live full/range validation, unused words, best versus longest, stars and duplicate letters agree',()=>{
  const dictionary=new Set(['CAT','CATS','JAZZ']);const tray=tiles('CATSJAZZ');tray[0].doubleScore=true;
  let guide=inspectTray(tray,new Set(),dictionary),self={tray,wordGuide:guide};
  assert.equal(submissionChoice(self).valid,false);assert.equal(submissionChoice(self,{start:0,end:3}).points,scoreWord('CAT')*2);
  assert.equal(guide.best.word,'JAZZ');assert.equal(guide.longest.length,4);
  guide=inspectTray(tiles('JAZ'),new Set(),dictionary);assert.equal(guide.possibleCount,0);
  guide=inspectTray(tiles('CAT'),new Set(['CAT']),dictionary);assert.equal(submissionChoice({tray:tiles('CAT'),wordGuide:guide}).valid,false);
  assert.equal(inspectTray(tiles('CAT'),new Set(),words).usefulness.S,'useful');
  assert.equal(inspectTray(tiles('QZ'),new Set(),words).usefulness.X,'dim');
});
test('Shorter word offer arranges and selects the longest word without consuming leftovers',()=>{
  const {room,a}=setup();a.tray=tiles('TACXS');const offer=room.trayAdvice(a).longest,used=new Set(offer.tileIds);
  room.arrange(a.id,[...offer.tileIds,...a.tray.filter(t=>!used.has(t.id)).map(t=>t.id)],7000);
  const selection=new TraySelection();selection.selectWord(offer.tileIds);
  const choice=submissionChoice(room.privateState(a.id,7000),selection.range(a.tray));assert.equal(choice.word,offer.word);
  assert.equal(choice.length,4);assert.equal(choice.keep,'X');assert.equal(a.score,0);
});
test('stuck vowel is gifted after twenty seconds, does not recur within forty-five, and respects progress',()=>{
  const {room,a,b}=setup();b.connected=false;a.tray=tiles('CT');a.lastProgressAt=7000;
  room.updateStuckPlayers(26999);assert.equal(text(a),'CT');room.updateStuckPlayers(27000);
  assert.equal(text(a),'CTA');assert.equal(a.tray.at(-1).gift,true);assert.equal(a.lastGiftAt,27000);
  room.updateStuckPlayers(71999);assert.equal(a.tray.length,3);room.updateStuckPlayers(72000);assert.equal(a.tray.length,4);
  a.lastProgressAt=116999;room.updateStuckPlayers(117000);assert.equal(a.tray.length,4);
});
test('full tray reserves its vowel without replacing a tile; middle discard delivers it exactly once',()=>{
  const {room,a}=setup();a.tray=tiles('QZXJKQZXJK');const before=structuredClone(a.tray);a.lastProgressAt=7000;
  room.updateStuckPlayers(27000);assert.deepEqual(a.tray,before);assert.ok(VOWELS.includes(a.pendingVowel));
  const gift=a.pendingVowel;room.discard(a.id,'t4',28000);assert.equal(a.tray.length,10);assert.equal(a.tray.at(-1).letter,gift);
  assert.deepEqual(a.tray.slice(0,9),before.filter(t=>t.id!=='t4'));assert.equal(a.pendingVowel,null);
  room.updateStuckPlayers(50000);assert.equal(a.pendingVowel,null);assert.equal(a.tray.length,10);
  assert.equal(room.events.filter(e=>e.type==='vowelGift'&&e.playerId===a.id).length,1);
});
test('review, reset and disconnection defer automatic vowel delivery',()=>{
  for(const modifier of [{wordMode:true},{resetUntil:40000},{connected:false},{protectionUntil:40000}]){
    const {room,a}=setup();a.tray=tiles('CT');a.lastProgressAt=7000;Object.assign(a,modifier);
    room.updateStuckPlayers(27000);assert.equal(text(a),'CT');assert.equal(a.pendingVowel,null);
  }
});
test('weighted supply keeps rare values/frequencies, nudges local vowels and stays near its field target',()=>{
  assert.equal(TILE_FREQUENCIES.E,12);for(const l of 'JQXZK')assert.equal(TILE_FREQUENCIES[l],1);
  assert.equal(VALUES.Q,10);assert.equal(VALUES.J,8);assert.equal(VALUES.K,5);
  const {room,a}=setup();room.random=seeded();
  for(let i=0;i<200;i++)room.letters.push({letter:drawLetter(room),expiresAt:100000});
  assert.ok(vowelShare(room).share>=.35&&vowelShare(room).share<=.4);
  room.letters=[];room.random=()=>.5;a.tray=tiles('CT');assert.ok(VOWELS.includes(drawLetter(room,a)));
  a.tray=tiles('AEIOUA');assert.ok(!VOWELS.includes(drawLetter(room,a)));
});
test('nearby supply adds accessible letters within six hundred pixels and removes only its own far extras',()=>{
  const {room,a,b}=setup();room.random=seeded(93);room.nextSupplyAt=7000;b.connected=false;
  const far={id:'old',letter:'Q',x:1600,y:800,expiresAt:99999};room.letters=[far];
  replenishNearbyLetters(room,7000);const local=room.letters.filter(t=>t.localSupply);assert.equal(local.length,2);
  assert.ok(local.every(t=>distance(t,a)<=600&&distance(t,a)>=180));assert.ok(room.letters.includes(far));
  a.x=1500;a.y=1000;room.nextSupplyAt=0;replenishNearbyLetters(room,9000);
  assert.ok(local.every(t=>!room.letters.includes(t)));assert.ok(room.letters.includes(far));
});
test('vowel balancing never relabels collected, released, or nearby crystal letters',()=>{
  const {room,a,b}=setup();a.tray=tiles('CT');b.connected=false;room.simulationNow=7000;
  const near={id:'near',letter:'Q',x:110,y:100},released={id:'released',letter:'Z',x:1500,y:900,expiresAt:20000};
  room.crystals=[near,...Array.from({length:30},(_,i)=>({id:String(i),letter:'X',x:1500,y:900}))];room.letters=[released];
  balanceDistantCrystals(room);assert.equal(near.letter,'Q');assert.equal(released.letter,'Z');assert.equal(text(a),'CT');
  assert.ok(vowelShare(room).share>=.35&&vowelShare(room).share<=.4);
});
test('magnet pulls one nearest useful eligible pickup gently, including seams, without changing incoming threats',()=>{
  const {room,a,b}=setup();a.tray=tiles('CT');b.connected=false;a.x=2390;
  const letter=(id,letter,x,extra={})=>({id,letter,x,y:100,expiresAt:20000,priorityUntil:0,...extra});
  const close=letter('a','A',40),far=letter('b','A',55),neutral=letter('z','Z',32),threat=letter('incoming','A',35,{incoming:true,vx:-40});
  room.letters=[close,far,neutral,threat];const paths=new Map();room.moveMagnetLetters(.1,7000,paths);
  assert.ok(Math.abs(close.x-35.8)<1e-8);assert.equal(paths.size,1);assert.equal(far.x,55);assert.equal(neutral.x,32);assert.equal(threat.x,35);
  close.ownerId=b.id;close.priorityUntil=10000;far.incoming=true;room.moveMagnetLetters(.1,7000,new Map());assert.ok(Math.abs(close.x-35.8)<1e-8);
});
test('bounties use available field plus a single pilot tray, never pool rival private inventories',()=>{
  const {room,a,b}=setup(new Set(['CAT']));a.tray=tiles('C');b.tray=tiles('AT');
  room.updateObjectives(room.startAt+RULES.bountyFirstMs);assert.equal(room.bounty,null);
  room.bountyCycle=-1;room.letters=[{letter:'A',expiresAt:99999},{letter:'T',expiresAt:99999}];
  room.updateObjectives(room.startAt+RULES.bountyFirstMs);assert.equal(room.bounty.word,'CAT');assert.equal(room.bounty.bonus,20);
});
test('asteroid labels correspond to preserved letter rewards, extra vowel, star, or personal shield recharge',()=>{
  for(const rewardType of ['letters','vowel','double','shield']){
    const {room,a}=setup();a.cooldownUntil=30000;
    const rock={id:'rock',x:600,y:600,r:48,rotation:0,letterCount:4,rewardType};
    room.openAsteroid(rock,{ownerId:a.id,team:a.team},7000);
    assert.equal(room.letters.length,rewardType==='vowel'?5:4);assert.ok(room.letters.some(t=>VOWELS.includes(t.letter)));
    assert.equal(room.letters.filter(t=>t.doubleScore).length,rewardType==='double'?1:0);
    assert.ok(room.letters.every(t=>t.ownerId===a.id&&t.priorityUntil===9000));
    if(rewardType==='shield')assert.equal(a.cooldownUntil,7000);
    room.openAsteroid(rock,{ownerId:a.id},7100);assert.equal(room.letters.length,rewardType==='vowel'?5:4);
  }
});
test('star doubles the normal word score only once; bounty stays twenty and unused stars remain',()=>{
  const {room,a}=setup();a.tray=tiles('XCATZ');for(const t of a.tray)t.doubleScore=true;
  room.bounty={word:'CAT',startsAt:6000,expiresAt:12000,bonus:20,claimedBy:null};
  const result=submit(room,a,a.tray.slice(1,4).map(t=>t.id));
  assert.equal(result.points,scoreWord('CAT')*2+20);assert.equal(result.multiplier,2);assert.equal(result.bonus,20);
  assert.equal(text(a),'XZ');assert.ok(a.tray.every(t=>t.doubleScore));assert.equal(room.defense.earthHealth,100);
});
test('active word shield banks only one asteroid recharge and keeps its original expiry',()=>{
  const {room,a}=setup();room.wordMode(a.id,true,7000);const expires=a.shieldUntil;
  for(let i=0;i<2;i++)room.openAsteroid({id:'r'+i,x:600,y:600,r:48,rotation:0,rewardType:'shield'},{ownerId:a.id},7100+i);
  assert.equal(a.shieldUntil,expires);assert.equal(a.rechargeCredit,true);room.endShield(a,8000);assert.equal(a.cooldownUntil,8000);assert.equal(a.rechargeCredit,false);
  room.wordMode(a.id,false,8000);room.wordMode(a.id,true,8100);room.endShield(a,8200);assert.equal(a.cooldownUntil,8200+RULES.cooldownMs);
});
test('guided tips advance only on the matching action, persist completion and allow dismissal',()=>{
  let saved=0;const tips=new FlightTips(false,()=>saved++);
  tips.action('submit');assert.equal(tips.step,0);tips.action('collect');assert.match(tips.text,/Rearrange/);
  tips.action('collect');assert.equal(tips.step,1);tips.action('arrange');assert.match(tips.text,/Enter/);tips.action('submit');assert.equal(tips.text,'');assert.equal(saved,1);
  const returning=new FlightTips(true);assert.equal(returning.text,'');const skipped=new FlightTips(false,()=>saved++);skipped.dismiss();assert.equal(saved,2);
});
test('zero score after forty-five seconds suggests a short available word, not the largest scoring anagram',()=>{
  const {room,a}=setup();a.tray=tiles('CATSTEA');assert.equal(room.privateState(a.id,room.startAt+44999).wordGuide.nudge,null);
  const advice=room.privateState(a.id,room.startAt+45000).wordGuide;assert.equal(advice.shortWord.length,3);assert.ok(advice.nudge.includes(advice.shortWord.word));
  a.score=1;assert.equal(room.privateState(a.id,room.startAt+45001).wordGuide.nudge,null);
});
test('Earth renderer adds a red impact ring and world-space wave countdown; reduced motion retains static warning',()=>{
  const {room}=setup();room.defense.lastImpactAt=7000;room.defense.nextWaveAt=16000;
  for(const reduced of [false,true]){
    const strokes=[],labels=[];const ctx=new Proxy({stroke(){strokes.push(this.strokeStyle);},fillText(s){labels.push(s);},createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:(()=>{})});
    drawEarth(ctx,100,100,1,room.defense,null,null,7100,reduced);
    assert.ok(strokes.includes('#FF3366'));assert.ok(labels.includes('INCOMING WAVE · 9s'));
  }
});
