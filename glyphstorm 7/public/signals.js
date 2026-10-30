export const SIGNAL_RULES=Object.freeze({cooldownMs:5000,lifetimeMs:6000,maxSignals:24});
export const SIGNAL_TYPES=Object.freeze({NEED_LETTER:'need-letter',DEFEND_EARTH:'defend-earth'});
export function signalText(signal){
  return signal.kind===SIGNAL_TYPES.NEED_LETTER?'Need '+signal.letter:'Defend Earth!';
}
// Recipient filtering happens on the server, before any snapshot leaves the room.
export function visibleSignals(signals,player,mode,now){
  if(player.role!=='player')return [];
  return signals.filter(s=>s.expiresAt>now&&(s.scope==='all'||(mode==='teams'&&s.team===player.team)));
}
