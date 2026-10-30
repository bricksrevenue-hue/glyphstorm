import test from 'node:test';
import assert from 'node:assert/strict';
import {GameRoom} from '../server/game.mjs';
import {RULES,scoreWord} from '../public/rules.js';
import {POWER_UPS,POWER_RULES,comboKey,activePowerUp,syncPowerUpState,currentPowerUp,powerUpTimer,powerUpStatus,incomingSpeedFactor} from '../public/power-ups.js';
import {drawEarth} from '../public/planet.js';
import {drawNeonGrid,letterGlow} from '../public/neon.js';
const words=['CAT','DOG','STAR','MOON','SUN','PLANET','COMET','NOVA','DUST','GLOW'];
function setup(mode='ffa',defense=true,count=2){
  let seed=81;
  const room=new GameRoom('POWERX',{words:new Set(words),now:1000,random:()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296)});
  const players=Array.from({length:count},(_,i)=>room.addPlayer('Pilot '+i,1000+i));
  room.configure(players[0].id,{mode,minutes:3,defense,disruption:false});players.forEach(p=>p.ready=true);
  room.start(players[0].id,1000);room.tick(0,4000);room.replenishFields=()=>{};room.crystals=[];room.asteroids=[];
  players.forEach((p,i)=>Object.assign(p,{x:100+i*250,y:100,protectionUntil:0}));
  return {room,players};
}
function spell(room,p,text,now=7000){p.tray=[...text].map(letter=>({id:room.id(),letter}));room.wordMode(p.id,true,now);return room.submit(p.id,p.tray.map(l=>l.id),now);}
function incoming(room,x=1800){const l={id:room.id(),letter:'A',incoming:true,x,y:800,vx:-100,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:50000};room.letters.push(l);return l;}

test('fifth valid word triggers each random power once with 480 frames and unchanged word points',()=>{
  for(const [index,kind]of Object.values(POWER_UPS).entries()){
    const {room,players:[p]}=setup();room.random=()=>(index+.1)/3;
    words.slice(0,4).forEach((w,i)=>spell(room,p,w,7000+i*100));assert.equal(room.powerUps.currentPowerUp,null);
    const entry=spell(room,p,words[4],7400);
    assert.equal(entry.points,scoreWord(words[4]));assert.equal(room.powerUps.currentPowerUp,kind);
    assert.equal(room.powerUps.powerUpTimer,480);assert.equal(room.powerUps.endsAt,15400);
    assert.equal(room.powerUps.comboWords[p.id],5);assert.equal(room.events.filter(e=>e.type==='powerUpStart').length,1);
  }
});

test('team combos combine teammates but not rivals; free-for-all keeps separate pilot combos',()=>{
  const {room,players:[a,b,c]}=setup('teams',true,4);
  assert.equal(a.team,c.team);assert.notEqual(a.team,b.team);
  spell(room,a,'CAT');spell(room,c,'CAT');spell(room,a,'DOG');spell(room,c,'DOG');spell(room,b,'CAT');
  assert.equal(room.powerUps.currentPowerUp,null);spell(room,c,'STAR');
  assert.equal(room.powerUps.comboWords['team-'+a.team],5);assert.equal(room.powerUps.comboWords['team-'+b.team],1);
  const ffa=setup(),[x,y]=ffa.players;words.slice(0,4).forEach(w=>spell(ffa.room,x,w));spell(ffa.room,y,'CAT');
  assert.equal(ffa.room.powerUps.currentPowerUp,null);assert.equal(ffa.room.powerUps.comboWords[x.id],4);
});

