import { TEAMS } from './rules.js';

export const POWER_UPS=Object.freeze({
  INVULNERABILITY:'INVULNERABILITY',EMP_BLAST:'EMP_BLAST',SLOW_MOTION:'SLOW_MOTION'
});
export const POWER_RULES=Object.freeze({milestone:5,durationMs:8000,frames:480,slowFactor:.4});
export const POWER_INFO=Object.freeze({
  INVULNERABILITY:{name:'VIOLET GUARD',color:'#bd00ff',hint:'Earth takes no breach damage'},
  EMP_BLAST:{name:'EMP BLAST',color:'#b6ff00',hint:'Incoming letters become safe pickups'},
  SLOW_MOTION:{name:'SLOW MOTION',color:'#00f3ff',hint:'Incoming letters move at 40% speed'}
});

// Presentation mirrors. Server-owned room state determines effects and expiry.
export let currentPowerUp = null;
export let powerUpTimer = 0;
export function createPowerUpState(){
  return {currentPowerUp:null,powerUpTimer:0,startedAt:0,endsAt:0,activatedBy:null,
    activatedName:null,comboKey:null,comboWords:{}};
}
export const comboKey=(player,mode)=>mode==='teams'?'team-'+player.team:player.id;
export function activePowerUp(powerUps,now){
  return powerUps&&POWER_INFO[powerUps.currentPowerUp]&&now>=powerUps.startedAt&&now<powerUps.endsAt
    ?powerUps.currentPowerUp:null;
}
export function remainingPowerFrames(powerUps,now){
  return activePowerUp(powerUps,now)?Math.min(POWER_RULES.frames,Math.max(0,Math.ceil((powerUps.endsAt-now)*60/1000))):0;
}
export function syncPowerUpState(powerUps,now){
  currentPowerUp=activePowerUp(powerUps,now);powerUpTimer=remainingPowerFrames(powerUps,now);
}
export const incomingSpeedFactor=(powerUps,now)=>activePowerUp(powerUps,now)===POWER_UPS.SLOW_MOTION?POWER_RULES.slowFactor:1;
export function powerUpStatus(state,me,now){
  const enabled=Boolean(state.defense?.enabled),pilot=state.players.find(p=>p.id===me&&p.role==='player');
  const power=state.powerUps,kind=enabled&&state.phase==='playing'?activePowerUp(power,now):null;
  const words=pilot?(power?.comboWords?.[comboKey(pilot,state.settings.mode)]||0):0;
  const progress=words%POWER_RULES.milestone,info=kind?POWER_INFO[kind]:null;
  const source=power?.comboKey?.startsWith('team-')?TEAMS[Number(power.comboKey.slice(5))]:power?.activatedName;
  return {kind,progress,words,color:info?.color||'#ff2bd6',title:info?.name||'SPELL 5 WORDS',
    timer:kind?((power.endsAt-now)/1000).toFixed(1)+'s':'8-SECOND BONUS',
    combo:pilot?(state.settings.mode==='teams'?'TEAM':'YOUR')+' COMBO '+words+' · '+(POWER_RULES.milestone-progress)+' TO BONUS':'Every 5 valid words earns a power-up',
    hint:info?info.hint:'Invalid or reused words reset the combo',
    source:kind?'Activated by '+source+' · shared Earth effect':'Power-ups help everyone defend Earth'};
}
