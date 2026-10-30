import { TEAMS } from './rules.js';

export function raceStatus(state,me) {
  const pilots=state.players.filter(p=>p.role==='player'||p.role==='retired');
  const teams=state.settings.mode==='teams',player=pilots.find(p=>p.id===me);
  const entries=teams?[0,1].map(team=>({id:String(team),name:TEAMS[team],score:pilots.filter(p=>p.team===team).reduce((n,p)=>n+p.score,0)}))
    :pilots.map(p=>({id:p.id,name:p.name,score:p.score}));
  entries.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const best=entries[0]?.score||0,leaders=best>0?entries.filter(e=>e.score===best):[];
  const own=player?.role==='player'?entries.find(e=>e.id===(teams?String(player.team):player.id)):null;
  const leading=own&&leaders.some(e=>e.id===own.id);
  let message;
  if(!own)message=best===0?'Who will score first?':leaders.length>1?'Tied for the lead':entries[0].name+' leads';
  else if(!best)message='Score the opening word';
  else if(leading&&leaders.length>1)message='Shared lead · break the tie';
  else if(leading)message='Leading by '+(best-(entries.find(e=>e.id!==own.id)?.score||0))+' points';
  else message=(best-own.score+1)+' points to take the lead';
  return {score:own?.score??best,label:own?(teams?'YOUR TEAM':'YOUR SCORE'):'LEADING SCORE',message,
    leading:Boolean(leading),leaders,leaderKey:leaders.map(e=>e.id).sort().join(','),ownId:own?.id||null};
}

// Presentation only: actual scores and winners always come from the server.
export class MatchFeedback {
  constructor(){this.matchId=null;this.lastEvent=0;this.words=new Set();this.leaderKey=null;this.clockKey=null;}
  reset(state,me,restore=false){
    this.matchId=state.matchId;this.lastEvent=restore?Math.max(0,...state.events.map(e=>e.seq)):0;
    this.words=new Set(restore?(state.self?.history||[]).map(e=>e.word):[]);
    this.leaderKey=restore?raceStatus(state,me).leaderKey:null;this.clockKey=null;
  }
  word(entry){
    if(!entry?.word||this.words.has(entry.word))return null;
    this.words.add(entry.word);
    return {word:entry.word,points:entry.points,bonus:entry.bonus||0,defenseReward:entry.defenseReward||null,title:entry.bonus?'BOUNTY CAPTURED':entry.word.length>=8?'COSMIC WORD':entry.word.length>=6?'STELLAR WORD':entry.points>=25?'BRILLIANT WORD':'WORD SCORED'};
  }
  update(state,me){
    if(this.matchId!==state.matchId)this.reset(state,me);
    const events=[],words=[];
    for(const event of state.events){
      if(event.seq<=this.lastEvent)continue;this.lastEvent=event.seq;
      if(!Number.isFinite(event.at)||state.now-event.at>1800)continue;
      events.push(event);
      if(state.phase==='playing'&&event.type==='word'&&event.playerId===me){const word=this.word(event);if(word)words.push(word);}
    }
    const race=raceStatus(state,me);
    let announcement=null;
    if(state.phase==='playing'&&this.leaderKey!==null&&race.leaderKey&&race.leaderKey!==this.leaderKey){
      announcement=race.leaders.length>1?'NECK AND NECK · TIED LEAD':
        race.leaders[0].id===race.ownId?(state.settings.mode==='teams'?'YOUR TEAM TAKES THE LEAD':'YOU TAKE THE LEAD'):race.leaders[0].name+' TAKES THE LEAD';
    }
    this.leaderKey=race.leaderKey;
    return {events,words,race,announcement};
  }
  clock(phase,seconds){
    const key=phase+':'+seconds,previous=this.clockKey;this.clockKey=key;
    if(key===previous||seconds<=0||!['playing','countdown'].includes(phase))return {tick:false,notice:null};
    const prior=previous?.startsWith(phase+':')?Number(previous.split(':')[1]):null;
    const tick=phase==='countdown'||(seconds<=10&&prior!==null);
    const crossed=prior!==null&&((prior>10&&seconds<=10)||(prior>30&&seconds<=30));
    return {tick,notice:phase==='playing'&&crossed?seconds+' SECONDS · EVERY WORD COUNTS':null};
  }
}
