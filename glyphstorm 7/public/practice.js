import { RULES, scoreWord } from './rules.js';

const lessons={
  pulse:['1 / 7 · OPEN','Aim at the C crystal and hold pulse to release its letter.'],
  collectC:['2 / 7 · COLLECT','Fly into C. Your ship collects the letter on contact.'],
  collectX:['3 / 7 · TRY A MISTAKE','Fly into X to learn how to correct an unwanted pickup.'],
  discard:['4 / 7 · CORRECT','You have CX. Tap Discard last to remove X and keep C.'],
  collectA:['5 / 7 · COLLECT MORE','Collect A. In live play you can rearrange every tile.'],
  collectT:['6 / 7 · FINISH THE WORD','Collect T to make CAT. In live play, drag or tap two tiles to swap.'],
  submit:['7 / 7 · SCORE','Tap Submit CAT or press Enter. Live play can submit the whole tray or a selected range.'],
  done:['FIRST WORD COMPLETE','CAT scored! In a live match, words repair Earth. Pulse pink threats to stop them without adding unwanted letters. Keep Earth alive; highest word score wins.']
};

// An isolated lesson: no socket, room, score, inventory or shared-world mutation.
export class PracticeRun{
  constructor(){this.ship={x:90,y:160,angle:0,vx:0,vy:0};this.step='pulse';this.tray=[];this.letters=[];this.crystal={x:280,y:160};this.pulses=[];this.time=0;this.lastShot=-1000;this.points=0;}
  get lesson(){return lessons[this.step];}
  spawn(letter,x,y,step){this.letters=[{letter,x,y}];this.step=step;}
  update(input,dt){
    if(this.step==='done')return;
    dt=Math.max(0,Math.min(dt,.05));this.time+=dt*1000;
    const s=this.ship,n=Math.max(1,Math.hypot(input.x,input.y)),blend=1-Math.exp(-RULES.acceleration*dt);
    s.vx+=(input.x/n*RULES.speed-s.vx)*blend;s.vy+=(input.y/n*RULES.speed-s.vy)*blend;
    s.x=Math.max(18,Math.min(702,s.x+s.vx*dt));s.y=Math.max(18,Math.min(302,s.y+s.vy*dt));
    if(Number.isFinite(input.angle))s.angle=input.angle;
    if(input.pulse&&this.time-this.lastShot>=RULES.pulseInterval){this.lastShot=this.time;this.pulses.push({x:s.x,y:s.y,vx:Math.cos(s.angle)*RULES.pulseSpeed,vy:Math.sin(s.angle)*RULES.pulseSpeed,life:.9});}
    for(const pulse of this.pulses){pulse.x+=pulse.vx*dt;pulse.y+=pulse.vy*dt;pulse.life-=dt;
      if(this.crystal&&Math.hypot(pulse.x-this.crystal.x,pulse.y-this.crystal.y)<29){this.crystal=null;pulse.life=0;this.spawn('C',280,160,'collectC');}}
    this.pulses=this.pulses.filter(p=>p.life>0);
    const tile=this.letters[0];
    if(tile&&Math.hypot(s.x-tile.x,s.y-tile.y)<RULES.shipRadius+RULES.letterRadius){
      this.tray.push(tile.letter);this.letters=[];
      if(this.step==='collectC')this.spawn('X',380,160,'collectX');
      else if(this.step==='collectX')this.step='discard';
      else if(this.step==='collectA')this.spawn('T',560,220,'collectT');
      else if(this.step==='collectT')this.step='submit';
    }
  }
  discardLast(){if(this.step!=='discard')return false;this.tray.pop();this.spawn('A',460,100,'collectA');return true;}
  submit(){if(this.step!=='submit'||this.tray.join('')!=='CAT')return false;this.points=scoreWord('CAT');this.step='done';return true;}
}

