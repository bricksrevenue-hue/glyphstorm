import test from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';
import { createGameServer } from '../server/index.mjs';
import { RULES, VERSION } from '../public/rules.js';
import { FLEET } from '../public/fleet.js';
const connect=url=>new Promise((resolve,reject)=>{
  const client=io(url,{transports:['websocket'],reconnection:false,forceNew:true});
  client.once('connect',()=>resolve(client));client.once('connect_error',reject);
});
const call=(client,event,payload)=>new Promise((resolve,reject)=>client.timeout(3000).emit(event,payload,(err,res)=>err?reject(err):resolve(res)));
const nextState=(client,predicate)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{client.off('state',listen);reject(new Error('Matching snapshot timed out'));},3000);
  function listen(state){if(predicate(state)){clearTimeout(timer);client.off('state',listen);resolve(state);}}
  client.on('state',listen);
});
test('two pilots keep rooms, private flexible trays, range scores and retry-safe assists synchronized',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT','DOG'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<3;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Alpha'});
  const guest=await call(clients[1],'join',{code:host.code,name:'Beta'});
  const room=server.rooms.get(host.code),send=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  await send(0,'ready',{ready:true});await send(1,'ready',{ready:true});await send(0,'start');now+=3100;server.tick();
  assert.equal((await call(clients[2],'join',{code:host.code,name:'Watcher'})).ok,true);
  room.replenishFields=()=>{};room.crystals=[];room.asteroids=[];room.letters=[];
  const a=room.players.get(host.playerId),b=room.players.get(guest.playerId);
  for(const [p,text]of [[a,'XTACY'],[b,'DOG']]){p.tray=[...text].map(letter=>({id:room.id(),letter}));p.protectionUntil=0;}
  const original=a.tray.map(t=>t.id),reordered=[original[0],original[3],original[2],original[1],original[4]],arrangeId=crypto.randomUUID();
  assert.equal((await send(0,'arrange',{tileIds:reordered},arrangeId)).ok,true);
  assert.equal((await send(0,'arrange',{tileIds:reordered},arrangeId)).ok,true);
  assert.equal(a.tray.map(t=>t.letter).join(''),'XCATY');
  assert.equal((await send(0,'arrange',{tileIds:[...reordered.slice(0,4),b.tray[0].id]})).ok,false);
  assert.equal((await send(2,'arrange',{tileIds:[]})).ok,false);
  const tileIds=a.tray.slice(1,4).map(t=>t.id);await send(0,'wordMode',{enter:true});
  const submitId=crypto.randomUUID(),result=await send(0,'submit',{tileIds},submitId);assert.equal(result.ok,true);assert.equal(result.value.word,'CAT');
  assert.deepEqual((await send(0,'submit',{tileIds},submitId)).value,result.value);assert.equal(a.tray.map(t=>t.letter).join(''),'XY');
  assert.equal(b.tray.map(t=>t.letter).join(''),'DOG');assert.equal(a.history.length,1);
  let at=now+100;let pending=clients.map(c=>nextState(c,s=>s.now===at));now=at;server.tick();
  const snapshots=await Promise.all(pending);
  for(const s of snapshots){assert.equal(s.players.find(p=>p.id===a.id).score,result.value.points);assert.equal(s.events.filter(e=>e.type==='word'&&e.playerId===a.id).length,1);assert.equal(s.players.some(p=>'tray'in p),false);}
  assert.equal(snapshots[0].self.tray.map(t=>t.letter).join(''),'XY');assert.equal(snapshots[1].self.tray.map(t=>t.letter).join(''),'DOG');
  const shuffleId=crypto.randomUUID();assert.equal((await send(1,'shuffle',{},shuffleId)).ok,true);const shuffled=b.tray.map(t=>t.id);
  assert.equal((await send(1,'shuffle',{},shuffleId)).ok,true);assert.deepEqual(b.tray.map(t=>t.id),shuffled);assert.equal((await send(1,'shuffle')).ok,false);
  a.tray=[...'QZXJKQZXJK'].map(letter=>({id:room.id(),letter}));a.pendingVowel='A';
  const discardId=crypto.randomUUID(),removed=a.tray[4].id;
  assert.equal((await send(0,'discard',{tileId:removed},discardId)).ok,true);const after=a.tray.map(t=>t.id);
  assert.equal((await send(0,'discard',{tileId:removed},discardId)).ok,true);assert.deepEqual(a.tray.map(t=>t.id),after);assert.equal(a.tray.length,10);assert.equal(a.tray.at(-1).letter,'A');
  assert.equal(room.events.filter(e=>e.type==='vowelGift'&&e.playerId===a.id).length,1);
  now+=1100;a.tray=[...'CATX'].map(letter=>({id:room.id(),letter}));const smartId=crypto.randomUUID();
  assert.equal((await send(0,'smartDiscard',{},smartId)).ok,true);assert.equal((await send(0,'smartDiscard',{},smartId)).ok,true);assert.equal(a.tray.map(t=>t.letter).join(''),'CAT');
  for(const module of ['tray-controls.js','word-guide.js'])assert.equal((await fetch(url+'/'+module)).status,200);
});
test('eight-client team signals stay private through retries/reconnects; word rewards agree on every screen',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<10;i++)clients.push(await connect(url));
  const joins=[await call(clients[0],'join',{create:true,name:'Pilot 0'})];
  for(let i=1;i<8;i++)joins.push(await call(clients[i],'join',{code:joins[0].code,name:'Pilot '+i}));
  const other=await call(clients[9],'join',{create:true,name:'Other orbit'});
  const room=server.rooms.get(joins[0].code),send=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  assert.equal((await send(0,'settings',{mode:'teams',minutes:3,defense:true,disruption:false})).ok,true);
  for(let i=0;i<8;i++)await send(i,'ready',{ready:true});await send(0,'start');now+=3100;server.tick();
  assert.equal((await call(clients[8],'join',{code:room.code,name:'Watcher'})).ok,true);
  const requestId=crypto.randomUUID(),payload={kind:'need-letter',letter:'A',scope:'all',team:1,playerId:joins[1].playerId};
  const first=await send(0,'signal',payload,requestId);assert.equal(first.ok,true);
  assert.equal((await send(0,'signal',payload,requestId)).ok,true);assert.equal(room.signals.length,1);
  assert.equal((await send(0,'signal',{kind:'defend-earth'})).ok,false);
  assert.equal((await send(8,'signal',{kind:'defend-earth'})).ok,false);
  let snapshotAt=now+100;
  const snapshots=clients.map(c=>nextState(c,s=>s.now===snapshotAt));now=snapshotAt;server.tick();
  const states=await Promise.all(snapshots);
  states.forEach((s,i)=>{
    const allowed=i<8&&i%2===0;
    assert.equal(s.self.signals.length,allowed?1:0);assert.equal(s.signals,undefined);
    assert.ok(s.players.every(p=>p.signals===undefined));assert.ok(s.events.every(e=>e.kind!=='need-letter'));
  });
  assert.equal(states[9].code,other.code);
  // Disconnect delivery barrier before resuming the same team seat.
  const disconnected=new Promise(resolve=>server.io.sockets.sockets.get(clients[0].id).once('disconnect',resolve));
  clients[0].disconnect();await disconnected;clients[0]=await connect(url);
  const resumed=await call(clients[0],'resume',{token:joins[0].token});assert.equal(resumed.ok,true);
  assert.equal(resumed.state.self.signalReadyAt,first.self.signalReadyAt);
  assert.equal(resumed.state.self.signals.length,1);
  const p=room.players.get(joins[0].playerId);room.defense.earthHealth=99;room.defense.barrierThickness=24.5;
  p.tray=['C','A','T'].map(letter=>({id:room.id(),letter}));await send(0,'wordMode',{enter:true});
  const submitId=crypto.randomUUID(),tiles=p.tray.map(t=>t.id);
  const scored=await send(0,'submit',{tileIds:tiles,defenseReward:{hp:1000,shield:1000}},submitId);assert.equal(scored.ok,true);
  assert.equal(scored.value.defenseReward.hp,1);assert.equal(scored.value.defenseReward.shield,.5);
  const retry=await send(0,'submit',{tileIds:tiles},submitId);assert.deepEqual(retry.value,scored.value);
  snapshotAt=now+100;const rewardSnapshots=clients.slice(0,9).map(c=>nextState(c,s=>s.now===snapshotAt));now=snapshotAt;server.tick();
  for(const s of await Promise.all(rewardSnapshots)){
    assert.equal(s.defense.earthHealth,100);assert.equal(s.defense.barrierThickness,25);
    const events=s.events.filter(e=>e.type==='word');assert.equal(events.length,1);
    assert.deepEqual(events[0].defenseReward,scored.value.defenseReward);
  }
  for(const module of ['signals.js','word-energy.js','compact-hud.js'])assert.equal((await fetch(url+'/'+module)).status,200);
});
test('eight clients agree on asteroid charge and the same four letters from actual pulse input',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<8;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Pilot 0'});
  for(let i=1;i<8;i++)assert.equal((await call(clients[i],'join',{code:host.code,name:'Pilot '+i})).ok,true);
  const room=server.rooms.get(host.code);
  const action=(i,type,payload={})=>call(clients[i],'action',{requestId:crypto.randomUUID(),matchId:room.matchId,type,payload});
  for(let i=0;i<8;i++)await action(i,'ready',{ready:true});
  await action(0,'start');now+=3100;server.tick();
  room.active().forEach((p,i)=>Object.assign(p,{x:100+i*200,y:100,vx:0,vy:0,protectionUntil:0}));
  const pilot=room.players.get(host.playerId);pilot.x=900;pilot.y=800;
  const rock={id:room.id(),x:1000,y:800,r:48,vx:0,vy:0,rotation:Math.PI/4,hitsRemaining:3};
  // A controlled arena isolates the network interaction from unrelated targets.
  room.crystals=[];room.asteroids=[rock];room.replenishFields=()=>{};
  for(let hit=1;hit<=3;hit++){
    const expectedTime=now+200;
    const snapshots=Promise.all(clients.map(c=>nextState(c,s=>s.now===expectedTime)));
    clients[0].emit('input',{matchId:room.matchId,seq:hit,x:0,y:0,angle:0,pulse:true});
    // A following acknowledged action is a delivery barrier on the same socket.
    assert.equal((await action(0,'wordMode',{enter:false})).ok,true);
    assert.equal(pilot.input.pulse,true);
    now=expectedTime;server.tick();
    const states=await snapshots;
    for(const state of states){
      assert.deepEqual(state.asteroids,states[0].asteroids);assert.deepEqual(state.letters,states[0].letters);
      assert.ok(state.players.every(p=>p.score===0));
      if(hit<3){assert.equal(state.asteroids[0].hitsRemaining,3-hit);assert.equal(state.letters.length,0);}
      else {
        assert.equal(state.asteroids.length,0);assert.equal(state.letters.length,4);
        assert.equal(new Set(state.letters.map(l=>l.id)).size,4);
        assert.ok(state.letters.every(l=>l.ownerId===host.playerId&&l.priorityUntil===now+RULES.priorityMs));
        assert.equal(state.events.filter(e=>e.type==='asteroidOpen').length,1);
      }
    }
  }
  const module=await fetch(url+'/asteroids.js');assert.equal(module.status,200);assert.equal(module.headers.get('cache-control'),'no-cache');
});
test('eight independent clients share a match; room isolation, roles, retry safety, and reconnect hold',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT','STAR','PLANET'])});
  const address=await server.listen();
  const url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<10;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Pilot 1'});assert.equal(host.ok,true);
  const joins=[host];for(let i=1;i<8;i++)joins.push(await call(clients[i],'join',{code:host.code,name:'Pilot '+(i+1)}));
  assert.ok(joins.every(r=>r.ok));
  const other=await call(clients[8],'join',{create:true,name:'Other room'});assert.notEqual(other.code,host.code);
  const room=server.rooms.get(host.code),send=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  const forbidden=await send(1,'settings',{mode:'teams',minutes:5,disruption:true});assert.equal(forbidden.ok,false);
  const chosenShips=joins.map((_,i)=>FLEET[(i+3)%8].id);
  const selectionRequests=joins.map(()=>crypto.randomUUID());
  for(let i=0;i<8;i++){
    // A supplied playerId cannot change someone else's ship.
    const choice=await send(i,'ship',{shipId:chosenShips[i],playerId:host.playerId},selectionRequests[i]);
    assert.equal(choice.ok,true);assert.equal(choice.self.shipId,chosenShips[i]);
    assert.equal(room.players.get(host.playerId).shipId,chosenShips[0]);
  }
  assert.equal((await send(1,'ship',{shipId:'../../icon.svg'})).ok,false);
  for(let i=0;i<8;i++)assert.equal((await send(i,'ready',{ready:true})).ok,true);
  assert.equal((await send(1,'ship',{shipId:chosenShips[1]},selectionRequests[1])).ok,true);
  assert.equal(room.players.get(joins[1].playerId).ready,true); // Retry must not undo ready.
  assert.equal((await send(0,'start')).ok,true);now+=3100;server.tick();
  assert.equal((await send(1,'ship',{shipId:FLEET[0].id})).ok,false);
  const spectator=await call(clients[9],'join',{code:host.code,name:'Spectator'});assert.equal(spectator.ok,true);
  assert.equal(room.players.get(spectator.playerId).role,'spectator');
  assert.deepEqual(spectator.state.players.filter(p=>p.role==='player').map(p=>p.shipId),chosenShips);
  assert.equal((await send(9,'wordMode',{enter:true})).ok,false);
  const observations=Array(8).fill(null);
  for(let i=0;i<8;i++)clients[i].on('state',s=>observations[i]=s);
  const p=room.players.get(host.playerId);
  p.x=100;p.y=100;p.vx=RULES.speed;p.protectionUntil=0;
  room.crystals=[];
  room.letters=[['c','T',140],['a','C',136],['b','A',138]].map(([id,letter,x])=>({
    id,letter,x,y:100,ownerId:p.id,team:p.team,priorityUntil:now+2000,expiresAt:now+30000
  }));
  room.input(p.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:false},now);
  now+=100;server.tick();
  assert.equal(p.tray.map(tile=>tile.letter).join(''),'CAT');
  await new Promise(resolve=>setTimeout(resolve,60));
  assert.equal(observations[0].self.tray.map(tile=>tile.letter).join(''),'CAT');
  const requestId=crypto.randomUUID();
  assert.equal((await send(0,'wordMode',{enter:true})).ok,true);
  const rearranged=await send(0,'submit',{tileIds:['c','b','a']});
  assert.equal(rearranged.ok,false);assert.match(rearranged.error,/contiguous range/);
  assert.equal(p.score,0);assert.equal(p.tray.length,3);
  const scored=await send(0,'submit',{tileIds:['a','b','c']},requestId);assert.equal(scored.value.points,5);
  assert.equal((await send(0,'submit',{tileIds:['a','b','c']},requestId)).value.points,5);assert.equal(p.score,5);
  now+=100;server.tick();
  await new Promise(resolve=>setTimeout(resolve,100));
  for(let i=0;i<8;i++){
    assert.deepEqual(observations[i].players.filter(p=>p.role==='player').map(p=>p.shipId),chosenShips);
    assert.equal(observations[i].players.find(p=>p.id===host.playerId).score,5);
    assert.equal(observations[i].code,host.code);assert.equal(observations[i].endAt,room.endAt);
    assert.equal(observations[i].self.id,joins[i].playerId);
  }
  assert.equal(server.rooms.get(other.code).phase,'lobby');
  const oldToken=joins[1].token,id=joins[1].playerId;clients[1].disconnect();
  await new Promise(resolve=>setTimeout(resolve,30));assert.equal(room.players.get(id).connected,false);
  const replacement=await connect(url);clients.push(replacement);
  const resumed=await call(replacement,'resume',{token:oldToken});assert.equal(resumed.ok,true);assert.equal(resumed.playerId,id);
  assert.equal(resumed.state.players.find(p=>p.id===id).shipId,chosenShips[1]);
  assert.equal((await call(clients[9],'action',{requestId:crypto.randomUUID(),matchId:room.matchId,type:'submit',payload:{tileIds:['a','b','c']}})).ok,false);
  now=room.endAt;server.tick();
  assert.equal(room.phase,'results');assert.deepEqual(room.results.winners,[host.playerId]);
  assert.equal((await send(0,'submit',{tileIds:[]})).ok,false);
  assert.equal((await send(0,'lobby')).ok,true);
  assert.equal(room.phase,'lobby');assert.equal(p.score,0);assert.equal(p.used.size,0);
  assert.deepEqual(room.active().map(p=>p.shipId),chosenShips);
  assert.equal((await send(9,'ship',{shipId:FLEET[0].id})).ok,false);
  assert.equal((await send(9,'claim')).ok,false); // all eight active seats are retained
  const health=await fetch(url+'/health');assert.equal(health.status,200);assert.equal((await health.json()).version,VERSION);
  const html=await fetch(url);assert.equal(html.status,200);assert.match(await html.text(),/OUTSPELL/);
  const dict=await fetch(url+'/api/dictionary');assert.equal((await dict.json()).entries,3);
  const script=await fetch(url+'/socket.io/socket.io.js');assert.equal(script.status,200);
  for(const ship of FLEET){
    const sprite=await fetch(url+ship.src);assert.equal(sprite.status,200);assert.match(sprite.headers.get('content-type'),/image\/png/);
    const png=new Uint8Array(await sprite.arrayBuffer());assert.deepEqual([...png.slice(0,8)],[137,80,78,71,13,10,26,10]);
  }
  const app=await fetch(url+'/app.js?v='+VERSION);assert.equal(app.status,200);assert.equal(app.headers.get('cache-control'),'no-cache');
});
test('a long-running room survives a simultaneous brief disconnect',{timeout:8000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  const a=await connect(url),b=await connect(url);clients.push(a,b);
  const join=await call(a,'join',{create:true,name:'Alpha'});
  await call(b,'join',{code:join.code,name:'Beta'});
  now+=120000;a.disconnect();b.disconnect();
  await new Promise(resolve=>setTimeout(resolve,30));server.tick();
  assert.ok(server.rooms.has(join.code));
  now+=1000;const replacement=await connect(url);clients.push(replacement);
  const resumed=await call(replacement,'resume',{token:join.token});
  assert.equal(resumed.ok,true);
});

