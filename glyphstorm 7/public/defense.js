import { WORLD } from './rules.js';

// Browser-wide snapshot mirrors, never trusted as multiplayer authority.
export let earthHealth = 100;
export let barrierThickness = 5;
export let maxBarrierThickness = 25;

export const DEFENSE = Object.freeze({
  maxHealth:100, initialThickness:5, maxThickness:25, damage:5, repair:2,
  x:WORLD.width/2, y:WORLD.height/2, earthRadius:150, barrierRadius:190,
  firstWaveMs:12000, waveMs:8000, maxIncoming:16
});

// Each GameRoom receives its own object. Rooms never share mutable health.
export function createDefenseState(enabled=true){
  return {enabled,earthHealth:100,barrierThickness:5,maxBarrierThickness:25,
    x:DEFENSE.x,y:DEFENSE.y,earthRadius:DEFENSE.earthRadius,barrierRadius:DEFENSE.barrierRadius,
    wave:0,nextWaveAt:0,lastImpactAt:0,breaches:0};
}
export function syncDefenseState(defense){
  earthHealth=defense?.earthHealth??100;
  barrierThickness=defense?.barrierThickness??5;
  maxBarrierThickness=defense?.maxBarrierThickness??25;
}

// First segment/circle contact, including a tangent or a start inside it.
export function sweepCircle(x,y,dx,dy,radius){
  const c=x*x+y*y-radius*radius;
  if(c<=0)return 0;
  const a=dx*dx+dy*dy;if(a===0)return null;
  const b=x*dx+y*dy,discriminant=b*b-a*c;
  if(discriminant<0)return null;
  const t=(-b-Math.sqrt(discriminant))/a;
  return t>=0&&t<=1?t:null;
}