test('invalid or reused words reset only the owning combo and do not undo an active effect',()=>{
  const {room,players:[a,b]}=setup();words.slice(0,5).forEach(w=>spell(room,a,w));spell(room,b,'CAT');
  const ends=room.powerUps.endsAt,kind=room.powerUps.currentPowerUp;
  assert.throws(()=>spell(room,a,'ZZZ'),/dictionary/);assert.equal(room.powerUps.comboWords[a.id],0);assert.equal(room.powerUps.comboWords[b.id],1);
  assert.equal(room.powerUps.currentPowerUp,kind);assert.equal(room.powerUps.endsAt,ends);
  spell(room,a,'PLANET');assert.throws(()=>spell(room,a,'PLANET'),/already scored/);assert.equal(room.powerUps.comboWords[a.id],0);
});

test('each milestone replaces one effect, expires at eight seconds, and frame mirrors work at 30/60/120 FPS',()=>{
  const {room,players:[p]}=setup();room.random=()=>0;
  words.slice(0,5).forEach(w=>spell(room,p,w,7000));room.random=()=>.99;
  words.slice(5).forEach(w=>spell(room,p,w,10000));assert.equal(room.powerUps.currentPowerUp,POWER_UPS.SLOW_MOTION);
  assert.equal(room.powerUps.endsAt,18000);assert.equal(room.events.filter(e=>e.type==='powerUpStart').length,2);
  for(const fps of [30,60,120]){
    for(let frame=0;frame<=fps*8;frame++)syncPowerUpState(room.powerUps,10000+frame*1000/fps);
    assert.equal(currentPowerUp,null);assert.equal(powerUpTimer,0);
  }
  room.updatePowerUps(14000);assert.equal(room.powerUps.powerUpTimer,240);
  room.updatePowerUps(17999);assert.equal(room.powerUps.powerUpTimer,1);
  room.updatePowerUps(18000);room.updatePowerUps(19000);assert.equal(room.powerUps.currentPowerUp,null);
  assert.equal(room.events.filter(e=>e.type==='powerUpEnd').length,1);
});

test('invulnerability removes breaches without damage or red-flash state; expiry restores damage exactly once',()=>{
  const {room,players:[p]}=setup();room.defense.earthHealth=5;
  room.activatePowerUp(POWER_UPS.INVULNERABILITY,p,7000);let l=incoming(room,room.defense.x+190);
  room.tick(0,14999);assert.equal(room.defense.earthHealth,5);assert.equal(room.defense.lastImpactAt,0);assert.equal(room.defense.breaches,0);
  assert.ok(!room.letters.includes(l));assert.equal(room.phase,'playing');assert.equal(room.handleBarrierCollision(l,14999),false);
  l=incoming(room,room.defense.x+190);room.tick(0,15000);assert.equal(room.defense.earthHealth,0);assert.equal(room.phase,'results');
  assert.equal(room.events.filter(e=>e.type==='barrierBlock').length,1);assert.equal(room.events.filter(e=>e.type==='barrierImpact').length,1);
});

test('slow motion uses 0.4 displacement without compounding or changing ships, pulses, or base letter velocity',()=>{
  const {room,players:[p]}=setup();const l=incoming(room);p.vx=RULES.speed;
  room.activatePowerUp(POWER_UPS.SLOW_MOTION,p,7000);
  room.input(p.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:true},7000);
  room.tick(.1,7100);assert.equal(l.x,1796);assert.equal(l.vx,-100);
  assert.equal(p.vx,RULES.speed);assert.equal(room.pulses[0].vx,RULES.pulseSpeed);
  room.tick(.1,7200);assert.equal(l.x,1792);assert.equal(l.vx,-100);
  room.tick(.1,15000);assert.equal(l.x,1782);assert.equal(l.vx,-100);assert.equal(incomingSpeedFactor(room.powerUps,15000),1);
});