export class PracticeLesson{
  constructor(onComplete){
    this.$=id=>document.getElementById(id);this.dialog=this.$('practiceDialog');this.canvas=this.$('practiceCanvas');this.ctx=this.canvas.getContext('2d');this.onComplete=onComplete;
    this.active=false;this.keys=new Set();this.move={x:0,y:0};this.aim=null;this.firing=false;this.stickResetters=[];
    this.$('practiceDiscard').onclick=()=>{this.run.discardLast();this.renderText();this.canvas.focus({preventScroll:true});};
    this.$('practiceSubmit').onclick=()=>{if(this.run.submit()){this.onComplete();this.renderText();}};
    this.$('practiceContinue').onclick=()=>this.finish(true);
    this.$('practiceSkip').onclick=()=>this.finish(true);
    this.$('practiceClose').onclick=()=>this.finish(false);
    this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.finish(false);});
    window.addEventListener('blur',()=>this.clearInput());
    window.addEventListener('keydown',e=>{if(!this.active)return;if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();this.keys.add(e.key.toLowerCase());}if(e.key==='Enter'&&!e.repeat&&e.target.tagName!=='BUTTON'){e.preventDefault();if(this.run.submit()){this.onComplete();this.renderText();}}});
    window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    const point=e=>{const r=this.canvas.getBoundingClientRect();this.pointer={x:(e.clientX-r.left)*720/r.width,y:(e.clientY-r.top)*320/r.height};};
    this.canvas.addEventListener('pointermove',e=>{if(this.active&&e.pointerType!=='touch')point(e);});
    this.canvas.addEventListener('pointerdown',e=>{if(!this.active||e.button!==0)return;e.preventDefault();point(e);this.firing=true;this.canvas.setPointerCapture(e.pointerId);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.canvas.addEventListener(name,()=>this.firing=false);
    this.stick('practiceMove',false);this.stick('practiceAim',true);
  }
  clearInput(){this.keys.clear();this.move={x:0,y:0};this.aim=null;this.pointer=null;this.firing=false;for(const reset of this.stickResetters)reset();}
  stick(id,aim){
    const el=this.$(id),knob=el.querySelector('span');let pointer=null;
    this.stickResetters.push(()=>{const old=pointer;pointer=null;knob.style.transform='';if(old!==null&&el.hasPointerCapture(old))el.releasePointerCapture(old);});
    const move=e=>{if(pointer!==e.pointerId)return;e.preventDefault();const r=el.getBoundingClientRect(),limit=r.width*.38;let x=(e.clientX-r.left-r.width/2)/limit,y=(e.clientY-r.top-r.height/2)/limit;const n=Math.max(1,Math.hypot(x,y));x/=n;y/=n;knob.style.transform='translate('+x*limit+'px,'+y*limit+'px)';if(aim){this.aim=Math.hypot(x,y)>.15?Math.atan2(y,x):null;this.firing=this.aim!==null;this.pointer=null;}else this.move={x,y};};
    el.addEventListener('pointerdown',e=>{if(pointer!==null)return;pointer=e.pointerId;el.setPointerCapture(pointer);move(e);});el.addEventListener('pointermove',move);
    for(const name of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(name,e=>{if(pointer!==e.pointerId)return;pointer=null;knob.style.transform='';if(aim){this.aim=null;this.firing=false;}else this.move={x:0,y:0};});
  }
  open(continueAction=null){
    if(this.active)return;this.run=new PracticeRun();this.continueAction=continueAction;this.active=true;this.clearInput();this.signature='';this.last=performance.now();
    this.$('practiceSkip').textContent=continueAction?'Skip practice & join':'Skip practice';
    this.$('practiceContinue').textContent=continueAction?'Join the game →':'Back to flight deck →';
    this.dialog.showModal();this.renderText();this.canvas.focus({preventScroll:true});this.frame(this.last);
  }
  finish(proceed){if(!this.active)return;this.active=false;cancelAnimationFrame(this.raf);this.clearInput();this.dialog.close();const fn=this.continueAction;this.continueAction=null;if(proceed&&fn)fn();}
  renderText(){
    const key=this.run.step+this.run.tray.join('');if(key===this.signature)return;this.signature=key;
    const [title,hint]=this.run.lesson;this.$('practiceStep').textContent=title;this.$('practiceHint').textContent=hint;
    this.$('practiceTray').textContent=this.run.tray.length?this.run.tray.map((l,i)=>String(i+1).padStart(2,'0')+' '+l).join('   →   '):'01 —   →   02 —   →   03 —';
    this.$('practiceDiscard').disabled=this.run.step!=='discard';this.$('practiceSubmit').disabled=this.run.step!=='submit';
    this.$('practiceContinue').classList.toggle('hidden',this.run.step!=='done');
    this.$('practiceSkip').classList.toggle('hidden',this.run.step==='done');
    this.$('practiceResult').textContent=this.run.step==='done'?'+'+this.run.points+' practice points · live scores start at zero':'';
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
    if(target){c.setLineDash([5,7]);c.strokeStyle='#00f3ff66';c.beginPath();c.moveTo(r.ship.x,r.ship.y);c.lineTo(target.x,target.y);c.stroke();c.setLineDash([]);}
    if(r.crystal){c.save();c.translate(r.crystal.x,r.crystal.y);c.rotate(Math.PI/4);c.fillStyle='#174451';c.strokeStyle='#00f3ff';c.lineWidth=3;c.fillRect(-21,-21,42,42);c.strokeRect(-21,-21,42,42);c.restore();c.fillStyle='#d8fcff';c.font='bold 23px monospace';c.textAlign='center';c.fillText('C',r.crystal.x,r.crystal.y+8);}
    for(const t of r.letters){c.fillStyle=t.letter==='X'?'#ff90d9':'#b6ff00';c.beginPath();c.arc(t.x,t.y,21,0,Math.PI*2);c.fill();c.fillStyle='#0a0813';c.font='bold 25px monospace';c.textAlign='center';c.fillText(t.letter,t.x,t.y+8);}
    c.fillStyle='#00f3ff';for(const p of r.pulses){c.beginPath();c.arc(p.x,p.y,3,0,Math.PI*2);c.fill();}
    c.save();c.translate(r.ship.x,r.ship.y);c.rotate(r.ship.angle);c.fillStyle='#f3faff';c.strokeStyle='#00f3ff';c.lineWidth=2;c.beginPath();c.moveTo(18,0);c.lineTo(-12,-11);c.lineTo(-7,0);c.lineTo(-12,11);c.closePath();c.fill();c.stroke();c.restore();
  }
}
