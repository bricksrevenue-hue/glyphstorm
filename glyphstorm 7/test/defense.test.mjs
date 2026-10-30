import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { DEFENSE, sweepCircle, syncDefenseState, earthHealth, barrierThickness, maxBarrierThickness } from '../public/defense.js';
import { RULES } from '../public/rules.js';
import { Arena, MAX_PARTICLES } from '../public/arena.js';
import { drawEarth } from '../public/planet.js';

function setup(enabled=true){
  let seed=515;
  const room=new GameRoom('DEFEND',{words:new Set(['CAT','STAR','PLANET','DOG']),random:()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296)});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
  room.configure(a.id,{mode:'ffa',minutes:3,disruption:false,defense:enabled});a.ready=b.ready=true;
  room.start(a.id,1000);room.tick(0,4000);
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  for(const [i,p] of [a,b].entries())Object.assign(p,{x:100+i*300,y:100,protectionUntil:0});
  return {room,a,b};
}
const boundary=room=>room.defense.barrierRadius+room.defense.barrierThickness/2+RULES.letterRadius;
function incoming(room,offset=0,overrides={}){
  const letter={id:room.id(),letter:'A',incoming:true,x:DEFENSE.x+boundary(room)+offset,y:DEFENSE.y,
    vx:-100,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:50000,...overrides};
  room.letters.push(letter);return letter;
}
function spell(room,p,word,now=7000){
  p.tray=[...word].map(letter=>({id:room.id(),letter}));room.wordMode(p.id,true,now);
  return room.submit(p.id,p.tray.map(l=>l.id),now);
}

test('defense initializes per room, snapshots sync named globals, and only the host can toggle in lobby',()=>{
  const {room,a,b}=setup(),other=setup().room;
  assert.equal(room.defense.earthHealth,100);assert.equal(room.defense.barrierThickness,5);assert.equal(room.defense.maxBarrierThickness,25);
  room.defense.earthHealth=40;syncDefenseState(room.publicState(7000).defense);
  assert.equal(earthHealth,40);assert.equal(barrierThickness,5);assert.equal(maxBarrierThickness,25);assert.equal(other.defense.earthHealth,100);
  assert.throws(()=>room.configure(a.id,{mode:'ffa',minutes:3,disruption:false,defense:false}),/lobby/);
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);
  assert.throws(()=>room.configure(b.id,{mode:'ffa',minutes:3,disruption:false,defense:false}),/host/);
  assert.throws(()=>room.configure(a.id,{mode:'ffa',minutes:3,disruption:false,defense:'false'}),/settings/);
  room.configure(a.id,{mode:'ffa',minutes:3,disruption:false,defense:false});assert.equal(room.defense.enabled,false);
});

test('swept breaches handle boundary, inside, tangent, and fast crossings, applying damage once',()=>{
  for(const offset of [0,-20,10]){
    const {room}=setup(),letter=incoming(room,offset,{vx:-10000});
    room.tick(.1,7000);assert.equal(room.defense.earthHealth,95);assert.equal(room.letters.length,0);
    assert.equal(room.handleBarrierCollision(letter,7001),false);assert.equal(room.defense.earthHealth,95);
    assert.equal(room.events.filter(e=>e.type==='barrierImpact').length,1);
  }
  assert.equal(sweepCircle(-10,5,20,0,5),.5);assert.equal(sweepCircle(-10,6,20,0,5),null);
});

test('letter contacts before a breach collect in physical order; contacts after a breach cannot rescue it',()=>{
  const {room,a}=setup();a.x=DEFENSE.x+boundary(room)+35;a.y=DEFENSE.y;
  const first=incoming(room,80,{letter:'C'}),second=incoming(room,85,{letter:'A'}),third=incoming(room,90,{letter:'T'});
  room.letters=[third,second,first];room.tick(.6,7000);
  assert.equal(a.tray.map(l=>l.letter).join(''),'CAT');assert.equal(room.defense.earthHealth,100);assert.equal(room.letters.length,0);
  a.tray=[];a.x=DEFENSE.x+boundary(room)-80;incoming(room,30,{vx:-1000});room.tick(.2,7100);
  assert.equal(a.tray.length,0);assert.equal(room.defense.earthHealth,95);
});

test('full trays and word review cannot prevent a breach; ordinary released letters remain harmless',()=>{
  for(const review of [false,true]){
    const {room,a}=setup();a.x=DEFENSE.x+boundary(room);a.y=DEFENSE.y;
    if(review)room.wordMode(a.id,true,7000);else a.tray=Array.from({length:10},()=>({id:room.id(),letter:'A'}));
    incoming(room);const harmless=incoming(room,-100,{incoming:false,vx:0});
    room.tick(0,7000);assert.equal(room.defense.earthHealth,95);assert.deepEqual(room.letters,[harmless]);
  }
});

test('existing pulses stop incoming letters before impact, retain pickup priority, and grant no score',()=>{
  const {room,a,b}=setup();const letter=incoming(room,100);
  room.pulses=[{id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:letter.x+50,y:letter.y,vx:-730,vy:0,expiresAt:8000}];
  room.tick(.1,7000);assert.equal(letter.incoming,false);assert.equal(letter.vx,0);assert.equal(letter.ownerId,a.id);
  assert.equal(letter.priorityUntil,9000);assert.equal(room.defense.earthHealth,100);assert.equal(a.score,0);
  b.x=letter.x;b.y=letter.y;room.tick(0,7100);assert.equal(b.tray.length,0);
  room.tick(0,9000);assert.equal(b.tray.length,1);assert.equal(room.letters.length,0);
});

