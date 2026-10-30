import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { RULES, WORLD, scoreWord } from '../public/rules.js';
import { missionStatus } from '../public/objectives.js';
import { MatchFeedback } from '../public/match-feedback.js';
import { AsteroidSprites, drawAsteroid } from '../public/asteroids.js';

function setup(words=['STAR','MOON'],mode='ffa'){
  let seed=101;
  const room=new GameRoom('ABCDEF',{words:new Set(words),random:()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296),now:1000});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
  room.configure(a.id,{mode,minutes:3,disruption:false,defense:false}); // Test arcade objectives independently of defense waves.
  a.ready=b.ready=true;
  room.start(a.id,1000);room.tick(0,4000);room.nextSupplyAt=Infinity;
  Object.assign(a,{x:100,y:100,protectionUntil:0});Object.assign(b,{x:2100,y:1300,protectionUntil:0});
  return {room,a,b};
}
function word(room,p,text,now){
  p.tray=[...text].map(letter=>({id:room.id(),letter}));
  room.wordMode(p.id,true,now);return room.submit(p.id,p.tray.map(t=>t.id),now);
}

test('boost normalizes direction, obeys server speed and cooldown, and preserves ordered pickups',()=>{
  const {room,a}=setup();room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  a.x=WORLD.width-40;a.y=400;
  room.letters=[['C',WORLD.width-25],['A',WORLD.width-5],['T',15]].map(([letter,x])=>({id:room.id(),letter,x,y:400,ownerId:null,team:null,priorityUntil:0,expiresAt:50000}));
  room.boost(a.id,{x:999,y:0,speed:99999,boostUntil:99999},7000);
  assert.equal(a.boostUntil,7550);assert.equal(a.boostReadyAt,13000);
  room.tick(.1,7100);assert.equal(a.vx,RULES.boostSpeed);assert.equal(a.x,22);
  assert.equal(a.tray.map(t=>t.letter).join(''),'CAT');assert.equal(a.score,0);assert.equal(a.protectionUntil,0);
  assert.throws(()=>room.boost(a.id,{x:1,y:0},12999),/recharging/);
  room.boost(a.id,{x:1,y:1},13000);assert.ok(Math.abs(Math.hypot(a.boostX,a.boostY)-1)<1e-9);
  room.tick(.1,13100);assert.ok(Math.hypot(a.vx,a.vy)<=RULES.boostSpeed+.001);
});

test('boost rejects invalid roles, malformed input and protected states; zero movement uses heading',()=>{
  const {room,a}=setup();
  const watcher=room.addPlayer('Watcher',7000);
  assert.throws(()=>room.boost(watcher.id,{x:1,y:0},7000),/Spectators/);
  for(const input of [null,{}, {x:NaN,y:0},{x:Infinity,y:0},{x:'1',y:0}])assert.throws(()=>room.boost(a.id,input,7000),/Invalid/);
  assert.equal(a.boostReadyAt,0);
  a.protectionUntil=8000;assert.throws(()=>room.boost(a.id,{x:1,y:0},7000),/protection/);a.protectionUntil=0;
  room.wordMode(a.id,true,7000);assert.throws(()=>room.boost(a.id,{x:1,y:0},7000),/review/);
  room.wordMode(a.id,false,7000);a.angle=Math.PI/2;room.boost(a.id,{x:0,y:0},7100);
  assert.ok(Math.abs(a.boostX)<1e-9);assert.equal(a.boostY,1);
  room.finish(room.endAt);assert.throws(()=>room.boost(a.id,{x:1,y:0},room.endAt),/not accepting/);
});

test('review, reset and disconnect cancel a boost while cooldown survives until the next round',()=>{
  const {room,a}=setup();
  room.boost(a.id,{x:1,y:0},7000);room.wordMode(a.id,true,7100);assert.equal(a.boostUntil,0);
  room.wordMode(a.id,false,7200);assert.equal(a.boostReadyAt,13000);
  room.boost(a.id,{x:1,y:0},13000);room.disconnect(a.id,13100);
  assert.equal(a.boostUntil,0);assert.equal(room.privateState(a.id).boostReadyAt,19000);
  a.connected=true;a.disconnectedAt=null;room.boost(a.id,{x:1,y:0},19000);room.reset(a,19100);
  assert.equal(a.boostUntil,0);assert.throws(()=>room.boost(a.id,{x:1,y:0},19200),/resetting/);
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);room.active().forEach(p=>p.ready=true);
  room.start(a.id,room.endAt+1000);assert.equal(a.boostUntil,0);assert.equal(a.boostReadyAt,0);
});

test('meteor showers have fixed windows, bounded extra rocks and no replay of skipped waves',()=>{
  const {room}=setup(),start=room.startAt+RULES.showerFirstMs;
  room.tick(0,start-1);assert.equal(room.asteroids.filter(a=>a.kind==='meteor').length,0);
  room.tick(0,start);assert.equal(room.shower.active,true);
  assert.equal(room.asteroids.length,RULES.asteroidCount+RULES.showerCount);
  const meteors=room.asteroids.filter(a=>a.kind==='meteor');
  assert.ok(meteors.every(a=>a.maxHits===4&&a.letterCount===6&&a.expiresAt===start+RULES.showerDurationMs));
  room.tick(0,start+1);assert.equal(room.asteroids.length,12);
  room.tick(0,start+RULES.showerDurationMs);assert.equal(room.shower.active,false);assert.equal(room.asteroids.length,8);
  room.tick(0,start+RULES.showerCycleMs*2+1000);
  assert.equal(room.asteroids.length,12);assert.equal(room.events.filter(e=>e.type==='showerStart').length,2);
  room.tick(0,room.endAt);assert.equal(room.phase,'results');
  const count=room.asteroids.length;room.tick(0,room.endAt+60000);assert.equal(room.asteroids.length,count);
});

