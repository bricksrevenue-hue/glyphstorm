import { RULES } from './rules.js';

// Advice is private, server-validated and valid only for this exact tray.
export function submissionChoice(self,range=null){
  const tray=self?.tray||[],guide=self?.wordGuide;
  if(!guide||guide.trayKey!==tray.map(t=>t.id).join('|'))return {valid:false,message:'Checking your letters…'};
  const start=range?.start??0,end=typeof range==='number'?range:range?.end??tray.length;
  const entry=guide.entries.find(e=>e.start===start&&e.end===end);
  if(entry?.status==='valid')return {...entry,valid:true,tileIds:tray.slice(start,end).map(t=>t.id),keep:[...tray.slice(0,start),...tray.slice(end)].map(t=>t.letter).join('')};
  return {valid:false,message:entry?.status==='used'?'Already used this round — try another word.':
    end-start<RULES.minWord?'Not a word yet · use at least 3 letters':'Not a word yet'};
}

export function pickupExplanation(state,player,now){
  if(!player||player.role!=='player')return '';
  if(player.resetUntil>now)return 'Ship resetting — collection resumes when you return.';
  if(state.self.wordMode)return 'Review open — tap × or press Esc to resume collecting.';
  if(player.protectionUntil>now||player.shieldUntil>now)return 'Temporary protection — collect when the ship shield ends.';
  if(state.self.tray.length>=RULES.trayLimit)return 'Board full — submit a word or discard a letter.';
  return state.self.pickupNotice?.until>now&&state.self.pickupNotice.message.startsWith('Reserved')?state.self.pickupNotice.message:'';
}