test('eight clients synchronize defense, boost, bounties and meteors; retries repair only once and Earth loss ends all screens',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['STAR'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<9;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Alpha'});
  for(let i=1;i<8;i++)assert.equal((await call(clients[i],'join',{code:host.code,name:'Pilot '+i})).ok,true);
  const separate=await call(clients[8],'join',{create:true,name:'Separate'});
  const room=server.rooms.get(host.code),other=server.rooms.get(separate.code);
  const action=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  for(let i=0;i<8;i++)assert.equal((await action(i,'ready',{ready:true})).ok,true);
  assert.equal((await action(0,'start')).ok,true);now=room.startAt+2100;server.tick();
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  room.active().forEach((p,i)=>Object.assign(p,{x:100+i*250,y:100,protectionUntil:0}));
  const boostId=crypto.randomUUID();assert.equal((await action(0,'boost',{x:1,y:0,earthHealth:999},boostId)).ok,true);
  const pilot=room.players.get(host.playerId),readyAt=pilot.boostReadyAt;
  assert.equal((await action(0,'boost',{x:1,y:0},boostId)).ok,true);assert.equal(pilot.boostReadyAt,readyAt);
  assert.equal((await action(0,'boost',{x:1,y:0})).ok,false);
  async function snapshot(time){
    const pending=Promise.all(clients.slice(0,8).map(c=>nextState(c,s=>s.now===time)));
    now=time;server.tick();return pending;
  }
  let states=await snapshot(now+100);
  for(const s of states){
    assert.equal(s.players.find(p=>p.id===host.playerId).boostUntil,pilot.boostUntil);
    assert.equal(s.defense.earthHealth,100);
  }
  assert.equal(states[0].self.boostReadyAt,readyAt);assert.equal(states[1].self.boostReadyAt,0);
  pilot.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
  now=room.startAt+RULES.bountyFirstMs;server.tick();assert.equal(room.bounty.word,'STAR');
  room.defense.earthHealth=90;
  const firstTwo=room.active().slice(0,2),requests=[crypto.randomUUID(),crypto.randomUUID()];
  for(let i=0;i<2;i++){
    firstTwo[i].tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
    assert.equal((await action(i,'wordMode',{enter:true})).ok,true);
  }
  const submissions=await Promise.all(firstTwo.map((p,i)=>action(i,'submit',{tileIds:p.tray.map(l=>l.id),earthHealth:1000,barrierThickness:1000},requests[i])));
  assert.ok(submissions.every(s=>s.ok));assert.deepEqual(submissions.map(s=>s.value.bonus).sort((a,b)=>a-b),[0,20]);
  assert.equal(room.defense.earthHealth,94);assert.equal(room.defense.barrierThickness,9);
  const priorScore=firstTwo[0].score;
  assert.equal((await action(0,'submit',{tileIds:[]},requests[0])).ok,true);
  assert.equal(room.defense.earthHealth,94);assert.equal(room.defense.barrierThickness,9);assert.equal(firstTwo[0].score,priorScore);
  states=await snapshot(now+100);
  for(const s of states){assert.deepEqual(s.defense,states[0].defense);assert.equal(s.bounty.claimedBy,room.bounty.claimedBy);}
  assert.equal(other.defense.earthHealth,100);assert.equal(other.defense.barrierThickness,5);
  states=await snapshot(room.startAt+RULES.showerFirstMs);
  for(const s of states){assert.equal(s.asteroids.filter(a=>a.kind==='meteor').length,4);assert.deepEqual(s.asteroids,states[0].asteroids);}
  // Fatal damage: synchronized early results, no stale submit can revive Earth.
  room.defense.earthHealth=5;
  room.letters=[{id:room.id(),letter:'Z',incoming:true,x:room.defense.x+room.defense.barrierRadius,y:room.defense.y,
    vx:-40,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:now+30000}];
  states=await snapshot(now+100);
  for(const s of states){assert.equal(s.phase,'results');assert.equal(s.defense.earthHealth,0);assert.equal(s.results.reason,'earth-lost');assert.deepEqual(s.results.winners,[]);}
  assert.equal((await action(1,'submit',{tileIds:[]})).ok,false);assert.equal(room.defense.earthHealth,0);
  const restore=await connect(url);clients.push(restore);
  clients[0].disconnect();await new Promise(resolve=>setTimeout(resolve,30));
  const resumed=await call(restore,'resume',{token:host.token});assert.equal(resumed.ok,true);
  assert.equal(resumed.state.defense.earthHealth,0);assert.equal(resumed.state.results.reason,'earth-lost');
  for(const asset of ['/defense.js','/planet.js','/objectives.js','/assets/asteroids/rock-v15.png'])assert.equal((await fetch(url+asset)).status,200);
});

