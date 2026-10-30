import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { FLEET } from '../public/fleet.js';
import { RULES } from '../public/rules.js';

test('ship choice is validated, clears readiness only on a change, and is locked during rounds',()=>{
  const room=new GameRoom('ABCDEF');
  const players=FLEET.map((_,i)=>room.addPlayer('Pilot '+i,1000+i));
  const a=players[0],b=players[1];
  assert.equal(new Set(players.map(p=>p.shipId)).size,8);
  const spectator=room.addPlayer('Watcher',1010);
  assert.throws(()=>room.chooseShip(spectator.id,FLEET[2].id),/Claim a pilot seat/);
  a.ready=true;
  for(const bad of ['../icon.svg','constructor','toString',null,{},0])
    assert.throws(()=>room.chooseShip(a.id,bad),/eight available/);
  assert.equal(a.ready,true);
  room.chooseShip(a.id,a.shipId);assert.equal(a.ready,true);
  room.chooseShip(a.id,b.shipId); // Shared cosmetic choices are allowed.
  assert.equal(a.shipId,b.shipId);assert.equal(a.ready,false);
  assert.notEqual(a.color,b.color);
  assert.equal(room.publicState(1100).players.find(p=>p.id===a.id).shipId,b.shipId);
  players.forEach(p=>p.ready=true);room.start(a.id,2000);
  assert.throws(()=>room.chooseShip(a.id,FLEET[3].id),/lobby/);
  room.tick(0,5000);
  assert.throws(()=>room.chooseShip(a.id,FLEET[3].id),/lobby/);
  const chosen=a.shipId;
  room.reset(a,6000);assert.equal(a.shipId,chosen);
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);
  assert.equal(a.shipId,chosen);
  room.remove(players[3].id,room.endAt+2);
  const replacement=room.addPlayer('New pilot',room.endAt+3);
  assert.ok(FLEET.some(s=>s.id===replacement.shipId));
  assert.equal(new Set(room.active().map(p=>p.color)).size,8);
});

test('every hull has identical movement and physical letter collection reach',()=>{
  const flights=[];
  for(const ship of FLEET){
    const room=new GameRoom('ABCDEF',{words:new Set(['CAT']),random:()=>.5});
    const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
    room.chooseShip(a.id,ship.id);a.ready=b.ready=true;room.start(a.id,1000);room.tick(0,4000);
    a.x=500;a.y=500;a.vx=RULES.speed;a.protectionUntil=0;b.x=1500;b.y=1000;
    room.crystals=[];
    room.letters=[['T',555,500],['C',535,500],['A',545,500],['X',520,535]].map(([letter,x,y],i)=>({
      id:String(i),letter,x,y,ownerId:null,team:null,priorityUntil:0,expiresAt:50000
    }));
    room.input(a.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:false},7000);
    room.tick(.1,7100);
    const tray=a.tray.map(t=>t.letter).join('');
    assert.equal(tray,'CAT',ship.name+' must collect in physical order and miss X');
    flights.push({x:a.x,y:a.y,vx:a.vx,vy:a.vy,stability:a.stability,tray,remaining:room.letters.map(l=>l.letter)});
  }
  flights.forEach(f=>assert.deepEqual(f,flights[0]));
});
