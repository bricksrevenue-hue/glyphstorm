export const NEON=Object.freeze({space:'#0a0813',pink:'#ff2bd6',lime:'#b6ff00',cyan:'#00f3ff',violet:'#bd00ff'});
export const BURST_COLORS=Object.freeze([NEON.pink,NEON.lime,NEON.cyan]);

// Decorative screen-space grid; never used for aiming or collision geometry.
export function drawNeonGrid(ctx,w,h,time,reduced=false){
  ctx.save();ctx.lineWidth=.75;ctx.shadowBlur=reduced?0:5;ctx.shadowColor=NEON.pink;
  const horizon=h*.33,depth=h-horizon,phase=reduced?0:(time*.00012)%1;
  ctx.strokeStyle='#ff2bd633';ctx.beginPath();ctx.moveTo(0,horizon);ctx.lineTo(w,horizon);ctx.stroke();
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
