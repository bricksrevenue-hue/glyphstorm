import test from 'node:test';
import assert from 'node:assert/strict';
import { AimControls, vectorAngle, wrapAngle } from '../public/aim.js';
import { Arena } from '../public/arena.js';
import { FLEET } from '../public/fleet.js';
import { GameRoom } from '../server/game.mjs';
import { RULES } from '../public/rules.js';
const TAU=Math.PI*2;
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('held turn keys sweep the full circle at the same speed across frame rates and hold on release',()=>{
  for(const fps of [30,60,120])for(const direction of [-1,1]){
    const aim=new AimControls(.31);
    aim.point(99,99); // A stale mouse position must not override keyboard turning.
    for(let frame=1;frame<=fps*2;frame++){
      const angle=aim.update(1/fps,direction<0,direction>0,()=>1.2);
      const expected=.31+direction*Math.PI*frame/fps;
      near(Math.cos(angle),Math.cos(expected));near(Math.sin(angle),Math.sin(expected));
    }
    near(aim.update(.5,false,false,()=>2.4),wrapAngle(.31));
    const held=aim.angle;aim.update(.5,true,true,()=>1);near(aim.angle,held);
  }
});

test('mouse and touch aiming cover every quadrant, retain dead-zone headings, and follow a moving origin',()=>{
  const aim=new AimControls();
  let origin={x:30,y:70};
  const aimAt=(x,y)=>vectorAngle(x-origin.x,y-origin.y,aim.angle,2);
  for(let degrees=0;degrees<360;degrees+=7.5){
    const angle=degrees*Math.PI/180,x=Math.cos(angle),y=Math.sin(angle);
    aim.point(origin.x+x*100,origin.y+y*100);
    aim.update(0,false,false,aimAt);
    near(Math.cos(aim.angle),x);near(Math.sin(aim.angle),y);
    assert.equal(aim.stick(x,y),true);
    near(Math.cos(aim.angle),x);near(Math.sin(aim.angle),y);
    const held=aim.angle;assert.equal(aim.stick(.05,.05),false);near(aim.angle,held);
  }
  aim.point(130,70);aim.update(0,false,false,aimAt);near(aim.angle,0);
  origin={x:130,y:170};aim.update(0,false,false,aimAt);near(aim.angle,Math.PI*1.5);
  aim.point(origin.x,origin.y);aim.update(0,false,false,aimAt);near(aim.angle,Math.PI*1.5);
  aim.hold();assert.equal(aim.pointer,null);
});

test('every ship renderer applies full-circle mouse and synchronized player headings',t=>{
  const previousDpr=globalThis.devicePixelRatio;globalThis.devicePixelRatio=1;
  t.after(()=>{if(previousDpr===undefined)delete globalThis.devicePixelRatio;else globalThis.devicePixelRatio=previousDpr;});
  let heading=0;const stack=[],seen=[];
  const ctx=new Proxy({
    save(){stack.push(heading);},restore(){heading=stack.pop();},rotate(a){heading+=a;},
    setTransform(){heading=0;},createRadialGradient(){return {addColorStop(){}};},createLinearGradient(){return {addColorStop(){}};}
  },{get:(object,key)=>key in object?object[key]:(()=>{})});
  const canvas={width:1000,height:600,clientHeight:600,getContext:()=>ctx,
    getBoundingClientRect:()=>({left:23,top:47,width:1000,height:600})};
  const input={x:0,y:0,angle:0,pulse:false};
  const arena=new Arena(canvas,canvas,()=>input);
  const pilot={id:'pilot',shipId:FLEET[0].id,role:'player',x:1200,y:800,vx:0,vy:0,angle:0,
    color:'#70f7d1',name:'Pilot',connected:true,stability:3,resetUntil:0,shieldUntil:0,protectionUntil:0};
  arena.ships.draw=(_,shipId)=>{seen.push({shipId,x:Math.cos(heading),y:Math.sin(heading)});return true;};
  arena.state={matchId:'round',phase:'playing',now:0,players:[pilot],crystals:[],
    asteroids:[{id:'rock',x:1300,y:850,r:48,vx:10,vy:0,rotation:.3,hitsRemaining:2}],
    letters:[],pulses:[],events:[],settings:{disruption:false}};
  let time=performance.now();arena.received=time;arena.lastFrame=time;
  for(const ship of FLEET)for(const degrees of [0,17.5,45,90,135,180,225,270,315,359,1]){
    const angle=degrees*Math.PI/180;pilot.shipId=ship.id;
    arena.me=pilot.id;
    input.angle=arena.aimAt(523+Math.cos(angle)*100,347+Math.sin(angle)*100);
    near(Math.cos(input.angle),Math.cos(angle));near(Math.sin(input.angle),Math.sin(angle));
    for(const local of [true,false]){
      arena.me=local?pilot.id:null;pilot.angle=wrapAngle(angle);
      arena.draw(time+=16);
      const rendered=seen.at(-1);assert.equal(rendered.shipId,ship.id);
      near(rendered.x,Math.cos(angle));near(rendered.y,Math.sin(angle));
    }
  }
});

test('server headings and emitted pulses retain arbitrary angles across the 360-degree seam',()=>{
  const room=new GameRoom('ABCDEF');const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
  a.ready=b.ready=true;room.start(a.id,1000);room.tick(0,4000);
  // Angle checks need a clear firing path; a random asteroid can consume a pulse.
  room.asteroids=[];room.replenishFields=()=>{};
  a.protectionUntil=0;a.x=1200;a.y=800;b.x=2200;b.y=1400;
  let now=7000,seq=0;
  for(const angle of [0,.29,Math.PI/2,Math.PI,Math.PI*1.5,TAU-.01,TAU+.01,-.17,TAU*3+.73]){
    room.crystals=[];room.pulses=[];
    room.input(a.id,{matchId:room.matchId,seq:++seq,x:0,y:0,angle,pulse:true},now);
    room.tick(0,now);
    const pulse=room.pulses.find(p=>p.ownerId===a.id);assert.ok(pulse);
    near(pulse.vx/RULES.pulseSpeed,Math.cos(angle));near(pulse.vy/RULES.pulseSpeed,Math.sin(angle));
    near(room.publicState(now).players.find(p=>p.id===a.id).angle,wrapAngle(angle));
    now+=200;
  }
});
