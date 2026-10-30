import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { RULES, WORLD, distance, wrap } from '../public/rules.js';

function setup(mode='ffa',count=2){
  let seed=76;
  const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const room=new GameRoom('ABCDEF',{random,now:1000});
  const players=Array.from({length:count},(_,i)=>room.addPlayer('Pilot '+i,1000+i));
  room.configure(players[0].id,{mode,minutes:3,disruption:false});
  players.forEach(p=>p.ready=true);room.start(players[0].id,1000);room.tick(0,4000);
  players.forEach((p,i)=>Object.assign(p,{x:100+i*300,y:100,vx:0,vy:0,protectionUntil:0}));
  room.crystals=[];room.asteroids=[];
  room.replenishFields=()=>{};
  return {room,players};
}
function asteroid(room,overrides={}){
  const body={id:room.id(),x:1200,y:800,r:48,vx:0,vy:0,rotation:0,hitsRemaining:RULES.asteroidHits,...overrides};
  room.asteroids.push(body);return body;
}
function pulse(room,p,body,now){
  room.pulses.push({id:room.id(),ownerId:p.id,team:p.team,color:p.color,
    x:wrap(body.x-80,WORLD.width),y:body.y,vx:400,vy:0,expiresAt:now+1000});
}
function hit(room,p,body,now){pulse(room,p,body,now);room.tick(.1,now);}

test('three pulse hits release four distinct, spaced letters including a vowel; only words score',()=>{
  const {room,players:[a]}=setup(),body=asteroid(room);
  // Force a consonant-only draw to exercise the guaranteed vowel.
  room.randomLetter=()=>'T';
  hit(room,a,body,7000);assert.equal(body.hitsRemaining,2);assert.equal(room.letters.length,0);
  hit(room,a,body,7200);assert.equal(body.hitsRemaining,1);assert.equal(room.letters.length,0);
  hit(room,a,body,7400);
  assert.equal(room.asteroids.length,0);assert.equal(room.letters.length,4);
  assert.equal(new Set(room.letters.map(l=>l.id)).size,4);
  assert.ok(room.letters.some(l=>'AEIOU'.includes(l.letter)));
  for(const tile of room.letters){
    assert.equal(tile.ownerId,a.id);assert.equal(tile.priorityUntil,9400);assert.equal(tile.expiresAt,37400);
    for(const other of room.letters)if(tile!==other)assert.ok(distance(tile,other)>68);
  }
  assert.equal(a.score,0);assert.equal(a.tray.length,0);
  assert.equal(room.events.filter(e=>e.type==='asteroidOpen').length,1);
});

test('the final pulse earns pickup priority shared with teammates, then all pilots can collect',()=>{
  const {room,players:[a,b,c,d]}=setup('teams',4),body=asteroid(room);
  hit(room,a,body,7000);hit(room,a,body,7200);hit(room,b,body,7400);
  assert.ok(room.letters.every(tile=>tile.ownerId===b.id&&tile.team===b.team));
  const [first,second]=room.letters;
  a.x=first.x;a.y=first.y;room.tick(0,7401);assert.equal(a.tray.length,0);
  assert.equal(d.team,b.team);d.x=second.x;d.y=second.y;
  room.tick(0,7402);assert.deepEqual(d.tray.map(t=>t.id),[second.id]);
  room.tick(0,9400);assert.deepEqual(a.tray.map(t=>t.id),[first.id]);
  assert.equal(b.score+c.score+d.score+a.score,0);
});

test('simultaneous extra hits cannot duplicate an asteroid bundle and the letter cap holds',()=>{
  const {room,players:[a,b]}=setup(),body=asteroid(room);
  room.letters=Array.from({length:99},()=>({id:room.id(),letter:'E',x:300,y:1400,ownerId:null,team:null,priorityUntil:0,expiresAt:50000}));
  const before=new Set(room.letters.map(t=>t.id));
  [a,a,b,a,b].forEach(p=>pulse(room,p,body,7000));room.tick(.1,7000);
  const released=room.letters.filter(t=>!before.has(t.id));
  assert.equal(released.length,4);assert.equal(room.letters.length,RULES.maxLetters);
  assert.ok(released.every(tile=>tile.ownerId===b.id));
  assert.equal(room.events.filter(e=>e.type==='asteroidOpen').length,1);
  room.openAsteroid(body,{ownerId:a.id,team:a.team},7100);
  assert.equal(room.letters.length,RULES.maxLetters);
});

