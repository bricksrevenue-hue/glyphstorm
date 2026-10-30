import { RULES } from './rules.js';

// One description powers the lobby, launch countdown, HUD and help dialog.
export function missionBriefing(state){
  const defense=state?.defense?.enabled??state?.settings?.defense??true;
  const teams=state?.settings?.mode==='teams',minutes=state?.settings?.minutes??5;
  const winner=teams?'The team with the highest combined word score wins.':'The pilot with the highest word score wins.';
  const powerNote=' Every 5 valid words in a row earns an 8-second Earth power-up. '+(teams?'Teammates share a combo.':'Each pilot builds a separate combo.')+' An invalid or reused word resets that combo. New milestones replace the active effect; Earth’s power-ups benefit everyone.';
  const collect={title:'Collect and arrange letters',text:'Open a crystal with 1 pulse for 1 letter, or an amber asteroid with 3 pulses for 4 letters. Fly into letters, then drag tiles or tap two to swap. Select range chooses its start and end. Discard mistakes. Carry up to 10 letters. Follow the suggested word and cyan NEXT markers, or spell your own word.'};
  return defense?{
    label:'PLANETARY DEFENSE · EVERYONE SHARES ONE EARTH',
    title:'Protect Earth together. Compete with words.',
    intro:'Earth starts with 100 health points (HP). Keep it alive for the full '+minutes+'-minute round. Every pilot protects the same planet, even when playing on opposing teams. Follow the cyan arrow or minimap ring to find Earth.'+powerNote,
    steps:[
      {title:'Stop the pink incoming letters',text:'Collect a pink letter or hit it with 1 pulse before it reaches Earth’s blue shield. A pulse stops its descent so you can collect it later. Every breach costs Earth 5 HP unless Violet Guard is active. Ordinary released letters are harmless to Earth.'},
      collect,
      {title:'Submit words to repair Earth',text:'Submit uses the full tray or your selected contiguous range, in the current arranged order. Press Enter or tap it to score. Each valid new word earns points, repairs 2 HP (up to 100), and grows Earth’s shield by half the word length (up to 25). Use 3–10 letters; each word scores once per pilot.'}
    ],
    win:'SURVIVE: keep Earth above 0 HP until the timer ends. '+winner+' Tied scores share the win.',
    loss:'FAIL: Earth reaches 0 HP → the round ends for everyone with no winner. Only words earn points. Your personal word-review shield does not protect Earth.',
    ribbon:'DEFEND EARTH · COLLECT → SPELL → REPAIR',
    reminder:'Earth at 0 HP = everyone loses. Survive the timer; '+(teams?'highest team word score wins.':'highest word score wins.'),
    launch:'DEFEND EARTH',
    launchHint:'Collect or pulse pink letters. Spell valid words to repair Earth. Zero Earth HP ends the round for everyone.'
  }:{
    label:'CLASSIC WORD ARENA · PLANETARY DEFENSE OFF',
    title:teams?'Outspell the other team.':'Outspell the other pilots.',
    intro:'You have '+minutes+' minutes to earn the highest word score. '+winner+' Tied scores share the win.',
    steps:[collect,
      {title:'Submit your collected word',text:'Submit scores the whole tray or a selected contiguous range; unused tiles stay. Arrange 3–10 letters. Review → Shorter word finds and arranges your longest valid word; Discard last corrects your latest pickup. Each word scores once per pilot.'},
      {title:'Build the highest word score',text:'Rare letters and longer words earn more. Chase the word bounty for bonus points, use Boost to reach letters, and open cyan meteor rocks for 6 letters. Only words earn points.'}
    ],
    win:'WIN: '+winner+' The timer ends this '+minutes+'-minute round.',
    loss:'Planetary defense is off: no Earth damage, incoming-letter waves or repair objective. Watch the score and collect letters for your next word.',
    ribbon:'COLLECT → ARRANGE → SUBMIT → SCORE',
    reminder:(teams?'Highest combined team score':'Highest word score')+' when the timer ends wins. Planetary defense is off.',
    launch:teams?'OUTSPELL THE OTHER TEAM':'OUTSPELL YOUR CREW',
    launchHint:'Pulse rocks for letters. Arrange your collected tiles. Enter or Submit word to score. Highest score wins.'
  };
}

export function missionStatus(state,now){
  const bounty=state.bounty,first=state.startAt+RULES.bountyFirstMs;
  const nextBounty=now<first?first:first+(Math.floor((now-first)/RULES.bountyCycleMs)+1)*RULES.bountyCycleMs;
  const active=bounty&&now>=bounty.startsAt&&now<bounty.expiresAt;
  const used=state.self?.history?.some(entry=>entry.word===bounty?.word);
  const bountyWord=active?bounty.word:'GET READY';
  const bountyHint=active?(bounty.claimedBy?bounty.claimedName+' claimed +'+bounty.bonus:
    used?'Already in your word history':'First to spell: +'+bounty.bonus+' · '+Math.ceil((bounty.expiresAt-now)/1000)+'s'):
    'Next bounty in '+Math.max(0,Math.ceil((nextBounty-now)/1000))+'s';
  const shower=state.shower,meteorActive=shower&&now>=shower.startsAt&&now<shower.endsAt;
  const nextShower=shower?.nextAt??state.startAt+RULES.showerFirstMs;
  const meteorHint=meteorActive?'4 hits → 6 letters · '+Math.max(0,Math.ceil((shower.endsAt-now)/1000))+'s':
    'Next wave in '+Math.max(0,Math.ceil((nextShower-now)/1000))+'s';
  return {bountyWord,bountyHint,bountyActive:Boolean(active&&!bounty.claimedBy),
    meteorActive:Boolean(meteorActive),meteorTitle:meteorActive?'METEOR SHOWER':'METEOR WATCH',meteorHint};
}
