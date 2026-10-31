import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS } from '../server/dictionary.mjs';
import { inspectTray } from '../server/word-guide.mjs';
import { PREVIEW_WORDS, localWordOffer, SmartTrayPreview } from '../public/smart-tray.js';
import { needsFirstFlight, PracticeRun } from '../public/practice.js';
import { clipSegment, defenseAlert, drawThreatVectors, THREAT_CUES } from '../public/threat-cues.js';
import { NEON, pulseColor } from '../public/neon.js';
import { WORLD, RULES, scoreWord } from '../public/rules.js';
const tray=word=>[...word].map((letter,i)=>({id:'tile-'+i,letter}));

test('First Flight persistence respects completed/skipped sessions, missing names and first visits',()=>{
  assert.equal(needsFirstFlight(null,'Pilot'),true);
  assert.equal(needsFirstFlight('complete','Pilot'),false);
  assert.equal(needsFirstFlight('skipped','Pilot'),false);
  assert.equal(needsFirstFlight('complete',''),true);
});
test('a tutorial pulse fired inside the crystal still opens once at a low frame rate',()=>{
  const r=new PracticeRun();Object.assign(r.ship,{x:280,y:160});
  r.update({x:0,y:0,angle:0,pulse:true},.05);assert.equal(r.pulses.length,0);
  r.update({x:0,y:0,angle:0,pulse:true},.05);
  for(let i=0;i<30;i++)r.update({x:0,y:0,angle:0,pulse:true},.05);
  assert.equal(r.crystal,null);assert.equal(r.tray.length+r.letters.length,3);
  assert.equal(r.submit(),false);assert.equal(r.earthHealth,98);
});
test('all local preview words are in the real dictionary; duplicates, stars and used words work',()=>{
  assert.ok(PREVIEW_WORDS.every(word=>WORDS.has(word)));
  assert.equal(localWordOffer(tray('TAC')).word,'CAT');
  assert.equal(localWordOffer(tray('MNO')),null); // MOON needs two Os.
  assert.equal(localWordOffer(tray('TAC'),new Set(['CAT'])),null);
  const tiles=tray('TAC');tiles[0].doubleScore=true;
  const before=JSON.stringify(tiles),offer=localWordOffer(tiles);
  assert.equal(offer.points,scoreWord('CAT')*2);assert.deepEqual(offer.tileIds,['tile-2','tile-1','tile-0']);
  assert.equal(JSON.stringify(tiles),before);
});
test('preview cache uses full server dictionary and invalidates on letters, round and used-word changes',()=>{
  const cache=new SmartTrayPreview(),tiles=tray('ETANGLEENC'),words=new Set(['ELEGANCE','CAT']);
  const self={tray:tiles,history:[],wordGuide:inspectTray(tiles,new Set(),words)};
  const first=cache.read(self,'one');assert.equal(first.offer.word,'ELEGANCE');assert.equal(first.confirmed,true);
  assert.equal(cache.read(structuredClone(self),'one'),first);
  const before=JSON.stringify(self);cache.read(self,'one');assert.equal(JSON.stringify(self),before);
  self.tray=tray('TAC');const provisional=cache.read(self,'one');assert.equal(provisional.offer.word,'CAT');assert.equal(provisional.confirmed,false);
  self.wordGuide=inspectTray(self.tray,new Set(),words);assert.equal(cache.read(self,'one').confirmed,true);
  self.history=[{word:'CAT'}];self.wordGuide=inspectTray(self.tray,new Set(['CAT']),words);assert.equal(cache.read(self,'one').offer,null);
  self.history=[];self.wordGuide=inspectTray(self.tray,new Set(),words);assert.equal(cache.read(self,'two').offer.word,'CAT');
});
test('semantic pulse colors depend on viewer, team and mode, never mutate server colors',()=>{
  const viewer={id:'a',team:0},pulse={ownerId:'b',team:0,color:'#b5a0ff'};
  assert.equal(pulseColor(pulse,viewer,'ffa'),'#FF3366');assert.equal(pulseColor(pulse,viewer,'teams'),'#FFCC00');
  assert.equal(pulseColor({...pulse,ownerId:'a'},viewer,'ffa'),'#00FF66');
  assert.equal(pulseColor({...pulse,team:1},viewer,'teams'),NEON.pink);assert.equal(pulse.color,'#b5a0ff');
});
test('proximity warning is torus-aware and ignores safe letters, disabled defense and inactive rounds',()=>{
  const s={phase:'playing',defense:{enabled:true,x:20,y:800,earthHealth:100,barrierRadius:190},letters:[]};
  assert.equal(defenseAlert(s).active,false);s.defense.earthHealth=30;assert.equal(defenseAlert(s).active,false);
  s.defense.earthHealth=29;assert.match(defenseAlert(s).label,/CRITICAL/);s.defense.earthHealth=100;
  s.letters=[{x:WORLD.width-260,y:800,incoming:true}];assert.match(defenseAlert(s).label,/THREAT/);
  s.letters[0].incoming=false;assert.equal(defenseAlert(s).active,false);
  s.letters[0].incoming=true;s.defense.enabled=false;assert.equal(defenseAlert(s).active,false);
  s.defense.enabled=true;s.phase='results';assert.equal(defenseAlert(s).active,false);
});
test('vectors clip toward Earth from each screen edge and do not draw paths outside the view',()=>{
  const center={x:400,y:300};
  for(const from of [{x:-100,y:300},{x:900,y:300},{x:400,y:-100},{x:400,y:700}]){
    const path=clipSegment(from,center,800,600);assert.ok(path);assert.deepEqual(path.to,center);
    assert.ok(path.from.x>=8&&path.from.x<=792&&path.from.y>=8&&path.from.y<=592);
  }
  assert.equal(clipSegment({x:-100,y:-100},{x:-50,y:-50},800,600),null);
  assert.equal(clipSegment(center,center,800,600),null);
  const crossing=clipSegment({x:-50,y:300},{x:850,y:300},800,600);assert.deepEqual(crossing,{from:{x:8,y:300},to:{x:792,y:300}});
});
test('incoming vectors are bounded, deduplicated and decorative; visible pickups produce no vector',()=>{
  const lines=[],ctx={save(){},restore(){},setLineDash(){},beginPath(){},moveTo(x,y){lines.push([x,y]);},lineTo(){},stroke(){},fill(){},translate(){},rotate(){},closePath(){}};
  const s={phase:'playing',defense:{enabled:true,x:400,y:300,barrierRadius:80},letters:Array.from({length:40},()=>({x:900,y:300,incoming:true}))};
  const before=JSON.stringify(s);drawThreatVectors(ctx,s,(x,y)=>({x,y}),1,800,600);
  assert.equal(lines.length,2);assert.equal(JSON.stringify(s),before);assert.ok(lines.length<=THREAT_CUES.maxVectors*2);
  lines.length=0;s.letters=[{x:200,y:300,incoming:true},{x:900,y:300,incoming:false}];drawThreatVectors(ctx,s,(x,y)=>({x,y}),1,800,600);assert.equal(lines.length,0);
  assert.ok(RULES.letterRadius>0);
});
