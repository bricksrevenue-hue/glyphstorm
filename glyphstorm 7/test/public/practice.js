import { RULES, scoreWord } from './rules.js';
import { NEON } from './neon.js';

export const FIRST_FLIGHT_KEY='glyphstorm.first-flight.v2';
export function needsFirstFlight(savedStatus,pilotName){return (savedStatus!=='complete'&&savedStatus!=='skipped')||!pilotName?.trim();}

const lessons={
  move:['1 / 3 · FLY','Fly with WASD/Left Stick to the highlighted crystal.'],
  pulse:['2 / 3 · PULSE','Aim and hold Left-Click/Right Stick to pulse the crystal.'],
  collect:['2 / 3 · COLLECT','Fly into the three green letters. We’ll arrange CAT for this first word.'],
  submit:['3 / 3 · SPELL','Press Enter or click Submit to spell CAT and repair Earth.'],
  done:['FIRST WORD COMPLETE','CAT repaired Earth! In a match, Auto-Best arranges your longest word. Then press Submit.']
};

// An isolated lesson: no socket, room, score, inventory or shared-world mutation.
export class PracticeRun{
  constructor(){this.ship={x:90,y:160,angle:0,vx:0,vy:0};this.step='move';this.tray=[];this.letters=[];this.crystal={x:280,y:160};this.pulses=[];this.time=0;this.lastShot=-1000;this.points=0;this.earthHealth=98;this.barrierThickness=5;}
  get lesson(){return lessons[this.step];}
  get canMove(){return ['move','pulse','collect'].includes(this.step);}
  get canPulse(){return this.step==='pulse';}
  get phase(){return this.step==='move'?1:['pulse','collect'].includes(this.step)?2:3;}
  update(input,dt){
    if(!this.canMove){this.ship.vx=this.ship.vy=0;return;}
    dt=Math.max(0,Math.min(dt,.05));this.time+=dt*1000;
    const s=this.ship,n=Math.max(1,Math.hypot(input.x,input.y)),blend=1-Math.exp(-RULES.acceleration*dt);
    s.vx+=(input.x/n*RULES.speed-s.vx)*blend;s.vy+=(input.y/n*RULES.speed-s.vy)*blend;
    s.x=Math.max(18,Math.min(702,s.x+s.vx*dt));s.y=Math.max(18,Math.min(302,s.y+s.vy*dt));
    const pulseUnlocked=this.canPulse;
    if(this.step==='move'&&Math.hypot(s.x-this.crystal.x,s.y-this.crystal.y)<=100)this.step='pulse';
    if(pulseUnlocked&&Number.isFinite(input.angle))s.angle=input.angle;
    if(pulseUnlocked&&input.pulse&&this.time-this.lastShot>=RULES.pulseInterval){this.lastShot=this.time;this.pulses.push({x:s.x,y:s.y,vx:Math.cos(s.angle)*RULES.pulseSpeed,vy:Math.sin(s.angle)*RULES.pulseSpeed,life:.9});}
    for(const pulse of this.pulses){
      const previous={x:pulse.x,y:pulse.y};pulse.x+=pulse.vx*dt;pulse.y+=pulse.vy*dt;pulse.life-=dt;
      const dx=pulse.x-previous.x,dy=pulse.y-previous.y;
      const t=this.crystal?Math.max(0,Math.min(1,((this.crystal.x-previous.x)*dx+(this.crystal.y-previous.y)*dy)/(dx*dx+dy*dy||1))):0;
      if(this.crystal&&Math.hypot(previous.x+dx*t-this.crystal.x,previous.y+dy*t-this.crystal.y)<29){
        this.crystal=null;pulse.life=0;this.letters=[{letter:'C',x:280,y:160},{letter:'A',x:370,y:110},{letter:'T',x:460,y:160}];this.step='collect';
      }}
    this.pulses=this.pulses.filter(p=>p.life>0);
    this.letters=this.letters.filter(tile=>{
      if(Math.hypot(s.x-tile.x,s.y-tile.y)>=RULES.shipRadius+RULES.letterRadius)return true;
      this.tray.push(tile.letter);return false;
    });
    if(this.step==='collect'&&this.tray.length===3){
      this.tray=['C','A','T'];this.step='submit';s.vx=s.vy=0;this.pulses=[];
    }
  }
  discardLast(){return false;} // Step-locked lesson; live-game discard controls are unchanged.
  submit(){if(this.step!=='submit'||this.tray.join('')!=='CAT')return false;this.points=scoreWord('CAT');this.earthHealth=Math.min(100,this.earthHealth+2);this.barrierThickness+=1.5;this.step='done';return true;}
}

