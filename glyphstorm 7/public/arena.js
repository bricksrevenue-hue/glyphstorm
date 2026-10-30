import { WORLD, RULES, delta, wrap } from './rules.js';
import { ShipSprites } from './ship-sprites.js';
import { vectorAngle } from './aim.js';
import { drawAsteroid, AsteroidSprites } from './asteroids.js';
import { createEarthTexture, drawEarth } from './planet.js';
import { incomingSpeedFactor } from './power-ups.js';
import { NEON, BURST_COLORS, drawNeonGrid, letterGlow } from './neon.js';
import { WordEnergy } from './word-energy.js';
import { signalText } from './signals.js';
const TAU=Math.PI*2;
export const MAX_PARTICLES=320;
function sizeCanvas(canvas) {
  const rect=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
  const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
  return {ctx,w:rect.width,h:rect.height};
}
const stars=Array.from({length:180},(_,i)=>({x:((i*7919)%10007)/10007,y:((i*4447)%10009)/10009,r:i%7===0?1.4:.6,a:.15+(i%8)/18}));
function field(ctx,w,h,time,reduced) {
  ctx.clearRect(0,0,w,h);ctx.fillStyle=NEON.space;ctx.fillRect(0,0,w,h);
  for(const s of stars){ctx.globalAlpha=s.a*(reduced?1:.8+.2*Math.sin(time*.001+s.x*20));ctx.fillStyle='#c3e3f4';ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,TAU);ctx.fill();}
  ctx.globalAlpha=1;drawNeonGrid(ctx,w,h,time,reduced);
}
function crystal(ctx,x,y,r,rotation,letter,color='#70f7d1',scale=1) {
  ctx.save();ctx.translate(x,y);
  const points=[[-.1,-1],[.8,-.45],[.65,.64],[-.28,.95],[-.9,.15],[-.65,-.65]];
  ctx.rotate(rotation);
  ctx.beginPath();points.forEach(([px,py],i)=>i?ctx.lineTo(px*r,py*r):ctx.moveTo(px*r,py*r));ctx.closePath();
  const fill=ctx.createLinearGradient(-r,-r,r,r);fill.addColorStop(0,'#2c756b88');fill.addColorStop(1,'#182c5266');
  ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=color+'80';ctx.lineWidth=1.4;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-.1*r,-r);ctx.lineTo(-.28*r,.95*r);ctx.lineTo(.8*r,-.45*r);ctx.lineTo(-.9*r,.15*r);ctx.strokeStyle=color+'26';ctx.lineWidth=.7;ctx.stroke();
  ctx.rotate(-rotation);
  letterGlow(ctx,{color});ctx.fillStyle='#e7fff9';ctx.font='750 '+Math.max(13,21*scale)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(letter,0,1);
  ctx.restore();
}
export class SpaceBackdrop {
  constructor(canvas){this.canvas=canvas;this.reduced=false;this.active=true;}
  draw(time){
    const {ctx,w,h}=sizeCanvas(this.canvas);field(ctx,w,h,time,this.reduced);
    if(!this.active)return;
    const x=w*.25,y=h*.61,r=Math.min(520,w*.47);
    const g=ctx.createRadialGradient(x-r*.25,y-r*.3,0,x,y,r);g.addColorStop(0,'#163d4538');g.addColorStop(.6,'#112b4226');g.addColorStop(1,'#0b142300');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.clip();ctx.strokeStyle='#53969513';ctx.lineWidth=1;
    for(let i=-4;i<=4;i++){
      ctx.beginPath();ctx.ellipse(x,y,r*Math.max(.08,Math.abs(i)/4),r,.25,0,TAU);ctx.stroke();
      ctx.beginPath();ctx.ellipse(x,y+i*r*.22,r,Math.max(8,r*.19),.25,0,TAU);ctx.stroke();
    }ctx.restore();
    if(w>700){
      const t=this.reduced?0:time*.0001;
      crystal(ctx,w*.45+Math.sin(t)*10,h*.38,28,.2,'A','#70f7d1',1.1);
      crystal(ctx,w*.39+Math.cos(t)*10,h*.72,20,-.1,'R','#b5a0ff',.8);
      crystal(ctx,w*.08,h*.78+Math.sin(t)*7,17,.3,'E','#70f7d1',.7);
    }
  }
}
export class Arena {
  constructor(canvas,map,getInput){
    this.canvas=canvas;this.map=map;this.getInput=getInput;
    this.ships=new ShipSprites();
    this.rocks=new AsteroidSprites();this.earthTexture=createEarthTexture();
    this.state=null;this.me=null;this.follow=null;this.visual=new Map();this.camera={x:1200,y:800};
    this.received=0;this.lastEvent=0;this.effects=[];this.lastFrame=performance.now();this.reduced=false;
    this.particles=[];this.trails=new Map();
    this.wordEnergy=new WordEnergy();
    this.scale=1;this.w=1000;this.h=600;
  }
  update(state,me){
    if(this.state?.matchId!==state.matchId){
      this.visual.clear();this.effects=[];this.particles=[];this.trails.clear();
      this.lastEvent=state.phase==='playing'?Math.max(0,...state.events.map(e=>e.seq)):0;
    }
    this.state=state;this.me=me;this.received=performance.now();
    this.wordEnergy.update(state,this.received);
    for(const ev of state.events){
      if(ev.seq<=this.lastEvent)continue;
      this.lastEvent=ev.seq;
      if(!Number.isFinite(ev.at)||state.now-ev.at>1800)continue;
      if(['open','pickup','ripple','reset','return','word','asteroidCharge','asteroidOpen','barrierImpact','barrierBlock','intercept','powerUpStart','empPulse'].includes(ev.type))
        this.effects.push({...ev,born:this.received});
      if(!this.reduced){
        if(['barrierImpact','barrierBlock'].includes(ev.type))this.createShieldRipple(ev.x,ev.y,this.received);
        else this.burst(ev,this.received);
      }
    }
    this.effects=this.effects.slice(-80);
  }
  createShieldRipple(x,y,born=performance.now()){
    if(this.reduced||![x,y].every(Number.isFinite))return;
    for(let i=0;i<10;i++){
      const angle=i*TAU/10;
      this.particles.push({x,y,vx:Math.cos(angle)*190,vy:Math.sin(angle)*190,
        color:'#00f3ff',size:3,born,life:300,ripple:true});
    }
    if(this.particles.length>MAX_PARTICLES)this.particles.splice(0,this.particles.length-MAX_PARTICLES);
  }
  burst(event,born){
    if(!Number.isFinite(event.x)||!Number.isFinite(event.y))return;
    const count=event.type==='asteroidOpen'?36:event.type==='asteroidCharge'?5:event.type==='word'?24:event.type==='open'?14:event.type==='pickup'?5:event.type==='return'?14:8;
    for(let i=0;i<count;i++){
      const energetic=['open','asteroidOpen','word','intercept','powerUpStart','empPulse'].includes(event.type);
      const seed=((event.seq*97+i*53)%101)/101,angle=i*TAU/count+seed*.5,speed=energetic?200+seed*230:35+seed*115;
      this.particles.push({x:event.x,y:event.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        color:BURST_COLORS[i%BURST_COLORS.length],size:1+seed*2,born,life:500+seed*450});
    }
    if(this.particles.length>MAX_PARTICLES)this.particles.splice(0,this.particles.length-MAX_PARTICLES);
  }
  drawTrails(ctx,time,now){
    if(this.reduced){this.trails.clear();return;}
    const ids=new Set(this.state.players.filter(p=>p.role==='player').map(p=>p.id));
    for(const id of this.trails.keys())if(!ids.has(id))this.trails.delete(id);
    for(const pilot of this.state.players){
      if(pilot.role!=='player')continue;
      let trail=this.trails.get(pilot.id)||[];
      trail=trail.filter(point=>time-point.at<340);
      const moving=!pilot.wordMode&&pilot.resetUntil<=now&&Math.hypot(pilot.vx,pilot.vy)>35;
      const v=this.visual.get(pilot.id)||pilot;
      if(moving&&(!trail.length||time-trail.at(-1).at>=28))trail.push({
        x:wrap(v.x-Math.cos(v.angle)*14,WORLD.width),y:wrap(v.y-Math.sin(v.angle)*14,WORLD.height),at:time
      });
      this.trails.set(pilot.id,trail.slice(-14));
      ctx.save();ctx.strokeStyle=pilot.boostUntil>now?'#b6f1ff':pilot.color;ctx.lineCap='round';
      for(let i=1;i<trail.length;i++){
        const a=this.project(trail[i-1].x,trail[i-1].y),b=this.project(trail[i].x,trail[i].y);
        if(Math.hypot(a.x-b.x,a.y-b.y)>100*this.scale)continue;
        const strength=1-(time-trail[i].at)/340;
        ctx.globalAlpha=strength*(pilot.boostUntil>now?.8:.48);ctx.lineWidth=(1+strength*(pilot.boostUntil>now?6:3))*this.scale;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      ctx.restore();
    }
  }
  drawParticles(ctx,time){
    if(this.reduced){this.particles=[];return;}
    this.particles=this.particles.filter(p=>time-p.born<p.life);
    ctx.save();
    for(const p of this.particles){
      const age=(time-p.born)/1000,travel=p.ripple?age:(1-Math.exp(-3*age))/3;
      const s=this.project(wrap(p.x+p.vx*travel,WORLD.width),wrap(p.y+p.vy*travel,WORLD.height));
      if(s.x<0||s.y<0||s.x>this.w||s.y>this.h)continue;
      const fade=1-(time-p.born)/p.life;
      ctx.globalAlpha=fade*fade;ctx.fillStyle=p.color;
      const size=p.size*this.scale;
      if(p.ripple){ctx.beginPath();ctx.arc(s.x,s.y,size,0,TAU);ctx.fill();}
      else ctx.fillRect(s.x-size/2,s.y-size/2,size,size);
    }
    ctx.restore();
  }
  targetPlayer(){
    return this.state?.players.find(p=>p.id===(this.follow||this.me)&&p.role==='player') ||
      this.state?.players.find(p=>p.role==='player');
  }
  project(x,y){return {x:this.w/2+delta(x,this.camera.x,WORLD.width)*this.scale,y:this.h/2+delta(y,this.camera.y,WORLD.height)*this.scale};}
  aimAt(clientX,clientY){
    const p=this.state?.players.find(p=>p.id===this.me);if(!p)return 0;
    const v=this.visual.get(p.id)||p,screen=this.project(v.x,v.y),rect=this.canvas.getBoundingClientRect();
    return vectorAngle(clientX-rect.left-screen.x,clientY-rect.top-screen.y,this.getInput().angle,2);
  }
  drawUsefulness(ctx,x,y,r,kind,guide=false,incoming=false){
    ctx.save();
    if(kind==='useful'||guide){ctx.strokeStyle='#b6ff00';ctx.lineWidth=1.5;ctx.shadowColor='#b6ff00';ctx.shadowBlur=this.reduced?0:15;for(const extra of [0,4]){ctx.beginPath();ctx.arc(x,y,r+extra,0,TAU);ctx.stroke();}}
    else if(kind==='dim'){
      if(!incoming){ctx.fillStyle='#0a081366';ctx.beginPath();ctx.arc(x,y,r-2,0,TAU);ctx.fill();}
      ctx.strokeStyle='#9b8da9';ctx.setLineDash([2,4]);ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
    }
    ctx.restore();
  }
  drawGuide(ctx,x,y,r,label){
    ctx.save();ctx.strokeStyle='#00f3ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
    ctx.fillStyle='#071321';ctx.fillRect(x-35,y-r-18,70,15);ctx.fillStyle='#b6faff';ctx.font='700 9px system-ui';ctx.textAlign='center';ctx.fillText('NEXT · '+label,x,y-r-7);ctx.restore();
  }
  draw(time){
    const dt=Math.min((time-this.lastFrame)/1000,.05);this.lastFrame=time;
    if(!this.state || this.canvas.clientHeight===0)return;
    const {ctx,w,h}=sizeCanvas(this.canvas);this.w=w;this.h=h;
    this.scale=Math.min(w/1100,h/620);this.scale=Math.max(.4,Math.min(1.5,this.scale));
    field(ctx,w,h,time,this.reduced);
    const state=this.state,age=Math.min((time-this.received)/1000,.12),now=state.now+time-this.received;
    const hitAge=now-(state.defense?.lastImpactAt||-Infinity);
    ctx.save();
    if(!this.reduced&&hitAge>=0&&hitAge<200){const amplitude=3*(1-hitAge/200);ctx.translate(Math.sin(hitAge*.15)*amplitude,Math.cos(hitAge*.19)*amplitude);}
    const input=this.getInput();
    for(const p of state.players){
      if(p.role!=='player')continue;
      let v=this.visual.get(p.id);
      if(!v){v={x:p.x,y:p.y,angle:p.angle};this.visual.set(p.id,v);}
      if(p.id===this.me && !p.resetUntil && !p.wordMode && state.phase==='playing'){
        const boosting=p.boostUntil>now;
        v.x=wrap(v.x+(boosting?p.boostX*RULES.boostSpeed:input.x*RULES.speed)*dt,WORLD.width);
        v.y=wrap(v.y+(boosting?p.boostY*RULES.boostSpeed:input.y*RULES.speed)*dt,WORLD.height);
      }
      const k=1-Math.exp(-14*dt);
      const tx=wrap(p.x+p.vx*age,WORLD.width),ty=wrap(p.y+p.vy*age,WORLD.height);
      if(Math.hypot(delta(tx,v.x,WORLD.width),delta(ty,v.y,WORLD.height))>250){v.x=tx;v.y=ty;}
      else{v.x=wrap(v.x+delta(tx,v.x,WORLD.width)*k,WORLD.width);v.y=wrap(v.y+delta(ty,v.y,WORLD.height)*k,WORLD.height);}
      v.angle=p.id===this.me?input.angle:p.angle;
    }
    const target=this.targetPlayer(),cv=target&&(this.visual.get(target.id)||target);
    if(cv){const k=this.reduced?1:1-Math.exp(-10*dt);this.camera.x=wrap(this.camera.x+delta(cv.x,this.camera.x,WORLD.width)*k,WORLD.width);this.camera.y=wrap(this.camera.y+delta(cv.y,this.camera.y,WORLD.height)*k,WORLD.height);}
    const glow=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.max(w,h)*.65);
    glow.addColorStop(0,'#1d4b5423');glow.addColorStop(.6,'#15274920');glow.addColorStop(1,'#02071360');
    ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    // Neon perspective is decorative; all world entities retain linear aiming.
    if(state.defense?.enabled){
      const d=state.defense,s=this.project(d.x,d.y);
      drawEarth(ctx,s.x,s.y,this.scale,d,this.earthTexture,state.powerUps,now,this.reduced);
      // A fixed world objective cannot follow every pilot's camera. Point to it.
      if(s.x<0||s.x>w||s.y<0||s.y>h){
        const dx=s.x-w/2,dy=s.y-h/2,k=Math.min((w/2-38)/Math.max(1,Math.abs(dx)),(h/2-38)/Math.max(1,Math.abs(dy)));
        const x=w/2+dx*k,y=h/2+dy*k;
        ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.fillStyle='#00f3ff';
        ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-5,-5);ctx.lineTo(-5,5);ctx.closePath();ctx.fill();ctx.restore();
        ctx.fillStyle='#b6f1ff';ctx.font='600 9px system-ui';ctx.textAlign='center';ctx.fillText('EARTH · WAVE '+Math.max(0,Math.ceil((d.nextWaveAt-now)/1000))+'s',x,y+18);
      }
    }
    this.drawTrails(ctx,time,now);
    const visible=(s,margin=80)=>s.x>-margin&&s.x<w+margin&&s.y>-margin&&s.y<h+margin;
    const local=state.players.find(p=>p.id===this.me),guideDistance=t=>Math.hypot(delta(t.x,this.camera.x,WORLD.width),delta(t.y,this.camera.y,WORLD.height));
    const guideIds=new Set(this.guideLetter?[...state.crystals,...state.letters].filter(t=>t.letter===this.guideLetter&&
      (!t.priorityUntil||t.priorityUntil<=now||t.ownerId===this.me||(state.settings.mode==='teams'&&t.team===local?.team)))
      .sort((a,b)=>guideDistance(a)-guideDistance(b)).slice(0,4).map(t=>t.id):[]);
    const usefulness=state.self?.wordGuide?.usefulness||{};
    for(const c of state.crystals){
      const s=this.project(c.x,c.y);if(!visible(s))continue;
      const rotation=c.rotation+(this.reduced?0:time*.00006);
      crystal(ctx,s.x,s.y,Math.max(18,c.r*this.scale),rotation,c.letter,c.letter==='Q'||c.letter==='Z'||c.letter==='X'?NEON.pink:NEON.cyan,this.scale);
      this.drawUsefulness(ctx,s.x,s.y,Math.max(18,c.r*this.scale)+3,usefulness[c.letter],guideIds.has(c.id));
      if(guideIds.has(c.id))this.drawGuide(ctx,s.x,s.y,Math.max(18,c.r*this.scale)+7,'PULSE '+c.letter);
    }
    for(const a of state.asteroids||[]){
      const s=this.project(wrap(a.x+a.vx*age,WORLD.width),wrap(a.y+a.vy*age,WORLD.height));if(!visible(s))continue;
      if(a.kind==='meteor'&&!this.reduced){
        ctx.save();ctx.strokeStyle='#a0e7f435';ctx.lineWidth=3*this.scale;
        const length=Math.hypot(a.vx,a.vy)||1;ctx.beginPath();ctx.moveTo(s.x,s.y);
        ctx.lineTo(s.x-a.vx/length*110*this.scale,s.y-a.vy/length*110*this.scale);ctx.stroke();ctx.restore();
      }
      const flash=!this.reduced&&this.effects.some(e=>e.type==='asteroidCharge'&&e.asteroidId===a.id&&time-e.born<150);
      drawAsteroid(ctx,s.x,s.y,a.r*this.scale,a.rotation+(this.reduced?0:(now-(state.startAt||0))*(a.spin??.08)/1000),a.hitsRemaining,
        {...a,texture:this.rocks.texture,flash});
    }
    const fallingFactor=incomingSpeedFactor(state.powerUps,now);
    for(const l of state.letters){
      const s=this.project(wrap(l.x+(l.incoming?l.vx*age*fallingFactor:0),WORLD.width),wrap(l.y+(l.incoming?l.vy*age*fallingFactor:0),WORLD.height));if(!visible(s))continue;
      if(l.incoming){
        ctx.save();ctx.strokeStyle=NEON.pink+'80';ctx.lineWidth=2*this.scale;ctx.beginPath();ctx.moveTo(s.x,s.y);
        const speed=Math.hypot(l.vx,l.vy)||1;ctx.lineTo(s.x-l.vx/speed*38*this.scale,s.y-l.vy/speed*38*this.scale);ctx.stroke();ctx.restore();
      }
      const protectedPickup=l.priorityUntil>now;
      const mine=state.players.find(p=>p.id===this.me);
      const eligible=!protectedPickup||l.ownerId===this.me||(state.settings.mode==='teams'&&mine?.team===l.team);
      const letter={...l,color:l.incoming?NEON.pink:eligible?NEON.lime:'#c399ff'};
      const color=letter.color,r=Math.max(13,RULES.letterRadius*this.scale);
      ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=l.expiresAt-now<3000?.55:1;
      letterGlow(ctx,letter,this.reduced);
      ctx.fillStyle='#153143';ctx.strokeStyle=color;ctx.lineWidth=1.3;
      ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=color;ctx.font='750 '+Math.max(14,20*this.scale)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l.letter,0,1);ctx.shadowBlur=0;
      if(protectedPickup){ctx.beginPath();ctx.arc(0,0,r+6,-Math.PI/2,-Math.PI/2+TAU*Math.max(0,(l.priorityUntil-now)/2000));ctx.strokeStyle=color+'70';ctx.lineWidth=1;ctx.stroke();}
      if(l.doubleScore){ctx.fillStyle='#ffdc9e';ctx.font='800 11px system-ui';ctx.fillText('★',r-1,-r+1);}
      ctx.restore();
      this.drawUsefulness(ctx,s.x,s.y,r+3,usefulness[l.letter],guideIds.has(l.id),l.incoming);
      if(l.magnetized){ctx.save();ctx.strokeStyle='#b6ff00';ctx.setLineDash([2,4]);ctx.beginPath();ctx.arc(s.x,s.y,r+10,0,TAU);ctx.stroke();ctx.restore();}
      if(eligible&&guideIds.has(l.id))this.drawGuide(ctx,s.x,s.y,r+9,'COLLECT '+l.letter);
    }
    for(const pulse of state.pulses){
      const s=this.project(wrap(pulse.x+pulse.vx*age,WORLD.width),wrap(pulse.y+pulse.vy*age,WORLD.height));if(!visible(s))continue;
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(pulse.vy,pulse.vx));ctx.strokeStyle=pulse.color;ctx.lineWidth=2;
      if(!this.reduced){ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(-30*this.scale,0);ctx.lineTo(-8*this.scale,0);ctx.stroke();ctx.globalAlpha=1;}
      ctx.shadowBlur=this.reduced?0:8;ctx.shadowColor=pulse.color;ctx.beginPath();ctx.ellipse(0,0,8*this.scale,4*this.scale,0,0,TAU);ctx.stroke();ctx.restore();
    }
    for(const p of state.players){
      if(p.role!=='player')continue;
      const v=this.visual.get(p.id)||p,s=this.project(v.x,v.y);if(!visible(s))continue;
      const r=Math.max(11,16*this.scale);
      ctx.save();ctx.translate(s.x,s.y);
      if(p.resetUntil>now){
        ctx.strokeStyle=p.color+'80';ctx.lineWidth=1;
        for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,r*(1+i*.5),r*(.5+i*.25),0,0,TAU);ctx.stroke();}
        ctx.restore();continue;
      }
      if(p.shieldUntil>now||p.protectionUntil>now){
        ctx.strokeStyle=p.color+'b0';ctx.fillStyle=p.color+'10';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(0,0,r+14+(this.reduced?0:Math.sin(time*.004)*2),0,TAU);ctx.fill();ctx.stroke();
      }
      if(p.boostUntil>now){
        ctx.strokeStyle='#b6f1ff';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(0,0,r+9,Math.atan2(p.boostY,p.boostX)-1,Math.atan2(p.boostY,p.boostX)+1);ctx.stroke();
      }
      // Paint is cosmetic. This marker always uses the server's pilot/team color.
      ctx.strokeStyle=p.color;ctx.lineWidth=p.id===this.me?1.7:1.2;
      ctx.beginPath();ctx.arc(0,0,r+5,0,TAU);ctx.stroke();
      ctx.save();ctx.rotate(v.angle);
      if(!this.ships.draw(ctx,p.shipId,r*2.5)){
        if(Math.hypot(p.vx,p.vy)>20){ctx.fillStyle=p.color+'55';ctx.beginPath();ctx.moveTo(-r*.7,-r*.3);ctx.lineTo(-r*(this.reduced?1.4:1.5+Math.sin(time*.03)*.25),0);ctx.lineTo(-r*.7,r*.3);ctx.fill();}
        ctx.fillStyle=p.color+'35';ctx.strokeStyle=p.color;ctx.lineWidth=1.7;
        ctx.beginPath();ctx.moveTo(r*1.15,0);ctx.lineTo(-r*.8,r*.75);ctx.lineTo(-r*.45,0);ctx.lineTo(-r*.8,-r*.75);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#eafffa';ctx.beginPath();ctx.arc(0,0,2.5,0,TAU);ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle=p.id===this.me?'#edfff9':'#bbcfdf';ctx.font='600 10px system-ui';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(p.name+(p.connected?'':' · away'),0,r+16);
      if(state.settings.disruption){for(let i=0;i<3;i++){ctx.fillStyle=i<p.stability?p.color:'#26374e';ctx.fillRect(-13+i*10,r+30,7,2);}}
      ctx.restore();
    }
    this.drawParticles(ctx,time);
    this.wordEnergy.draw(ctx,(x,y)=>this.project(x,y),this.scale,time,this.reduced);
    for(const signal of (state.self?.signals||[]).filter(s=>s.expiresAt>now).slice(-3)){
      const s=this.project(signal.x,signal.y);if(!visible(s))continue;
      ctx.save();ctx.strokeStyle='#ffdc9e';ctx.fillStyle='#ffdc9e';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(s.x,s.y,34*this.scale,0,TAU);ctx.stroke();
      ctx.textAlign='center';ctx.font='700 11px system-ui';ctx.fillText(signalText(signal),s.x,s.y-40*this.scale);ctx.restore();
    }
    this.effects=this.effects.filter(e=>time-e.born<(e.type==='barrierImpact'?850:e.type==='barrierBlock'?300:e.type==='word'?1400:800));
    for(const e of this.effects){
      if(e.x===undefined)continue;
      const s=this.project(e.x,e.y),t=(time-e.born)/(e.type==='barrierImpact'?850:e.type==='barrierBlock'?300:e.type==='word'?1400:800);
      ctx.save();ctx.globalAlpha=1-t;ctx.strokeStyle=e.color||'#a3ffe0';ctx.fillStyle=e.color||'#a3ffe0';
      if(e.type==='empPulse'){
        ctx.strokeStyle=NEON.cyan;ctx.lineWidth=3;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?190:40+t*620)*this.scale,0,TAU);ctx.stroke();
        ctx.textAlign='center';ctx.font='700 13px system-ui';ctx.fillStyle=NEON.lime;ctx.fillText(e.count+' LETTERS SECURED',s.x,s.y-32);
      }else if(['barrierImpact','barrierBlock'].includes(e.type)){
        ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?18:8+t*52)*this.scale,0,TAU);ctx.stroke();
        if(e.type==='barrierImpact'&&e.damage){ctx.fillStyle='#ff8d9b';ctx.font='800 23px system-ui';ctx.textAlign='center';ctx.fillText('−'+e.damage,s.x,s.y-24-(this.reduced?0:t*34));}
      }else if(e.type==='word'){
        const mine=e.playerId===this.me;
        ctx.font='800 '+(mine?23:16)+'px system-ui';ctx.textAlign='center';ctx.fillText(e.word+' +'+e.points,s.x,s.y-40-(this.reduced?0:t*42));
        if(!this.reduced){ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,(15+t*65)*this.scale,0,TAU);ctx.stroke();}
      }else if(e.type==='asteroidOpen'){
        ctx.textAlign='center';ctx.font='800 18px system-ui';ctx.fillText('+'+e.count+' LETTERS',s.x,s.y-54-(this.reduced?0:t*28));
        ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?55:35+t*95)*this.scale,0,TAU);ctx.stroke();
      }else if(e.type==='asteroidCharge'){
        ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?50:40+t*20)*this.scale,0,TAU);ctx.stroke();
      }else if(e.type==='pickup'){
        ctx.font='800 17px system-ui';ctx.textAlign='center';ctx.fillText('+'+e.letter,s.x,s.y-15-(this.reduced?0:t*24));
      }else{
        ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?20:8+t*48)*this.scale,0,TAU);ctx.stroke();
      }ctx.restore();
    }
    const vignette=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.7);
    vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#050b20b0');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
    if(state.phase==='playing'&&state.endAt>now&&state.endAt-now<=30000){
      ctx.strokeStyle=state.endAt-now<=10000?'#ffbe7870':'#ffbe7830';ctx.lineWidth=3;ctx.strokeRect(1.5,1.5,w-3,h-3);
    }
    if(!this.reduced&&hitAge>=0&&hitAge<180){
      ctx.save();ctx.fillStyle='#ff3758';ctx.globalAlpha=.12*(1-hitAge/180);ctx.fillRect(0,0,w,h);ctx.restore();
    }
    ctx.restore();this.drawMap();
  }
  drawMap(){
    const ctx=this.map.getContext('2d'),w=this.map.width,h=this.map.height;ctx.clearRect(0,0,w,h);
    ctx.strokeStyle='#2e486040';ctx.lineWidth=1;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(w*i/4,0);ctx.lineTo(w*i/4,h);ctx.stroke();}
    ctx.fillStyle='#577485';for(const c of this.state.crystals)ctx.fillRect(c.x/WORLD.width*w,c.y/WORLD.height*h,2,2);
    for(const a of this.state.asteroids||[]){ctx.fillStyle=a.kind==='meteor'?'#a0e7f4':'#ffcf92';ctx.beginPath();ctx.arc(a.x/WORLD.width*w,a.y/WORLD.height*h,a.kind==='meteor'?3.5:2.5,0,TAU);ctx.fill();}
    for(const p of this.state.players){if(p.role!=='player'||p.resetUntil)continue;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x/WORLD.width*w,p.y/WORLD.height*h,p.id===this.me?3.5:2,0,TAU);ctx.fill();}
    const d=this.state.defense;
    if(d?.enabled){
      ctx.strokeStyle='#00f3ff';ctx.fillStyle='#137c99';ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(d.x/WORLD.width*w,d.y/WORLD.height*h,d.barrierRadius/WORLD.width*w,d.barrierRadius/WORLD.height*h,0,0,TAU);ctx.stroke();
      ctx.beginPath();ctx.arc(d.x/WORLD.width*w,d.y/WORLD.height*h,4,0,TAU);ctx.fill();
      ctx.fillStyle=NEON.pink;for(const letter of this.state.letters)if(letter.incoming)ctx.fillRect(letter.x/WORLD.width*w-1.5,letter.y/WORLD.height*h-1.5,3,3);
    }
    const p=this.targetPlayer();if(p){ctx.strokeStyle=p.color+'60';ctx.beginPath();ctx.arc(p.x/WORLD.width*w,p.y/WORLD.height*h,8,0,TAU);ctx.stroke();}
    const now=this.state.now+performance.now()-this.received;
    ctx.strokeStyle='#ffdc9e';ctx.lineWidth=2;
    for(const s of (this.state.self?.signals||[]).filter(s=>s.expiresAt>now)){
      ctx.strokeRect(s.x/WORLD.width*w-4,s.y/WORLD.height*h-4,8,8);
    }
  }
}
