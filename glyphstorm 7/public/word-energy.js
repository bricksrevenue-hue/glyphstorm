import {WORLD,delta,wrap} from './rules.js';
export const ENERGY_RULES=Object.freeze({travelMs:760,staggerMs:35,rippleMs:500,maxEffects:16});
export function wordRewardLabel(reward){
  if(!reward)return '';
  return (reward.hp?'EARTH +'+reward.hp+' HP':'EARTH FULL')+' · '+
    (reward.shield?'SHIELD +'+reward.shield.toFixed(1):'SHIELD AT MAX');
}
export function energyPath(event){
  const d=event.defenseReward,dx=delta(event.x,d.x,WORLD.width),dy=delta(event.y,d.y,WORLD.height);
  const angle=Math.atan2(dy,dx),x=wrap(d.x+Math.cos(angle)*d.barrierRadius,WORLD.width),y=wrap(d.y+Math.sin(angle)*d.barrierRadius,WORLD.height);
  return {x:event.x,y:event.y,dx:delta(x,event.x,WORLD.width),dy:delta(y,event.y,WORLD.height)};
}
// Decorative only: damage, repair and scoring are already committed by the server.
export class WordEnergy {
  constructor(){this.matchId=null;this.lastEvent=0;this.effects=[];}
  update(state,time){
    if(state.matchId!==this.matchId){
      this.matchId=state.matchId;this.effects=[];
      this.lastEvent=state.phase==='playing'?Math.max(0,...state.events.map(e=>e.seq)):0;
    }
    if(state.phase!=='playing'||!state.defense?.enabled){this.effects=[];return;}
    for(const event of state.events){
      if(event.seq<=this.lastEvent)continue;this.lastEvent=event.seq;
      if(event.type!=='word'||!event.defenseReward||!Number.isFinite(event.at)||state.now-event.at>1800)continue;
      this.effects.push({...event,path:energyPath(event),born:time});
    }
    this.effects=this.effects.slice(-ENERGY_RULES.maxEffects);
  }
  draw(ctx,project,scale,time,reduced=false){
    const {travelMs,staggerMs,rippleMs}=ENERGY_RULES;
    this.effects=this.effects.filter(e=>time-e.born<travelMs+(e.word.length-1)*staggerMs+rippleMs);
    for(const e of this.effects){
      const age=time-e.born,d=e.defenseReward,end=travelMs+(e.word.length-1)*staggerMs;
      ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#b6ff00';ctx.strokeStyle='#00f3ff';
      ctx.font='800 '+Math.max(14,22*scale)+'px ui-monospace,monospace';ctx.shadowColor='#00f3ff';ctx.shadowBlur=reduced?0:10;
      if(!reduced)for(let i=0;i<e.word.length;i++){
        const t=(age-i*staggerMs)/travelMs;if(t<0||t>1)continue;
        const eased=1-(1-t)**2,s=project(wrap(e.path.x+e.path.dx*eased,WORLD.width),wrap(e.path.y+e.path.dy*eased,WORLD.height));
        ctx.globalAlpha=.9;ctx.fillText(e.word[i],s.x,s.y);
      }
      if(reduced||age>=end){
        const t=reduced?0:(age-end)/rippleMs,s=project(d.x,d.y);
        ctx.globalAlpha=reduced?.5:(1-t)*.7;ctx.lineWidth=reduced?2:3;
        ctx.beginPath();ctx.arc(s.x,s.y,(d.barrierRadius+(reduced?4:t*30))*scale,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }
}