export class PracticeLesson{
  constructor(onComplete,onExit=()=>{}){
    this.$=id=>document.getElementById(id);this.dialog=this.$('practiceDialog');this.canvas=this.$('practiceCanvas');this.ctx=this.canvas.getContext('2d');this.onComplete=onComplete;
    this.onExit=onExit;this.active=false;this.keys=new Set();this.move={x:0,y:0};this.aim=null;this.firing=false;this.stickResetters=[];
    this.$('practiceDiscard').onclick=()=>{this.run.discardLast();this.renderText();this.canvas.focus({preventScroll:true});};
    this.$('practiceSubmit').onclick=()=>this.submit();
    this.$('practiceContinue').onclick=()=>this.finish(true);
    this.$('practiceSkip').onclick=()=>this.finish(true);
    this.$('practiceClose').onclick=()=>this.finish(false);
    this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.finish(false);});
    window.addEventListener('blur',()=>this.clearInput());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clearInput();});
    window.addEventListener('keydown',e=>{if(!this.active)return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();if(this.run.canMove)this.keys.add(key);}if(e.key==='Enter'&&!e.repeat&&e.target.tagName!=='BUTTON'){e.preventDefault();this.submit();}});
    window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    const point=e=>{const r=this.canvas.getBoundingClientRect();this.pointer={x:(e.clientX-r.left)*720/r.width,y:(e.clientY-r.top)*320/r.height};};
    this.canvas.addEventListener('pointermove',e=>{if(this.active&&e.pointerType!=='touch')point(e);});
    this.canvas.addEventListener('pointerdown',e=>{if(!this.active||!this.run.canPulse||e.button!==0||e.pointerType==='touch')return;e.preventDefault();point(e);this.firing=true;this.canvas.setPointerCapture(e.pointerId);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.canvas.addEventListener(name,()=>this.firing=false);
    this.stick('practiceMove',false);this.stick('practiceAim',true);
  }
  clearInput(){this.keys.clear();this.move={x:0,y:0};this.aim=null;this.pointer=null;this.firing=false;for(const reset of this.stickResetters)reset();}
  stick(id,aim){
    const el=this.$(id),knob=el.querySelector('span');let pointer=null;
    this.stickResetters.push(()=>{const old=pointer;pointer=null;knob.style.transform='';if(old!==null&&el.hasPointerCapture(old))el.releasePointerCapture(old);});
    const enabled=()=>this.active&&(aim?this.run.canPulse:this.run.canMove);
    const move=e=>{if(pointer!==e.pointerId||!enabled())return;e.preventDefault();const r=el.getBoundingClientRect(),limit=r.width*.38;let x=(e.clientX-r.left-r.width/2)/limit,y=(e.clientY-r.top-r.height/2)/limit;const n=Math.max(1,Math.hypot(x,y));x/=n;y/=n;knob.style.transform='translate('+x*limit+'px,'+y*limit+'px)';if(aim){this.aim=Math.hypot(x,y)>.15?Math.atan2(y,x):null;this.firing=this.aim!==null;this.pointer=null;}else this.move={x,y};};
    el.addEventListener('pointerdown',e=>{if(pointer!==null||!enabled())return;pointer=e.pointerId;el.setPointerCapture(pointer);move(e);});el.addEventListener('pointermove',move);
    for(const name of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(name,e=>{if(pointer!==e.pointerId)return;pointer=null;knob.style.transform='';if(aim){this.aim=null;this.firing=false;}else this.move={x:0,y:0};});
  }
  open(continueAction=null){
    if(this.active)return;this.run=new PracticeRun();this.continueAction=continueAction;this.active=true;this.clearInput();this.signature='';this.last=performance.now();
    this.$('practiceSkip').textContent=continueAction?'Skip First Flight & join':'Skip First Flight';
    this.$('practiceContinue').textContent=continueAction?'Join the game →':'Back to flight deck →';
    this.dialog.showModal();this.renderText();this.canvas.focus({preventScroll:true});this.frame(this.last);
  }
  submit(){
    if(!this.active||!this.run.submit())return;
    this.clearInput();this.onComplete();this.renderText();
    // Show the repair before continuing, while retaining a manual Continue control.
    this.finishTimer=setTimeout(()=>this.finish(true),1600);
  }
  finish(proceed){if(!this.active)return;this.active=false;clearTimeout(this.finishTimer);cancelAnimationFrame(this.raf);this.clearInput();this.dialog.close();const fn=this.continueAction;this.continueAction=null;this.onExit(this.run.step==='done'?'complete':proceed?'skipped':'closed');if(proceed&&fn)fn();}
  renderText(){
    const key=this.run.step+this.run.tray.join('');if(key===this.signature)return;this.signature=key;
    const [title,hint]=this.run.lesson;this.$('practiceStep').textContent=title;this.$('practiceHint').textContent=hint;
    this.dialog.dataset.phase=String(this.run.phase);
    for(const el of this.dialog.querySelectorAll('[data-flight-phase]'))el.setAttribute('aria-current',Number(el.dataset.flightPhase)===this.run.phase?'step':'false');
    this.$('practiceMove').setAttribute('aria-disabled',String(!this.run.canMove));this.$('practiceAim').setAttribute('aria-disabled',String(!this.run.canPulse));
    this.$('practiceControls').textContent=this.run.step==='move'?'Movement unlocked · pulse and submit locked':this.run.step==='pulse'?'Movement + pulse unlocked · submit locked':this.run.step==='collect'?'Collect all three letters · pulse and submit locked':this.run.step==='submit'?'Ship stopped · submit unlocked':'Earth repaired · joining your next flight…';
    this.$('practiceTray').textContent=this.run.tray.length?this.run.tray.map((l,i)=>String(i+1).padStart(2,'0')+' '+l).join('   →   '):'01 —   →   02 —   →   03 —';
    this.$('practiceDiscard').disabled=this.run.step!=='discard';this.$('practiceSubmit').disabled=this.run.step!=='submit';
    this.$('practiceContinue').classList.toggle('hidden',this.run.step!=='done');
    this.$('practiceSkip').classList.toggle('hidden',this.run.step==='done');
    this.$('practiceResult').textContent=this.run.step==='done'?'+'+this.run.points+' practice points · Earth +2 HP · shield +1.5':'';
    if(this.run.step==='submit')this.$('practiceSubmit').focus({preventScroll:true});
    if(this.run.step==='discard')this.$('practiceDiscard').focus({preventScroll:true});
    if(this.run.step==='done')this.$('practiceContinue').focus({preventScroll:true});
  }
  frame(now){
    if(!this.active)return;const s=this.run.ship;
    const x=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0)+this.move.x;
    const y=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0)+this.move.y;
    this.run.update({x,y,angle:this.pointer?Math.atan2(this.pointer.y-s.y,this.pointer.x-s.x):this.aim??s.angle,pulse:this.firing},(now-this.last)/1000);this.last=now;this.renderText();this.draw();this.raf=requestAnimationFrame(t=>this.frame(t));
  }
  draw(){
    const c=this.ctx,r=this.run;c.fillStyle='#0a0813';c.fillRect(0,0,720,320);c.strokeStyle='#302044';c.lineWidth=1;
    for(let x=0;x<=720;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,320);c.stroke();}for(let y=0;y<=320;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(720,y);c.stroke();}
    const target=r.crystal||r.letters[0];
    if(target){c.setLineDash([5,7]);c.strokeStyle=r.crystal?NEON.gold:NEON.lime;c.beginPath();c.moveTo(r.ship.x,r.ship.y);c.lineTo(target.x,target.y);c.stroke();c.setLineDash([]);}
    if(r.crystal){c.strokeStyle=NEON.gold;c.lineWidth=2;c.beginPath();c.arc(r.crystal.x,r.crystal.y,100,0,Math.PI*2);c.stroke();c.save();c.translate(r.crystal.x,r.crystal.y);c.rotate(Math.PI/4);c.fillStyle='#483b12';c.strokeStyle=NEON.gold;c.lineWidth=3;c.fillRect(-21,-21,42,42);c.strokeRect(-21,-21,42,42);c.restore();c.fillStyle=NEON.gold;c.font='bold 16px monospace';c.textAlign='center';c.fillText('C A T',r.crystal.x,r.crystal.y-40);}
    for(const t of r.letters){c.fillStyle=NEON.lime;c.beginPath();c.arc(t.x,t.y,21,0,Math.PI*2);c.fill();c.fillStyle=NEON.space;c.font='bold 25px monospace';c.textAlign='center';c.fillText(t.letter,t.x,t.y+8);}
    c.fillStyle=NEON.lime;for(const p of r.pulses){c.beginPath();c.arc(p.x,p.y,3,0,Math.PI*2);c.fill();}
    c.save();c.translate(r.ship.x,r.ship.y);c.rotate(r.ship.angle);c.fillStyle=NEON.lime;c.strokeStyle=NEON.lime;c.lineWidth=2;c.beginPath();c.moveTo(18,0);c.lineTo(-12,-11);c.lineTo(-7,0);c.lineTo(-12,11);c.closePath();c.fill();c.stroke();c.restore();
    c.fillStyle='#125b93';c.strokeStyle=r.step==='done'?NEON.lime:NEON.cyan;c.lineWidth=r.barrierThickness;c.beginPath();c.arc(620,160,38,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#e8f7ff';c.font='bold 13px monospace';c.textAlign='center';c.fillText('EARTH '+r.earthHealth+'%',620,225);
  }
}