test('eight clients agree on all milestone powers, damage immunity, EMP tiles and slow motion; retries and reconnect preserve expiry',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT','DOG','STAR','MOON'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<10;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Alpha'});
  for(let i=1;i<8;i++)assert.equal((await call(clients[i],'join',{code:host.code,name:'Pilot '+i})).ok,true);
  const separate=await call(clients[8],'join',{create:true,name:'Separate'}),room=server.rooms.get(host.code);
  const action=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  assert.equal((await action(0,'settings',{mode:'teams',minutes:3,disruption:false,defense:true})).ok,true);
  for(let i=0;i<8;i++)await action(i,'ready',{ready:true});
  await action(0,'start');now=room.startAt+2100;server.tick();
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  room.active().forEach((p,i)=>Object.assign(p,{x:100+i*250,y:100,protectionUntil:0}));
  const watcher=await call(clients[9],'join',{code:host.code,name:'Watcher'});assert.equal(watcher.state.players.find(p=>p.id===watcher.playerId).role,'spectator');
  assert.equal((await action(9,'activatePowerUp',{kind:'INVULNERABILITY',powerUpTimer:99999})).ok,false);
  const pilots=room.active(),catalog=['CAT','DOG','STAR','MOON'];
  const tile=x=>({id:room.id(),letter:'A',incoming:true,x,y:room.defense.y,vx:-100,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:now+30000});
  async function snapshots(time){const pending=Promise.all([...clients.slice(0,8),clients[9]].map(c=>nextState(c,s=>s.now===time)));now=time;server.tick();return pending;}
  for(const [cycle,kind]of ['INVULNERABILITY','EMP_BLAST','SLOW_MOTION'].entries()){
    room.random=()=>[0,.5,.99][cycle];
    const empTile=tile(1800);if(kind==='EMP_BLAST')room.letters=[empTile];
    let requestId,lastPilotIndex;
    for(let j=0;j<5;j++){
      const n=cycle*5+j,i=2*(n%4),p=pilots[i],word=catalog[Math.floor(n/4)];lastPilotIndex=i;
      now+=250;p.tray=[...word].map(letter=>({id:room.id(),letter}));
      assert.equal((await action(i,'wordMode',{enter:true})).ok,true);
      requestId=crypto.randomUUID();
      const result=await action(i,'submit',{tileIds:p.tray.map(l=>l.id),currentPowerUp:'HACK',powerUpTimer:99999},requestId);
      assert.equal(result.ok,true);
    }
    const expiry=room.powerUps.endsAt;assert.equal(expiry,now+8000);assert.equal(room.powerUps.powerUpTimer,480);
    const combo=(cycle+1)*5,score=pilots[lastPilotIndex].score;
    assert.equal((await action(lastPilotIndex,'submit',{tileIds:[]},requestId)).ok,true);
    assert.equal(pilots[lastPilotIndex].score,score);assert.equal(room.powerUps.comboWords['team-0'],combo);assert.equal(room.powerUps.endsAt,expiry);
    if(kind==='INVULNERABILITY')room.letters=[tile(room.defense.x+room.defense.barrierRadius)];
    const slowTile=tile(1800);if(kind==='SLOW_MOTION')room.letters=[slowTile];
    const states=await snapshots(now+100);
    for(const state of states){
      assert.deepEqual(state.powerUps,states[0].powerUps);assert.equal(state.powerUps.currentPowerUp,kind);
      assert.equal(state.powerUps.powerUpTimer,474);assert.equal(state.powerUps.endsAt,expiry);assert.equal(state.powerUps.comboWords['team-0'],combo);
      assert.equal(state.defense.earthHealth,100);assert.deepEqual(state.letters,states[0].letters);
      if(kind==='EMP_BLAST'){assert.equal(state.letters[0].id,empTile.id);assert.equal(state.letters[0].incoming,false);assert.equal(state.letters[0].x,1800);}
      if(kind==='SLOW_MOTION')assert.equal(state.letters[0].x,1796);
    }
  }
  assert.equal(server.rooms.get(separate.code).powerUps.currentPowerUp,null);
  const expiresAt=room.powerUps.endsAt;
  clients[0].disconnect();await new Promise(resolve=>setTimeout(resolve,30));
  const resumedClient=await connect(url);clients.push(resumedClient);
  const resumed=await call(resumedClient,'resume',{token:host.token});assert.equal(resumed.ok,true);
  assert.equal(resumed.state.powerUps.currentPowerUp,'SLOW_MOTION');assert.equal(resumed.state.powerUps.endsAt,expiresAt);
  const pending=nextState(resumedClient,s=>s.now===expiresAt);now=expiresAt;server.tick();
  const ended=await pending;assert.equal(ended.powerUps.currentPowerUp,null);assert.equal(ended.powerUps.powerUpTimer,0);
  assert.equal((await fetch(url+'/power-ups.js')).status,200);assert.equal((await fetch(url+'/neon.js')).status,200);
});

