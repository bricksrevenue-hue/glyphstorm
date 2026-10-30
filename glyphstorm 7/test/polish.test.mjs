import test from 'node:test';
import assert from 'node:assert/strict';
import {GameRoom} from '../server/game.mjs';
import {scoreWord,WORLD} from '../public/rules.js';
import {WordEnergy,energyPath,wordRewardLabel,ENERGY_RULES} from '../public/word-energy.js';
import {CompactHUD} from '../public/compact-hud.js';
import {SIGNAL_TYPES,signalText} from '../public/signals.js';
import {MatchFeedback} from '../public/match-feedback.js';
function setup(mode='teams',defense=true){
  const room=new GameRoom('POLISH',{words:new Set(['CAT','STAR','DOG']),now:1000});
  const players=Array.from({length:4},(_,i)=>room.addPlayer('Pilot '+i,1000+i));
  room.configure(players[0].id,{mode,minutes:3,defense,disruption:false});players.forEach(p=>p.ready=true);
  room.start(players[0].id,1000);room.tick(0,4000);room.replenishFields=()=>{};room.asteroids=[];room.crystals=[];
  return {room,players};
}
function spell(room,p,word,now=7000){
  p.tray=[...word].map(letter=>({id:room.id(),letter}));room.wordMode(p.id,true,now);
  return room.submit(p.id,p.tray.map(t=>t.id),now);
}
test('word feedback reports actual capped repair and growth without changing scoring',()=>{
  const {room,players:[p]}=setup();room.defense.earthHealth=99;room.defense.barrierThickness=24.5;
  const entry=spell(room,p,'CAT');assert.equal(entry.points,scoreWord('CAT'));
  assert.equal(entry.defenseReward.hp,1);assert.equal(entry.defenseReward.shield,.5);
  assert.equal(wordRewardLabel(entry.defenseReward),'EARTH +1 HP · SHIELD +0.5');
  const event=room.events.find(e=>e.type==='word');assert.deepEqual(event.defenseReward,entry.defenseReward);
  const feedback=new MatchFeedback();assert.deepEqual(feedback.word(entry).defenseReward,entry.defenseReward);
  assert.equal(feedback.word(event),null);
  const second=spell(room,p,'STAR');assert.equal(wordRewardLabel(second.defenseReward),'EARTH FULL · SHIELD AT MAX');
  assert.throws(()=>spell(room,p,'STAR'),/already scored/);
  assert.equal(p.score,scoreWord('CAT')+scoreWord('STAR'));
  const classic=setup('ffa',false);assert.equal(spell(classic.room,classic.players[0],'CAT').defenseReward,null);
  assert.equal(wordRewardLabel(null),'');
});
test('team signals disclose only to teammates, reject unsupported requests and respect cooldown/expiry/rematch',()=>{
  const {room,players:[a,b,c]}=setup();const spectator=room.addPlayer('Watcher',7000);
  const score=a.score,tray=structuredClone(a.tray),health=room.defense.earthHealth;
  room.signal(a.id,{kind:SIGNAL_TYPES.NEED_LETTER,letter:'A',team:b.team,scope:'all',playerId:b.id,x:99,y:99},7000);
  const signal=room.privateState(c.id,7000).signals[0];assert.equal(signalText(signal),'Need A');
  assert.equal(signal.playerId,a.id);assert.equal(signal.team,a.team);assert.equal(signal.x,a.x);
  assert.equal(room.privateState(b.id,7000).signals.length,0);assert.equal(room.privateState(spectator.id,7000).signals.length,0);
  assert.equal(room.publicState(7000).signals,undefined);assert.ok(room.events.every(e=>!e.kind?.includes('letter')));
  assert.throws(()=>room.signal(a.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},11999),/recharge/);
  assert.throws(()=>room.signal(spectator.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},7000),/Spectators/);
  assert.throws(()=>room.signal(b.id,{kind:SIGNAL_TYPES.NEED_LETTER,letter:'<script>'},7000),/one letter/);
  assert.throws(()=>room.signal(b.id,{kind:'free-chat',text:'hello'},7000),/preset/);
  assert.equal(room.privateState(c.id,13000).signals.length,0);
  room.signal(a.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},13000);
  assert.equal(room.privateState(c.id,13000).signals[0].x,room.defense.x);
  assert.equal(room.privateState(b.id,13000).signals.length,0);
  assert.equal(a.score,score);assert.deepEqual(a.tray,tray);assert.equal(room.defense.earthHealth,health);
  room.finish(room.endAt);assert.deepEqual(room.privateState(a.id,room.endAt).signals,[]);
  room.lobby(a.id,room.endAt+1);assert.equal(a.signalReadyAt,0);assert.deepEqual(room.signals,[]);
});
test('FFA shares only defense presets with pilots, while classic teams can still request letters',()=>{
  const {room,players:[a,b]}=setup('ffa');
  assert.throws(()=>room.signal(a.id,{kind:SIGNAL_TYPES.NEED_LETTER,letter:'A'},7000),/team/);
  room.signal(a.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},7000);
  assert.equal(room.privateState(b.id,7000).signals.length,1);assert.equal(room.signals[0].scope,'all');
  const classic=setup('teams',false),p=classic.players[0];
  assert.throws(()=>classic.room.signal(p.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},7000),/off/);
  classic.room.signal(p.id,{kind:SIGNAL_TYPES.NEED_LETTER,letter:'Z'},7000);
  assert.equal(classic.room.signals.length,1);
});
test('word energy takes a short torus path and is bounded, deduplicated, expired and reset',()=>{
  const reward={x:20,y:800,barrierRadius:10,hp:2,shield:1.5};
  const event={seq:1,type:'word',word:'CAT',x:WORLD.width-20,y:800,at:7000,defenseReward:reward};
  const path=energyPath(event);assert.equal(path.dx,30);assert.equal(path.dy,0);
  const state={matchId:'one',phase:'countdown',now:7000,defense:{enabled:true},events:[]},energy=new WordEnergy();
  energy.update(state,0);state.phase='playing';state.events=[event];energy.update(state,10);energy.update(state,20);
  assert.equal(energy.effects.length,1);
  state.events=Array.from({length:40},(_,i)=>({...event,seq:i+2}));energy.update(state,100);
  assert.equal(energy.effects.length,ENERGY_RULES.maxEffects);
  const calls=[],ctx={save(){},restore(){},beginPath(){},arc(...a){calls.push(['arc',...a]);},stroke(){},fillText(...a){calls.push(['text',...a]);}};
  const project=(x,y)=>({x,y});energy.draw(ctx,project,1,200,true);
  assert.ok(calls.some(c=>c[0]==='arc'));assert.ok(calls.every(c=>c[0]!=='text'));
  energy.draw(ctx,project,1,250,false);assert.ok(calls.some(c=>c[0]==='text'));
  energy.draw(ctx,project,1,3000);assert.equal(energy.effects.length,0);
  state.events=[{...event,seq:60,at:0}];energy.update(state,3100);assert.equal(energy.effects.length,0);
  state.matchId='two';state.events=[{...event,seq:61}];energy.update(state,3200);assert.equal(energy.effects.length,0); // late join never replays
  state.events.push({...event,seq:62});energy.update(state,3300);assert.equal(energy.effects.length,1);
  state.phase='results';energy.update(state,3400);assert.equal(energy.effects.length,0);
});
test('compact HUD moves the same live nodes, restores their order and closes on resize/exit',()=>{
  class Element{
    constructor(id){this.id=id;this.children=[];this.parent=null;this.open=false;}
    append(el){if(el.parent)el.parent.children.splice(el.parent.children.indexOf(el),1);el.parent=this;this.children.push(el);}
    before(el){this.parent.append(el);this.parent.children.pop();this.parent.children.splice(this.parent.children.indexOf(this),0,el);}
    after(el){if(el.parent)el.parent.children.splice(el.parent.children.indexOf(el),1);el.parent=this.parent;this.parent.children.splice(this.parent.children.indexOf(this)+1,0,el);}
    close(){this.open=false;}
  }
  const ids=['powerUpCard','bountyCard','meteorCard','scoreboard','soundButton','motionButton','telemetryDialog','telemetryObjectives','telemetryScores','telemetryPreferences'];
  const elements=new Map(ids.map(id=>[id,new Element(id)])),parent=new Element('desktop');ids.slice(0,6).forEach(id=>parent.append(elements.get(id)));
  const media={matches:true,addEventListener(type,fn){this.change=fn;}},doc={getElementById:id=>elements.get(id),createComment:()=>new Element(null)};
  const hud=new CompactHUD(doc,media),same=elements.get('powerUpCard');hud.setActive(true);
  assert.equal(same.parent.id,'telemetryObjectives');assert.equal(elements.get('scoreboard').parent.id,'telemetryScores');
  same.liveValue='VIOLET GUARD';elements.get('telemetryDialog').open=true;media.matches=false;media.change();
  assert.equal(elements.get('telemetryDialog').open,false);assert.equal(same.parent,parent);assert.equal(same.liveValue,'VIOLET GUARD');
  assert.deepEqual(parent.children.filter(n=>n.id).map(n=>n.id),ids.slice(0,6));
  media.matches=true;media.change();elements.get('telemetryDialog').open=true;hud.setActive(false);
  assert.equal(elements.get('telemetryDialog').open,false);assert.equal(elements.get('soundButton').parent,parent);
});
