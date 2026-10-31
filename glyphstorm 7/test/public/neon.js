export const NEON=Object.freeze({space:'#0a0813',pink:'#FF3366',lime:'#00FF66',gold:'#FFCC00',neutral:'#C6BFD7',cyan:'#00f3ff',violet:'#bd00ff'});
// Successful pickups/spelling never use the threat color.
export const BURST_COLORS=Object.freeze([NEON.lime,NEON.gold,NEON.cyan]);
export function pulseColor(pulse,viewer,mode){
  if(!viewer)return NEON.neutral;
  if(pulse.ownerId===viewer.id)return NEON.lime;
  return mode==='teams'&&pulse.team===viewer.team?NEON.gold:NEON.pink;
}

// Decorative screen-space grid; never used for aiming or collision geometry.
export function drawNeonGrid(ctx,w,h,time,reduced=false){
  ctx.save();ctx.lineWidth=.75;ctx.shadowBlur=reduced?0:5;ctx.shadowColor='#685281';
  const horizon=h*.33,depth=h-horizon,phase=reduced?0:(time*.00012)%1;
  ctx.strokeStyle='#68528133';ctx.beginPath();ctx.moveTo(0,horizon);ctx.lineTo(w,horizon);ctx.stroke();
  for(let i=0;i<15;i++){
    const t=(i+phase)/15,y=horizon+t*t*depth;
    ctx.globalAlpha=.2+t*.55;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
  }
  ctx.globalAlpha=.28;ctx.strokeStyle=NEON.cyan;ctx.shadowColor=NEON.cyan;
  for(let i=-7;i<=7;i++){
    ctx.beginPath();ctx.moveTo(w/2+i*w*.025,horizon);ctx.lineTo(w/2+i*w*.18,h);ctx.stroke();
  }
  ctx.restore();
}
export function letterGlow(ctx,letter,reduced=false){
  ctx.shadowBlur=reduced?0:10;
  ctx.shadowColor=letter.color;
}
