import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchFeedback, raceStatus } from '../public/match-feedback.js';
import { Arena, MAX_PARTICLES } from '../public/arena.js';
import { WordEnergy } from '../public/word-energy.js';

const pilot=(id,score=0,team=0,role='player')=>({id,name:id.toUpperCase(),score,team,role});
const state=(overrides={})=>({matchId:'round-1',phase:'playing',now:10000,
  settings:{mode:'ffa'},players:[pilot('a'),pilot('b')],events:[],self:{history:[]},...overrides});
const word=(seq,word='STAR',at=10000)=>({seq,type:'word',playerId:'a',word,points:6,at,x:1200,y:800,color:'#70f7d1'});

test('race targets handle opening scores, ties, retired pilots and spectators',()=>{
  const s=state();
  assert.equal(raceStatus(s,'a').message,'Score the opening word');
  assert.deepEqual(raceStatus(s,'a').leaders,[]);
  s.players=[pilot('a',20),pilot('b',28),pilot('c',30,0,'retired'),pilot('watcher',999,0,'spectator')];
  assert.equal(raceStatus(s,'a').message,'11 points to take the lead');
  assert.equal(raceStatus(s,'watcher').score,30);
  assert.equal(raceStatus(s,'watcher').label,'LEADING SCORE');
  s.players[0].score=30;
  assert.equal(raceStatus(s,'a').message,'Shared lead · break the tie');
  s.players[0].score=36;
  assert.equal(raceStatus(s,'a').message,'Leading by 6 points');
  assert.equal(raceStatus(s,'a').leading,true);
});

test('team race totals include retained points and team lead changes use team wording',()=>{
  const s=state({settings:{mode:'teams'},players:[pilot('a',10),pilot('c',15,0,'retired'),pilot('b',30,1)]});
  const feedback=new MatchFeedback();feedback.reset(s,'a',true);
  assert.equal(raceStatus(s,'a').score,25);
  assert.equal(raceStatus(s,'a').label,'YOUR TEAM');
  assert.equal(raceStatus(s,'a').message,'6 points to take the lead');
  s.players[0].score=20;
  assert.equal(feedback.update(s,'a').announcement,'YOUR TEAM TAKES THE LEAD');
  assert.equal(raceStatus(s,'a').message,'Leading by 5 points');
});

test('acknowledgements and snapshots celebrate a word once in either delivery order',()=>{
  for(const ackFirst of [true,false]){
    const feedback=new MatchFeedback(),s=state(),entry=word(1);
    feedback.reset(s,'a',true);s.events=[entry];s.players[0].score=6;
    const first=ackFirst?feedback.word(entry):feedback.update(s,'a').words[0];
    assert.equal(first.word,'STAR');assert.equal(first.points,6);
    if(ackFirst)assert.deepEqual(feedback.update(s,'a').words,[]);
    else assert.equal(feedback.word(entry),null);
    assert.deepEqual(feedback.update(s,'a').words,[]);
    const next=state({matchId:'round-2',events:[word(1)]});
    assert.equal(feedback.update(next,'a').words[0].word,'STAR');
  }
});

test('reconnect and delayed snapshots do not replay old scoring celebrations',()=>{
  const feedback=new MatchFeedback(),s=state({events:[word(1)],self:{history:[{word:'STAR',points:6}]}});
  feedback.reset(s,'a',true);
  assert.deepEqual(feedback.update(s,'a').words,[]);
  assert.equal(feedback.word({word:'STAR',points:6}),null);
  s.events.push(word(2,'MOON',7000),word(3,'COMET',9900),{...word(4,'ORBIT'),at:undefined});
  const cues=feedback.update(s,'a');
  assert.deepEqual(cues.events.map(e=>e.word),['COMET']);
  assert.deepEqual(cues.words.map(e=>e.word),['COMET']);
  assert.deepEqual(feedback.update(s,'a').events,[]);
});

test('lead alerts announce real changes once and recognize shared leads',()=>{
  const feedback=new MatchFeedback(),s=state();
  assert.equal(feedback.update(s,'a').announcement,null);
  s.players[0].score=10;
  assert.equal(feedback.update(s,'a').announcement,'YOU TAKE THE LEAD');
  assert.equal(feedback.update(s,'a').announcement,null);
  s.players[1].score=10;
  assert.equal(feedback.update(s,'a').announcement,'NECK AND NECK · TIED LEAD');
  s.players[1].score=11;
  assert.equal(feedback.update(s,'a').announcement,'B TAKES THE LEAD');
  feedback.reset(s,'a',true);
  assert.equal(feedback.update(s,'a').announcement,null);
});

test('countdown cues tick once per observed second without a late-join catch-up',()=>{
  const feedback=new MatchFeedback();
  assert.equal(feedback.clock('countdown',3).tick,true);
  assert.equal(feedback.clock('countdown',3).tick,false);
  assert.equal(feedback.clock('countdown',2).tick,true);
  assert.deepEqual(feedback.clock('playing',300),{tick:false,notice:null});
  assert.match(feedback.clock('playing',30).notice,/30 SECONDS/);
  assert.deepEqual(feedback.clock('playing',30),{tick:false,notice:null});
  assert.deepEqual(feedback.clock('playing',10),{tick:true,notice:'10 SECONDS · EVERY WORD COUNTS'});
  assert.equal(feedback.clock('playing',9).tick,true);
  assert.deepEqual(feedback.clock('results',0),{tick:false,notice:null});
  const late=new MatchFeedback();
  assert.deepEqual(late.clock('playing',8),{tick:false,notice:null});
  assert.equal(late.clock('playing',7).tick,true);
});

test('arena effects stay bounded, skip old events and respect reduced motion',()=>{
  const arena=Object.create(Arena.prototype);
  Object.assign(arena,{state:null,visual:new Map(),effects:[],particles:[],trails:new Map(),lastEvent:0,reduced:false,wordEnergy:new WordEnergy()});
  const s=state({events:[word(1)]});
  arena.update(s,'a');assert.equal(arena.particles.length,0); // Joining a live round.
  s.events=[word(2,'MOON',7000),word(3,'COMET')];
  arena.update(s,'a');assert.equal(arena.effects.length,1);assert.ok(arena.particles.length>0);
  const count=arena.particles.length;arena.update(s,'a');assert.equal(arena.particles.length,count);
  for(let seq=4;seq<100;seq++)arena.burst(word(seq),0);
  assert.equal(arena.particles.length,MAX_PARTICLES);
  arena.drawParticles({save(){},restore(){}},1000);assert.equal(arena.particles.length,0);
  arena.burst(word(100),1000);arena.trails.set('a',[{x:1,y:1,at:1000}]);arena.reduced=true;
  arena.drawParticles(null,1000);arena.drawTrails(null,1000,10000);
  assert.equal(arena.particles.length,0);assert.equal(arena.trails.size,0);
  s.events=[word(101,'ORBIT')];arena.update(s,'a');assert.equal(arena.particles.length,0);
  assert.equal(arena.effects.at(-1).word,'ORBIT'); // Readable score feedback remains.
});