test('EMP preserves safe letter identities and positions, neutralizes new waves only while active, and awards no points',()=>{
  const {room,players:[p]}=setup();const first=incoming(room),ordinary={...incoming(room,1900),incoming:false};room.letters[1]=ordinary;
  const original=structuredClone(ordinary);room.activatePowerUp(POWER_UPS.EMP_BLAST,p,7000);
  assert.equal(room.letters[0],first);assert.equal(first.x,1800);assert.equal(first.incoming,false);assert.equal(first.priorityUntil,0);assert.equal(first.vx,0);
  assert.deepEqual(ordinary,original);assert.equal(p.score,0);
  const later=incoming(room,1750);room.tick(.1,7100);assert.equal(later.incoming,false);assert.equal(later.x,1750);
  const after=incoming(room,1700);room.tick(.1,15000);assert.equal(after.incoming,true);assert.equal(after.x,1690);
  assert.equal(room.letters.length,4);assert.equal(p.score,0);
});

test('power-ups are per-room, disabled in classic, cleared at finish and reset on rematch',()=>{
  const {room,players:[p]}=setup(),other=setup().room;room.activatePowerUp(POWER_UPS.INVULNERABILITY,p,7000);
  assert.equal(other.powerUps.currentPowerUp,null);assert.notEqual(room.powerUps.comboWords,other.powerUps.comboWords);
  room.finish(room.endAt);assert.equal(room.powerUps.currentPowerUp,null);assert.equal(room.powerUps.powerUpTimer,0);
  room.lobby(p.id,room.endAt+1);room.active().forEach(p=>p.ready=true);room.start(p.id,room.endAt+1000);
  assert.deepEqual(room.powerUps.comboWords,{});assert.equal(room.powerUps.currentPowerUp,null);
  const classic=setup('ffa',false);words.slice(0,5).forEach(w=>spell(classic.room,classic.players[0],w));
  assert.equal(classic.room.powerUps.currentPowerUp,null);assert.deepEqual(classic.room.powerUps.comboWords,{});
});

test('shared countdown displays the owning team and spectators see the same effect with stale expiry handled',()=>{
  const {room,players:[p]}=setup('teams');room.activatePowerUp(POWER_UPS.SLOW_MOTION,p,7000);
  room.powerUps.comboWords[comboKey(p,'teams')]=5;
  const state=room.publicState(7000),view=powerUpStatus(state,p.id,9000),watch=powerUpStatus(state,'watcher',9000);
  assert.equal(view.kind,POWER_UPS.SLOW_MOTION);assert.equal(view.timer,'6.0s');assert.match(view.source,/Aurora/);
  assert.equal(watch.timer,view.timer);assert.match(watch.combo,/Every 5/);assert.equal(powerUpStatus(state,p.id,15000).kind,null);
});

test('neon grid animates and freezes for reduced motion; letters glow and violet shield returns to cyan on expiry',()=>{
  function context(){const calls=[];const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},
    {get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args]),set:(o,k,v)=>{calls.push([k,v]);o[k]=v;return true;}});return {ctx,calls};}
  const a=context(),b=context(),c=context(),d=context();
  drawNeonGrid(a.ctx,800,600,0);drawNeonGrid(b.ctx,800,600,1000);assert.notDeepEqual(a.calls,b.calls);
  drawNeonGrid(c.ctx,800,600,0,true);drawNeonGrid(d.ctx,800,600,1000,true);assert.deepEqual(c.calls,d.calls);
  letterGlow(a.ctx,{color:'#ff2bd6'});assert.equal(a.ctx.shadowBlur,10);assert.equal(a.ctx.shadowColor,'#ff2bd6');
  const {room,players:[p]}=setup();room.activatePowerUp(POWER_UPS.INVULNERABILITY,p,7000);
  drawEarth(a.ctx,300,300,1,room.defense,null,room.powerUps,7000);
  assert.ok(a.calls.some(([k,v])=>k==='shadowColor'&&v==='#bd00ff'));assert.ok(a.calls.some(([k,v])=>k==='lineWidth'&&v>=12));
  drawEarth(b.ctx,300,300,1,room.defense,null,room.powerUps,15000);
  assert.ok(b.calls.some(([k,v])=>k==='shadowColor'&&v==='#00f3ff'));assert.ok(b.calls.some(([k,v])=>k==='lineWidth'&&v===5));
});