test('late pulse contacts cannot cancel an earlier breach and nearer rocks still block pulses',()=>{
  const {room,a}=setup();let letter=incoming(room,1);
  room.pulses=[{id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:letter.x+60,y:letter.y,vx:-730,vy:0,expiresAt:8000}];
  room.tick(.1,7000);assert.equal(room.defense.earthHealth,95);assert.equal(room.letters.length,0);
  letter=incoming(room,150,{vx:0});
  room.asteroids=[{id:room.id(),x:letter.x+60,y:letter.y,r:24,vx:0,vy:0,hitsRemaining:3}];
  room.pulses=[{id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:letter.x+140,y:letter.y,vx:-1000,vy:0,expiresAt:9000}];
  room.tick(.2,7100);assert.equal(letter.incoming,true);assert.equal(room.asteroids[0].hitsRemaining,2);
});

test('only successful words grow and repair, caps hold, trailing tiles and scoring remain intact',()=>{
  const {room,a,b}=setup();room.defense.earthHealth=95;
  assert.throws(()=>spell(room,a,'ZZZ'),/dictionary/);assert.equal(room.defense.earthHealth,95);assert.equal(room.defense.barrierThickness,5);
  a.tray=[...'CATS'].map(letter=>({id:room.id(),letter}));room.wordMode(a.id,true,7000);
  const entry=room.submit(a.id,a.tray.slice(0,3).map(l=>l.id),7000);
  assert.equal(entry.points,5);assert.equal(a.tray[0].letter,'S');assert.equal(room.defense.earthHealth,97);assert.equal(room.defense.barrierThickness,6.5);
  assert.throws(()=>spell(room,a,'CAT',7100),/already scored/);assert.equal(room.defense.earthHealth,97);
  room.defense.earthHealth=99;room.defense.barrierThickness=24.5;spell(room,b,'PLANET',7200);
  assert.equal(room.defense.earthHealth,100);assert.equal(room.defense.barrierThickness,25);
});

test('fatal damage ends the whole round exactly once, preserves scores, and rematch resets defense',()=>{
  const {room,a}=setup();room.defense.earthHealth=5;a.score=37;
  incoming(room);incoming(room);room.tick(0,7000);
  assert.equal(room.phase,'results');assert.equal(room.defense.earthHealth,0);assert.equal(room.results.reason,'earth-lost');
  assert.deepEqual(room.results.winners,[]);assert.equal(room.results.ranking[0].score,37);assert.equal(room.results.endedAt,7000);
  room.tick(.1,7100);room.finish(7100);assert.equal(room.events.filter(e=>e.type==='finish').length,1);
  assert.throws(()=>spell(room,a,'CAT',7200),/not accepting/);assert.equal(room.defense.earthHealth,0);
  room.lobby(a.id,8000);room.active().forEach(p=>p.ready=true);room.start(a.id,9000);
  assert.equal(room.defense.earthHealth,100);assert.equal(room.defense.barrierThickness,5);assert.equal(room.defense.wave,0);assert.equal(room.letters.length,0);
});

test('wave timing is bounded without catch-up spawns; disabled defense keeps the classic match',()=>{
  const {room}=setup(),first=room.startAt+DEFENSE.firstWaveMs;
  room.tick(0,first-1);assert.equal(room.letters.length,0);
  room.tick(0,first);assert.equal(room.letters.length,1);assert.equal(room.defense.wave,1);
  room.tick(0,first+1);assert.equal(room.letters.length,1);
  room.tick(0,first+60000);assert.equal(room.letters.length,1); // Old tile expired; only current wave is spawned.
  assert.equal(room.defense.wave,8);assert.ok(room.defense.nextWaveAt>first+60000);
  room.tick(0,room.endAt);assert.equal(room.results.reason,'time');assert.equal(room.results.winners.length,2);
  const classic=setup(false).room;classic.tick(0,first+60000);
  assert.equal(classic.letters.length,0);assert.equal(classic.defense.earthHealth,100);
});

test('shield ripples are ten cyan particles over 300ms, normal bursts contrast, and effects stay bounded',()=>{
  const arena=Object.create(Arena.prototype);Object.assign(arena,{particles:[],reduced:false});
  arena.createShieldRipple(100,100,0);assert.equal(arena.particles.length,10);
  assert.ok(arena.particles.every(p=>p.color==='#00f3ff'&&p.life===300&&p.ripple));
  arena.drawParticles({save(){},restore(){}},300);assert.equal(arena.particles.length,0);
  arena.burst({type:'word',x:100,y:100,seq:1},0);assert.deepEqual(new Set(arena.particles.map(p=>p.color)),new Set(['#ff2bd6','#b6ff00','#00f3ff']));
  assert.ok(arena.particles.every(p=>Math.hypot(p.vx,p.vy)>=200));
  for(let i=0;i<100;i++)arena.createShieldRipple(1,1,1);assert.equal(arena.particles.length,MAX_PARTICLES);
  arena.reduced=true;arena.particles=[];arena.createShieldRipple(1,1);assert.equal(arena.particles.length,0);
});

test('Earth uses the authoritative shield radius and thickness with the requested neon aura',()=>{
  const seen=[];const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},
    {get:(o,k)=>k in o?o[k]:(...args)=>seen.push([k,...args]),set:(o,k,v)=>{seen.push([k,v]);o[k]=v;return true;}});
  const d=setup().room.defense;d.barrierThickness=17;
  drawEarth(ctx,300,250,.7,d,null);
  assert.ok(seen.some(([k,v])=>k==='lineWidth'&&v===17));assert.ok(seen.some(([k,v])=>k==='shadowBlur'&&v===15));
  assert.ok(seen.some(([k,v])=>k==='shadowColor'&&v==='#00f3ff'));assert.ok(seen.some(([k,x,y,r])=>k==='arc'&&r===d.barrierRadius));
});