test('eight clients receive only their own word advice and retrying a suggested-prefix submission keeps leftovers and scores once',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT','DOG'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<9;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Alpha'}),room=server.rooms.get(host.code);
  for(let i=1;i<8;i++)await call(clients[i],'join',{code:host.code,name:'Pilot '+i});
  const act=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  for(let i=0;i<8;i++)await act(i,'ready',{ready:true});await act(0,'start');now=room.startAt+2100;server.tick();
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  const watcher=await call(clients[8],'join',{code:host.code,name:'Watcher'});assert.equal(watcher.state.self.wordGuide,null);
  const pilots=room.active();pilots.forEach((p,i)=>{p.tray=[...(i%2?'DOGX':'CATX')].map(letter=>({id:room.id(),letter}));p.x=100+i*200;p.y=100;p.protectionUntil=0;});
  const nextAt=now+100,pending=Promise.all(clients.map(c=>nextState(c,s=>s.now===nextAt)));now=nextAt;server.tick();const states=await pending;
  for(let i=0;i<8;i++){
    assert.equal(states[i].self.wordGuide.best.word,i%2?'DOG':'CAT');
    assert.deepEqual(states[i].self.tray,pilots[i].tray);
    assert.ok(states[i].players.every(p=>!('wordGuide'in p)&&!('tray'in p)));
  }
  assert.equal(states[8].self.wordGuide,null);assert.deepEqual(states[8].self.tray,[]);
  await act(0,'wordMode',{enter:true});const prefix=pilots[0].tray.slice(0,3).map(t=>t.id),requestId=crypto.randomUUID();
  const result=await act(0,'submit',{tileIds:prefix,wordGuide:{best:{word:'HACK',points:9999}}},requestId);
  assert.equal(result.ok,true);assert.equal(result.value.word,'CAT');assert.equal(result.value.points,5);assert.equal(result.self.tray.map(t=>t.letter).join(''),'X');
  const retry=await act(0,'submit',{tileIds:prefix},requestId);assert.equal(retry.ok,true);assert.equal(pilots[0].score,5);assert.equal(pilots[0].tray.length,1);
  const savedState=room.privateState(pilots[1].id,now);assert.equal(savedState.wordGuide.best.word,'DOG');assert.equal(pilots[1].score,0);
  assert.equal((await fetch(url+'/practice.js')).status,200);assert.equal((await fetch(url+'/word-guide.js')).status,200);
});
