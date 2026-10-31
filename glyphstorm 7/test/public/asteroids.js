import { NEON } from './neon.js';
import { RULES } from './rules.js';

export class AsteroidSprites {
  constructor(){this.texture=null;this.ready=this.load();}
  async load(){
    try{
      const image=new Image();image.src='/assets/asteroids/rock-v15.png';await image.decode();
      const texture=document.createElement('canvas');texture.width=texture.height=384;
      const ctx=texture.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(image,0,0,384,384);this.texture=texture;return true;
    }catch{return false;}
  }
}

// Generated rocky texture with a code-drawn fallback and separate HUD markers.
export function drawAsteroid(ctx,x,y,r,rotation,hitsRemaining,options={}) {
  const maxHits=options.maxHits||RULES.asteroidHits,charged=maxHits-hitsRemaining;
  const meteor=options.kind==='meteor',accent=NEON.gold;
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
  if(options.texture){
    ctx.drawImage(options.texture,-r*1.08,-r*1.08,r*2.16,r*2.16);
  }else{
  const radii=[.93,.81,.97,.88,1,.83,.95,.86,.98,.8,.95,.87];
  ctx.beginPath();
  radii.forEach((radius,i)=>{
    const a=i*Math.PI*2/radii.length,px=Math.cos(a)*r*radius,py=Math.sin(a)*r*radius;
    if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);
  });ctx.closePath();
  const rock=ctx.createLinearGradient(-r,-r,r,r);
  rock.addColorStop(0,'#6b6573');rock.addColorStop(.5,'#393c50');rock.addColorStop(1,'#202537');
  ctx.fillStyle=rock;ctx.fill();ctx.strokeStyle=NEON.gold;ctx.lineWidth=1.6;ctx.stroke();
  for(const [cx,cy,cr] of [[-.36,-.27,.2],[.38,.07,.15],[-.12,.4,.13]]){
    ctx.fillStyle='#131e2e66';ctx.strokeStyle='#e2d3b024';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(cx*r,cy*r,cr*r,cr*r*.72,.4,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  ctx.strokeStyle=NEON.gold;ctx.lineWidth=charged===2?2.4:1.5;
  ctx.beginPath();ctx.moveTo(-r*.52,r*.52);ctx.lineTo(-r*.16,r*.1);ctx.lineTo(-r*.22,-r*.32);ctx.lineTo(r*.2,-r*.72);
  ctx.moveTo(-r*.16,r*.1);ctx.lineTo(r*.3,-r*.04);ctx.lineTo(r*.62,-r*.38);ctx.stroke();
  }
  ctx.rotate(-rotation);
  {
    ctx.strokeStyle=NEON.gold+(options.flash?'ee':'90');ctx.lineWidth=options.flash?2:1;
    ctx.beginPath();ctx.arc(0,0,r+3,0,Math.PI*2);ctx.stroke();
  }
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<maxHits;i++){
    ctx.fillStyle=i<charged?accent:'#162131';ctx.strokeStyle=accent;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc((i-(maxHits-1)/2)*9,r+8,2.5,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  const reward={vowel:' + VOWEL',double:' · ★ ×2',shield:' + SHIELD'}[options.rewardType]||'';
  const label=(meteor?'METEOR · ':'')+(options.letterCount||RULES.asteroidLetters)+' LETTERS'+reward;
  ctx.fillStyle='#081320dd';ctx.fillRect(-label.length*2.9-5,r+15,label.length*5.8+10,16);
  ctx.fillStyle=accent;ctx.font='650 9px system-ui';ctx.fillText(label,0,r+23);
  ctx.restore();
}