test('pulses hit the nearest solid body across a wrapped edge regardless of entity type',()=>{
  for(const nearest of ['asteroid','crystal']){
    const {room,players:[a]}=setup();
    const body=asteroid(room,{x:nearest==='asteroid'?20:100});
    const crystal={id:room.id(),x:nearest==='crystal'?20:120,y:800,r:24,vx:0,vy:0,letter:'E',rotation:0};
    room.crystals.push(crystal);
    room.pulses.push({id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:2370,y:800,vx:2000,vy:0,expiresAt:8000});
    room.tick(.1,7000);
    if(nearest==='asteroid'){assert.equal(body.hitsRemaining,2);assert.equal(crystal.opened,undefined);}
    else {assert.equal(crystal.opened,true);assert.equal(body.hitsRemaining,3);}
  }
});

test('asteroid letters remain physical pickups in the chosen flight order and obey tray capacity',()=>{
  const {room,players:[a]}=setup(),body=asteroid(room,{x:10,y:10});
  [7000,7200,7400].forEach(now=>hit(room,a,body,now));
  const tiles=[...room.letters],order=[2,0,3,1];
  assert.ok(tiles.every(t=>t.x>=0&&t.x<WORLD.width&&t.y>=0&&t.y<WORLD.height));
  for(const index of order){a.x=tiles[index].x;a.y=tiles[index].y;room.tick(0,7500);}
  assert.deepEqual(a.tray.map(t=>t.id),order.map(i=>tiles[i].id));
  const next=asteroid(room,{x:1800,y:1000});[8000,8200,8400].forEach(now=>hit(room,a,next,now));
  a.tray=Array.from({length:10},(_,i)=>({id:'full-'+i,letter:'A'}));
  a.x=room.letters[0].x;a.y=room.letters[0].y;room.tick(0,8500);
  assert.equal(a.tray.length,10);assert.equal(room.letters.length,4);
});

test('asteroids nudge ships without resetting them and cannot release letters after the deadline',()=>{
  const {room,players:[a]}=setup(),body=asteroid(room);
  a.x=body.x;a.y=body.y;a.score=17;room.tick(0,7000);
  assert.ok(distance(a,body)>body.r+RULES.shipRadius);
  assert.equal(a.stability,3);assert.equal(a.resetUntil,0);assert.equal(a.score,17);
  [a,a,a].forEach(p=>pulse(room,p,body,room.endAt));room.tick(.1,room.endAt);
  assert.equal(room.phase,'results');assert.equal(body.hitsRemaining,3);assert.equal(room.letters.length,0);
});

test('asteroid population replenishes, wraps, and starts fresh on rematch',()=>{
  const {room,players:[a]}=setup();
  room.replenishFields=GameRoom.prototype.replenishFields;
  room.tick(0,7000);assert.equal(room.asteroids.length,RULES.asteroidCount);
  const body=room.asteroids[0];body.x=WORLD.width-1;body.y=WORLD.height-1;body.vx=20;body.vy=20;
  room.tick(.1,7100);assert.ok(body.x<2&&body.y<2);
  body.hitsRemaining=1;
  const publicBody=room.publicState(7100).asteroids.find(p=>p.id===body.id);
  assert.equal(publicBody.hitsRemaining,1);assert.equal(publicBody.vx,20);
  room.openAsteroid(body,{ownerId:a.id,team:a.team},7200);room.tick(0,7200);
  assert.equal(room.asteroids.length,RULES.asteroidCount);assert.ok(!room.asteroids.includes(body));
  const ids=new Set(room.asteroids.map(p=>p.id));
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);assert.equal(room.asteroids.length,0);
  room.active().forEach(p=>p.ready=true);
  room.start(a.id,room.endAt+1000);
  assert.equal(room.asteroids.length,RULES.asteroidCount);
  assert.ok(room.asteroids.every(p=>p.hitsRemaining===3&&!ids.has(p.id)));
});