test('four hits open a meteor into six letters; released letters outlive the shower',()=>{
  const {room,a}=setup(),start=room.startAt+RULES.showerFirstMs;
  room.tick(0,start);const meteor=room.asteroids.find(a=>a.kind==='meteor');
  Object.assign(meteor,{x:1200,y:800,vx:0,vy:0,rewardType:'letters'});room.asteroids=[meteor];room.crystals=[];room.replenishFields=()=>{};
  for(let hit=1;hit<=4;hit++){
    const now=start+hit*200;
    room.pulses.push({id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:1100,y:800,vx:1000,vy:0,expiresAt:now+1000});
    room.tick(.1,now);assert.equal(room.letters.length,hit<4?0:6);
  }
  assert.equal(new Set(room.letters.map(l=>l.id)).size,6);assert.ok(room.letters.some(l=>'AEIOU'.includes(l.letter)));
  assert.equal(a.score,0);room.tick(0,start+RULES.showerDurationMs);assert.equal(room.letters.length,6);
});

test('a bounty awards one bonus globally and team totals retain it as word points',()=>{
  const {room,a,b}=setup(['STAR'],'teams'),start=room.startAt+RULES.bountyFirstMs;
  b.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
  room.tick(0,start-1);assert.equal(room.bounty,null);room.tick(0,start);assert.equal(room.bounty.word,'STAR');
  const first=word(room,a,'STAR',start+100),second=word(room,b,'STAR',start+100);
  assert.equal(first.points,scoreWord('STAR')+20);assert.equal(first.bonus,20);assert.equal(first.basePoints,scoreWord('STAR'));
  assert.equal(second.points,scoreWord('STAR'));assert.equal(second.bonus,0);
  assert.equal(room.bounty.claimedBy,a.id);assert.equal(room.events.filter(e=>e.type==='bountyClaim').length,1);
  room.finish(room.endAt);assert.equal(room.results.teams[a.team].score,first.points);
});

test('invalid, reused and expired words cannot earn bounty bonuses; new rounds reset objectives',()=>{
  const {room,a,b}=setup(['STAR']),start=room.startAt+RULES.bountyFirstMs;
  b.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
  word(room,a,'STAR',7000);room.tick(0,start);
  assert.throws(()=>word(room,a,'STAR',start+100),/already scored/);assert.equal(room.bounty.claimedBy,null);
  assert.throws(()=>word(room,b,'ZZZ',start+100),/dictionary/);assert.equal(room.bounty.claimedBy,null);
  const late=word(room,b,'STAR',room.bounty.expiresAt);assert.equal(late.bonus,0);assert.equal(room.bounty.claimedBy,null);
  room.tick(0,start+RULES.bountyCycleMs);assert.equal(room.bounty,null); // Everyone already used STAR.
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);room.active().forEach(p=>p.ready=true);
  room.start(a.id,room.endAt+1000);a.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));room.tick(0,room.startAt+RULES.bountyFirstMs);
  assert.equal(room.bounty.word,'STAR');assert.equal(room.bounty.claimedBy,null);
});

test('mission display expires stale snapshots and word celebration identifies a bounty once',()=>{
  const {room,a}=setup(['STAR']),now=room.startAt+RULES.bountyFirstMs;
  a.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
  room.tick(0,now);let state={...room.publicState(now),self:room.privateState(a.id)};
  assert.equal(missionStatus(state,now).bountyActive,true);assert.match(missionStatus(state,now).bountyHint,/\+20/);
  assert.equal(missionStatus(state,room.bounty.expiresAt).bountyActive,false);
  const entry=word(room,a,'STAR',now+100),feedback=new MatchFeedback();
  assert.equal(feedback.word(entry).title,'BOUNTY CAPTURED');assert.equal(feedback.word(entry),null);
  state={...room.publicState(now+100),self:room.privateState(a.id)};
  assert.match(missionStatus(state,now+100).bountyHint,/Alpha claimed \+20/);
  assert.equal(missionStatus(state,now+100).bountyActive,false);
});

test('asteroid image decodes once into a cached texture; both texture and fallback render safely',async t=>{
  const oldImage=globalThis.Image,oldDocument=globalThis.document;let decoded=0,draws=0;
  t.after(()=>{if(oldImage===undefined)delete globalThis.Image;else globalThis.Image=oldImage;
    if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;});
  const ctx=new Proxy({drawImage(){draws++;},createLinearGradient(){return {addColorStop(){}};}},
    {get:(o,k)=>k in o?o[k]:(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a));}});
  globalThis.Image=class{async decode(){decoded++;}};
  globalThis.document={createElement:()=>({getContext:()=>ctx})};
  const sprites=new AsteroidSprites();assert.equal(await sprites.ready,true);assert.equal(decoded,1);
  for(let i=0;i<12;i++)drawAsteroid(ctx,100,100,48,i/3,2,{texture:sprites.texture,maxHits:4,kind:'meteor',letterCount:6});
  assert.equal(decoded,1);assert.equal(draws,13);
  globalThis.Image=class{async decode(){throw new Error('Offline');}};
  const failed=new AsteroidSprites();assert.equal(await failed.ready,false);
  drawAsteroid(ctx,100,100,48,0,3,{texture:failed.texture});
});
