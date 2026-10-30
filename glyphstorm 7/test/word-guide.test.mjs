import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectTray, suggestWord, pickupReason } from '../server/word-guide.mjs';
import { submissionChoice, pickupExplanation } from '../public/word-guide.js';
import { PracticeRun } from '../public/practice.js';
import { GameRoom } from '../server/game.mjs';
import { scoreWord } from '../public/rules.js';
const words=new Set(['CAT','CATS','DOG','SUN','STAR','MOON','TEA','EAT','ATE']);
const tray=word=>[...word].map((letter,i)=>({id:'tile-'+i,letter}));
function setup(){
  const room=new GameRoom('GUIDED',{words,random:()=>.25,now:1000});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1000);a.ready=b.ready=true;room.start(a.id,1000);room.tick(0,4000);
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  for(const [i,p] of [a,b].entries())Object.assign(p,{x:100+i*500,y:100,protectionUntil:0});
  return {room,a,b};
}
test('anagram advice is separate from explicit full-tray or range submission',()=>{
  const used=new Set();
  for(const [letters,expected] of [['CATX','CAT'],['CATS','CATS'],['CATSX','CATS'],['CAXT','CAT'],['TAC','CAT'],['CA',null]]){
    const tiles=tray(letters),guide=inspectTray(tiles,used,words),before=JSON.stringify(tiles);
    assert.equal(guide.best?.word||null,expected);
    const full=submissionChoice({tray:tiles,wordGuide:guide});assert.equal(full.valid,words.has(letters));
    assert.equal(JSON.stringify(tiles),before);
  }
  used.add('CATS');assert.equal(inspectTray(tray('CATS'),used,words).best.word,'CAT');
  used.add('CAT');const guide=inspectTray(tray('CAT'),used,words);assert.equal(guide.best,null);assert.match(submissionChoice({tray:tray('CAT'),wordGuide:guide}).message,/Already used/);
});
test('manual review never silently replaces an invalid selection; stale advice cannot submit',()=>{
  const tiles=tray('CATX'),self={tray:tiles,wordGuide:inspectTray(tiles,new Set(),words)};
  assert.equal(submissionChoice(self,3).word,'CAT');assert.equal(submissionChoice(self,4).valid,false);
  assert.match(submissionChoice(self,2).message,/at least 3 letters/);
  self.tray=[...tiles,{id:'new',letter:'S'}];assert.match(submissionChoice(self).message,/Checking/);
});
test('private advice does not score, repair or reset combos; chosen prefix scores once through normal validation',()=>{
  const {room,a,b}=setup();a.tray=tray('CATX');b.tray=tray('DOG');room.powerUps.comboWords[a.id]=4;room.defense.earthHealth=90;
  for(let i=0;i<10;i++){const state=room.privateState(a.id,7000);assert.equal(state.wordGuide.best.word,'CAT');assert.equal(state.wordGuide.entries.some(e=>e.word==='DOG'),false);}
  assert.equal(a.score,0);assert.equal(room.defense.earthHealth,90);assert.equal(room.powerUps.comboWords[a.id],4);
  const publicState=room.publicState(7000);assert.ok(publicState.players.every(p=>!('wordGuide'in p)&&!('tray'in p)));
  const choice=submissionChoice(room.privateState(a.id,7000),{start:0,end:3}),ids=a.tray.slice(0,choice.length).map(t=>t.id);
  room.wordMode(a.id,true,7000);room.submit(a.id,ids,7000);
  assert.equal(a.score,scoreWord('CAT'));assert.equal(a.tray.map(t=>t.letter).join(''),'X');assert.equal(room.defense.earthHealth,92);assert.equal(room.powerUps.comboWords[a.id],5);
  assert.throws(()=>room.submit(a.id,ids,7001));assert.equal(a.score,scoreWord('CAT'));
});
test('suggestions use available letters and dictionary, remain stable and do not force a word',()=>{
  const {room,a}=setup();room.crystals=[...'SUN'].map(letter=>({letter}));
  let suggestion=suggestWord(a,room,7000);assert.equal(suggestion.word,'SUN');assert.equal(suggestion.next,'S');assert.equal(suggestion.available,true);
  a.guideTarget='SUN';room.crystals=[];a.tray=tray('S');suggestion=suggestWord(a,room,7000);assert.equal(suggestion.word,'SUN');assert.equal(suggestion.next,'U');assert.equal(suggestion.available,false);
  a.used.add('SUN');assert.notEqual(suggestWord(a,room,7000)?.word,'SUN');a.tray=tray('QXZ');assert.equal(suggestWord(a,room,7000),null);
  assert.deepEqual(a.tray,tray('QXZ'));assert.equal(a.score,0);
});
test('private pickup explanation honors priority, protection, review, capacity and expiry without changing collection',()=>{
  const {room,a,b}=setup();room.letters=[{id:'reserved',letter:'A',x:100,y:100,ownerId:b.id,team:b.team,priorityUntil:9000,expiresAt:20000}];
  room.collectLetters(new Map([[a.id,{x:100,y:100}]]),new Set(['reserved']),7000);
  assert.equal(a.tray.length,0);assert.match(room.privateState(a.id,7000).pickupNotice.message,/Reserved/);assert.equal(room.privateState(b.id,7000).pickupNotice,null);
  assert.match(pickupExplanation({self:room.privateState(a.id,7000)},a,7000),/Reserved/);
  assert.equal(pickupExplanation({self:room.privateState(a.id,9001)},a,9001),'');
  room.collectLetters(new Map(),new Set(['reserved']),9001);assert.equal(a.tray.length,1);assert.equal(room.letters.length,0);
  a.wordMode=true;assert.match(pickupReason(a,null,'ffa',9002),/Review/);a.wordMode=false;a.protectionUntil=10000;assert.match(pickupReason(a,null,'ffa',9002),/protection/);
  a.protectionUntil=0;a.tray=tray('ABCDEFGHIJ');assert.match(pickupReason(a,null,'ffa',9002),/Board full/);
});
test('discard last corrects an unwanted suffix, respects cooldown and preserves remaining order',()=>{
  const {room,a}=setup();a.tray=tray('CAX');const ids=a.tray.map(t=>t.id);
  room.discard(a.id,ids.at(-1),7000);assert.deepEqual(a.tray.map(t=>t.id),ids.slice(0,2));
  assert.throws(()=>room.discard(a.id,ids[1],7100),/Wait/);assert.equal(a.tray.map(t=>t.letter).join(''),'CA');
  a.tray.push({id:'t',letter:'T'});assert.equal(room.privateState(a.id,8000).wordGuide.best.word,'CAT');
});
test('practice requires a real pulse, ordered pickups, correction and explicit submission; restarting is isolated',()=>{
  const run=new PracticeRun(),idle={x:0,y:0,angle:0,pulse:false};
  assert.equal(run.submit(),false);assert.equal(run.discardLast(),false);
  for(let i=0;i<30;i++)run.update({...idle,pulse:true},1/60);
  assert.equal(run.step,'collectC');assert.equal(run.crystal,null);
  const collect=()=>{const tile=run.letters[0];Object.assign(run.ship,{x:tile.x,y:tile.y,vx:0,vy:0});run.update(idle,0);};
  collect();assert.deepEqual(run.tray,['C']);collect();assert.deepEqual(run.tray,['C','X']);assert.equal(run.step,'discard');assert.equal(run.submit(),false);
  assert.equal(run.discardLast(),true);assert.deepEqual(run.tray,['C']);collect();collect();assert.equal(run.step,'submit');assert.equal(run.points,0);
  assert.equal(run.submit(),true);assert.equal(run.points,scoreWord('CAT'));assert.equal(run.submit(),false);
  const other=new PracticeRun();assert.equal(other.points,0);assert.deepEqual(other.tray,[]);
});
