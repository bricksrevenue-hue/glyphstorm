import { POWER_UPS, activePowerUp } from './power-ups.js';
const TAU=Math.PI*2;

export function createEarthTexture(){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d'),r=240;
  ctx.translate(256,256);ctx.save();ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.clip();
  const ocean=ctx.createRadialGradient(-90,-100,8,0,0,260);
  ocean.addColorStop(0,'#2b95ca');ocean.addColorStop(.55,'#125b93');ocean.addColorStop(1,'#041a32');
  ctx.fillStyle=ocean;ctx.fillRect(-256,-256,512,512);
  // Hand-drawn stylized land masses; no network artwork dependency.
  const land=[
    [[-210,-130],[-160,-170],[-100,-155],[-85,-125],[-30,-110],[-60,-65],[-95,-62],[-115,-15],[-150,-40],[-170,-95]],
    [[-95,-15],[-50,0],[-25,55],[-45,95],[-60,160],[-95,197],[-110,130],[-100,85],[-130,40]],
    [[25,-170],[75,-190],[120,-158],[205,-160],[238,-105],[170,-75],[130,-40],[105,-75],[68,-54],[30,-95]],
    [[25,-65],[80,-50],[115,0],[88,50],[64,107],[30,65],[15,18],[-8,-15]],
    [[160,88],[205,76],[236,109],[210,145],[158,140],[140,117]]
  ];
  ctx.fillStyle='#5bb9a2';ctx.strokeStyle='#90d7b5';ctx.lineWidth=2;
  for(const points of land){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.strokeStyle='#e7ffff7a';ctx.lineCap='round';ctx.lineWidth=9;
  for(const [x,y,rx,ry,rotation] of [[-100,-130,90,20,-.3],[80,40,115,20,.3],[-130,95,70,16,.1],[150,-90,90,20,-.4]]){
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*1.4);ctx.stroke();
  }
  ctx.fillStyle='#e3f5ffbb';ctx.beginPath();ctx.ellipse(0,-235,100,25,0,0,TAU);ctx.fill();
  const shade=ctx.createLinearGradient(-160,-140,220,160);
  shade.addColorStop(0,'#000b1900');shade.addColorStop(.5,'#000b1900');shade.addColorStop(1,'#000917e8');
  ctx.fillStyle=shade;ctx.fillRect(-256,-256,512,512);ctx.restore();
  ctx.strokeStyle='#8cddff99';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
  return canvas;
}

export function drawEarth(ctx,x,y,scale,defense,texture,powerUps=null,now=0,reduced=false){
  const {earthRadius,barrierRadius,earthHealth,barrierThickness}=defense;
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  const aura=ctx.createRadialGradient(0,0,earthRadius*.9,0,0,barrierRadius+30);
  aura.addColorStop(0,'#00baff1a');aura.addColorStop(1,'#00baff00');
  ctx.fillStyle=aura;ctx.beginPath();ctx.arc(0,0,barrierRadius+30,0,TAU);ctx.fill();
  if(texture)ctx.drawImage(texture,-earthRadius*256/240,-earthRadius*256/240,earthRadius*512/240,earthRadius*512/240);
  else {ctx.fillStyle='#125b93';ctx.beginPath();ctx.arc(0,0,earthRadius,0,TAU);ctx.fill();}
  // Match the server's shield circle exactly; only the camera scales it.
  const invulnerable=activePowerUp(powerUps,now)===POWER_UPS.INVULNERABILITY;
  ctx.lineWidth=invulnerable?Math.max(12,barrierThickness+6):barrierThickness;
  ctx.shadowBlur=invulnerable?28:15;ctx.shadowColor=invulnerable?'#bd00ff':'#00f3ff';
  ctx.strokeStyle=earthHealth>0?(invulnerable?'#bd00ff':'#00f3ff99'):'#ff677077';
  ctx.beginPath();ctx.arc(0,0,barrierRadius,0,TAU);ctx.stroke();ctx.shadowBlur=0;
  const hitAge=now-(defense.lastImpactAt||-Infinity);
  if(hitAge>=0&&hitAge<450){
    ctx.save();ctx.globalAlpha=reduced?.7:1-hitAge/450;ctx.strokeStyle='#ff5269';ctx.lineWidth=barrierThickness+5;
    ctx.beginPath();ctx.arc(0,0,barrierRadius,0,TAU);ctx.stroke();ctx.restore();
  }
  ctx.fillStyle='#d0f9ff';ctx.textAlign='center';ctx.font='700 12px system-ui';
  ctx.fillText('EARTH · '+earthHealth+'%',0,earthRadius+26);
  ctx.font='700 11px system-ui';ctx.fillStyle='#ffcf92';
  ctx.fillText('INCOMING WAVE · '+Math.max(0,Math.ceil((defense.nextWaveAt-now)/1000))+'s',0,earthRadius+43);ctx.restore();
}
