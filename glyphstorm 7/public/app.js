import { Arena, SpaceBackdrop } from './arena.js?v=1.10.0';
import { VALUES, RULES, TEAMS, TEAM_COLORS } from './rules.js';
import { FLEET, shipFor } from './fleet.js';
import { AimControls } from './aim.js';
import { MatchFeedback, raceStatus } from './match-feedback.js';
import { missionStatus, missionBriefing } from './objectives.js';
import { syncDefenseState, earthHealth, barrierThickness, maxBarrierThickness } from './defense.js';
import { POWER_INFO, comboKey, powerUpStatus, syncPowerUpState } from './power-ups.js';
import { submissionChoice, pickupExplanation } from './word-guide.js';
import { PracticeLesson } from './practice.js';
import { CompactHUD } from './compact-hud.js';
import { SIGNAL_TYPES, signalText } from './signals.js';
import { wordRewardLabel } from './word-energy.js';
import {TraySelection,moveTile,FlightTips} from './tray-controls.js';
const $=id=>document.getElementById(id);
const show=(id,on)=>$(id).classList.toggle('hidden',!on);
const storage={get(key,local=false){try{return (local?localStorage:sessionStorage).getItem(key);}catch{return null;}},
  set(key,value,local=false){try{(local?localStorage:sessionStorage).setItem(key,value);}catch{}},
  remove(key){try{sessionStorage.removeItem(key);}catch{}}};
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
let state=null,me=null,token=storage.get('glyphstorm.session'),latestSeq=-1;
let movement={x:0,y:0,angle:0,pulse:false},keys=new Set(),inputSeq=0;
const aim=new AimControls();
let lastAimFrame=performance.now();
let touchMove={x:0,y:0};
const traySelection=new TraySelection();
let discardMode=false,submitting=false,view='home',toastTimer,arranging=false,draggingTile=null;
let longPressTimer=null,gestureStamp=0,revealedTile=null;
const flightTips=new FlightTips(storage.get('glyphstorm.guided-tray.v1',true)==='done',()=>storage.set('glyphstorm.guided-tray.v1','done',true));
let wordFeed=[];
let lobbySignature='',traySignature='',resultSignature='',followSignature='';
let collectionMatch=null,collectionTileIds=new Set();
let discardingTile=false,practiceSeen=false;
const practice=new PracticeLesson(()=>storage.set('glyphstorm.practice.v1','complete',true));
$('practiceButton').onclick=()=>{practiceSeen=true;practice.open();};
let choosingShip=false,boosting=false,briefingSignature='';
const shipButtons=new Map();
let matchSeen=null,offset=0,lastUI=0,audioContext=null;
const feedback=new MatchFeedback(),soundTimes=new Map();
let wordBurstTimer,announcementTimer,scoreSignature='';
let muted=storage.get('glyphstorm.sound',true)!=='on';
let reduced=storage.get('glyphstorm.motion',true)==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;
const socket=window.io({autoConnect:false,reconnection:true,reconnectionDelay:500,reconnectionDelayMax:3000,timeout:10000});
const backdrop=new SpaceBackdrop($('space'));
const arena=new Arena($('arena'),$('minimap'),()=>movement);
const compactHUD=new CompactHUD();
let signaling=false;
const liveDialogOpen=()=>['helpDialog','telemetryDialog','signalDialog'].some(id=>$(id).open);
for(const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){
  const option=node('option','',letter);option.value=letter;$('signalLetter').append(option);
}
function openLiveDialog(id){resetControls();$(id).showModal();}
$('telemetryButton').onclick=()=>openLiveDialog('telemetryDialog');
for(const id of ['closeTelemetry','resumeTelemetry'])$(id).onclick=()=>$('telemetryDialog').close();
$('closeSignal').onclick=()=>$('signalDialog').close();
$('signalButton').onclick=()=>{
  if(!state||$('signalButton').disabled)return;
  $('signalLetter').value=state.self.wordGuide?.suggestion?.next||'A';
  renderSignals(serverNow());openLiveDialog('signalDialog');
};
for(const id of ['telemetryDialog','signalDialog'])$(id).addEventListener('close',resetControls);
async function sendSignal(kind){
  if(signaling)return;signaling=true;renderSignals(serverNow());
  try{await action('signal',{kind,letter:$('signalLetter').value});$('signalDialog').close();}
  catch(e){toast(e.message);}
  finally{signaling=false;if(state)renderSignals(serverNow());}
}
$('sendLetterSignal').onclick=()=>sendSignal(SIGNAL_TYPES.NEED_LETTER);
$('sendDefendSignal').onclick=()=>sendSignal(SIGNAL_TYPES.DEFEND_EARTH);
function renderSignals(now){
  if(!state)return;
  const pilot=current(),teams=state.settings.mode==='teams',seconds=Math.max(0,Math.ceil(((state.self.signalReadyAt||0)-now)/1000));
  const available=state.phase==='playing'&&pilot?.role==='player'&&socket.connected&&!pilot.resetUntil;
  const disabled=!available||signaling||seconds>0;
  show('signalButton',pilot?.role==='player'&&(teams||state.defense?.enabled));
  $('signalButton').disabled=!available;
  $('signalScope').textContent=teams?'Only your teammates see these signals.':'Earth defense signals are shared with every pilot.';
  show('letterSignalControls',teams);show('sendDefendSignal',Boolean(state.defense?.enabled));
  $('sendLetterSignal').disabled=disabled||!teams;
  $('sendDefendSignal').disabled=disabled||!state.defense?.enabled;
  const cooldown=seconds?'Ready in '+seconds+'s':signaling?'Sending…':'Ready to signal';
  if($('signalCooldown').textContent!==cooldown)$('signalCooldown').textContent=cooldown;
  const text=(state.self.signals||[]).filter(s=>s.expiresAt>now).slice(-2).map(s=>s.name+': '+signalText(s)).join('\n');
  if($('signalFeed').textContent!==text)$('signalFeed').textContent=text;
}
for(const ship of FLEET){
  const button=node('button','ship-option');button.type='button';
  button.style.setProperty('--ship-color',ship.color);
  button.setAttribute('aria-label',ship.name+' · '+ship.description);
  button.setAttribute('aria-pressed','false');
  const image=node('img','ship-preview');image.src=ship.src;image.alt='';image.decoding='async';image.draggable=false;
  image.onerror=()=>image.classList.add('art-unavailable');
  const check=node('span','ship-selected','✓');check.setAttribute('aria-hidden','true');
  button.append(image,node('strong','',ship.name),check);
  button.onclick=()=>chooseShip(ship.id);
  shipButtons.set(ship.id,button);$('shipChoices').append(button);
}
arena.ships.ready.then(loaded=>{
  if(loaded.some(ok=>!ok))toast('Some ship artwork could not load. Basic ships will appear until you reload.');
});
arena.rocks.ready.then(ok=>{if(!ok)toast('Asteroid textures could not load. Basic rocks will appear until you reload.');});
function preferences(){
  document.body.classList.toggle('reduced',reduced);arena.reduced=reduced;backdrop.reduced=reduced;
  $('soundButton').querySelector('span').textContent=muted?'Off':'On';
  $('soundButton').setAttribute('aria-label',muted?'Enable sound':'Mute sound');
  $('soundButton').title=muted?'Enable arcade sound':'Mute arcade sound';
  $('motionButton').setAttribute('aria-label',reduced?'Enable full motion':'Enable reduced motion');
  $('motionButton').style.color=reduced?'var(--mint)':'';
}
preferences();
function sound(kind){
  if(muted||document.hidden)return;
  const now=performance.now(),gap=kind==='pickup'?45:kind==='open'?110:40;
  if(now-(soundTimes.get(kind)??-Infinity)<gap)return;soundTimes.set(kind,now);
  try{
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
    const tones={word:[523,659,784,1046],longWord:[392,523,659,784,1046],pickup:[660+(state?.self.tray.length||0)*25],open:[240,480],asteroidCharge:[196,294],asteroidOpen:[262,392,523,784],boost:[147,220,440],shower:[196,294,392],bounty:[523,784,1046,1318],start:[330,440,660,880],tick:[440],lead:[659,880],reset:[330,220],barrierImpact:[147,110],intercept:[330,660],powerUp:[220,440,660,880],emp:[110,220,440],barrierBlock:[440,880]}[kind]||[240];
    tones.forEach((f,i)=>{
      const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime+i*.08;
      osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(['tick','open'].includes(kind)?.025:.045,t+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,t+.18);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.2);
    });
  }catch{}
}
function toast(message){$('toast').textContent=message;show('toast',true);clearTimeout(toastTimer);toastTimer=setTimeout(()=>show('toast',false),4000);}
function clearArcade(){
  clearTimeout(wordBurstTimer);clearTimeout(announcementTimer);
  show('wordBurst',false);show('arenaAnnouncement',false);
  $('arenaWrap').classList.remove('final-push');
}
function celebrateWord(moment){
  if(!moment||view!=='game')return;
  $('burstTitle').textContent=moment.title;$('burstWord').textContent=moment.word;$('burstPoints').textContent='+'+moment.points+' POINTS'+(moment.bonus?' · INCLUDES +'+moment.bonus+' BOUNTY':'');
  $('burstRepair').textContent=wordRewardLabel(moment.defenseReward);
  flightTips.action('submit');
  const banner=$('wordBurst');banner.classList.remove('pop');show('wordBurst',true);
  void banner.offsetWidth;banner.classList.add('pop');
  clearTimeout(wordBurstTimer);wordBurstTimer=setTimeout(()=>show('wordBurst',false),1900);
  sound(moment.bonus?'bounty':moment.word.length>=6?'longWord':'word');
}
function announce(message){
  if(!message||view!=='game')return;
  $('arenaAnnouncement').textContent=message;show('arenaAnnouncement',true);
  clearTimeout(announcementTimer);announcementTimer=setTimeout(()=>show('arenaAnnouncement',false),2400);
}
function connection(online,label){$('connection').classList.toggle('offline',!online);$('connection').lastChild.textContent=label;}
function setView(next){
  if(next===view)return;
  view=next;for(const id of ['home','lobby','game','results'])show(id,id===next);
  backdrop.active=next!=='game';document.body.classList.toggle('in-game',next==='game');
  compactHUD.setActive(next==='game');
  if(next!=='game')for(const id of ['telemetryDialog','signalDialog'])if($(id).open)$(id).close();
  if(next!=='game'){resetControls();clearArcade();}
  if(next==='lobby'){lobbySignature='';traySelection.useAll();}
  if(next==='home')renderBriefing();
  window.scrollTo(0,0);
}
function resetControls(){keys.clear();touchMove={x:0,y:0};movement.x=0;movement.y=0;movement.pulse=false;aim.hold(movement.angle);}
function current(){return state?.players.find(p=>p.id===me);}
function serverNow(){return Date.now()+offset;}
function updateState(next){
  if(next.matchId===state?.matchId && next.seq<latestSeq)return;
  latestSeq=next.seq;offset=next.now-Date.now();
  if(matchSeen!==next.matchId){matchSeen=next.matchId;traySelection.useAll();wordFeed=[];inputSeq=0;discardMode=false;resultSignature='';scoreSignature='';clearArcade();}
  state=next;syncDefenseState(state.defense);renderBriefing();
  traySelection.sync(state.self.tray);
  const cues=feedback.update(state,me);
  arena.update(state,me);
  if(state.phase==='lobby'){setView('lobby');renderLobby();}
  else if(state.phase==='results'){setView('results');renderResults();}
  else{setView('game');renderGame();}
  if(state.phase==='playing'){
    for(const e of cues.events){
      if(e.type==='pickup'&&e.playerId===me)flightTips.action('collect');
      if(e.type==='word'){wordFeed.push(e);wordFeed=wordFeed.slice(-3);}
      if(e.type==='vowelGift'&&e.playerId===me)announce('RECOVERY VOWEL · '+e.letter);
      if(e.type==='shieldRecharge'&&e.playerId===me)announce('WORD SHIELD RECHARGED');
      if(e.playerId===me&&['pickup','open','reset','asteroidCharge','asteroidOpen','boost','intercept'].includes(e.type))sound(e.type);
      if(e.playerId===me&&e.type==='asteroidOpen')announce((e.kind==='meteor'?'METEOR':'ASTEROID')+' OPEN · '+e.count+' LETTERS');
      if(e.type==='showerStart'){announce('METEOR SHOWER · SIX-LETTER ROCKS');sound('shower');}
      if(e.type==='showerEnd')announce('METEOR SHOWER COMPLETE');
      if(e.type==='bountyStart')announce('WORD BOUNTY · '+e.word+' · +'+e.bonus);
      if(e.type==='bountyClaim'&&e.playerId!==me)announce(e.name+' CLAIMED '+e.word+' · +'+e.bonus);
      if(e.type==='powerUpStart'){announce(POWER_INFO[e.kind].name+' · 8 SECONDS · SHARED EARTH');sound('powerUp');}
      if(e.type==='empPulse')sound('emp');
      if(e.type==='barrierBlock')sound('barrierBlock');
      if(e.type==='comboBreak'&&current()?.role==='player'&&e.comboKey===comboKey(current(),state.settings.mode))announce('COMBO RESET · SPELL 5 VALID WORDS');
      if(e.type==='defenseStart')announce('DEFEND EARTH · COLLECT OR PULSE PINK LETTERS');
      if(e.type==='barrierImpact'){sound('barrierImpact');if(e.earthHealth<=25)announce('EARTH CRITICAL · SPELL TO REPAIR');}
      if(e.type==='start')sound('start');
    }
    for(const word of cues.words)celebrateWord(word);
    if(cues.announcement){announce(cues.announcement);if(cues.race.leading)sound('lead');}
  }
}
function acceptJoin(result){
  me=result.playerId;token=result.token;storage.set('glyphstorm.session',token);
  lobbySignature='';
  inputSeq=0;latestSeq=-1;traySelection.useAll();matchSeen=null;resetControls();
  feedback.reset(result.state,me,true);
  movement.angle=result.state.players.find(p=>p.id===me)?.angle||0;aim.hold(movement.angle);
  updateState(result.state);
  const url=new URL(location.href);url.searchParams.set('room',result.code);history.replaceState(null,'',url);
  $('homeError').textContent='';show('connectionOverlay',false);
}
function emitAck(event,data,timeout=5000){
  return new Promise((resolve,reject)=>socket.timeout(timeout).emit(event,data,(error,result)=>{
    if(error)return reject(new Error('The connection is slow. Please try again.'));
    if(!result?.ok)return reject(new Error(result?.error||'Please try again.'));
    resolve(result);
  }));
}
async function join(create,skipPractice=false){
  if(!socket.connected){$('homeError').textContent='Connecting to the game server. Please try again in a moment.';return;}
  const name=$('pilotName').value.trim();if(name.length<2){$('homeError').textContent='Enter a pilot name with at least 2 characters.';$('pilotName').focus();return;}
  if(!skipPractice&&!practiceSeen&&storage.get('glyphstorm.practice.v1',true)!=='complete'){
    practiceSeen=true;practice.open(()=>join(create,true));return;
  }
  $('createButton').disabled=$('joinButton').disabled=true;$('homeError').textContent='';
  try{const result=await emitAck('join',{create,name,code:$('roomCode').value});storage.set('glyphstorm.name',name,true);acceptJoin(result);}
  catch(e){$('homeError').textContent=e.message;}
  finally{$('createButton').disabled=$('joinButton').disabled=false;}
}
async function action(type,payload={}){
  if(!state||!socket.connected)throw new Error('Reconnect before taking an action.');
  const request={requestId:crypto.randomUUID(),type,payload,matchId:state.matchId};
  let result;
  try{result=await emitAck('action',request,3500);}
  catch(e){
    if(!socket.connected || !e.message.startsWith('The connection is slow'))throw e;
    result=await emitAck('action',request,3500);
  }
  if(result.self && state?.matchId===request.matchId)state.self=result.self;
  return result;
}
const act=(type,payload)=>action(type,payload).catch(e=>toast(e.message));
socket.on('connect',async()=>{
  connection(true,'Online');$('createButton').disabled=$('joinButton').disabled=false;
  if(token){
    try{acceptJoin(await emitAck('resume',{token}));toast('Back in your orbit.');}
    catch(e){token=null;storage.remove('glyphstorm.session');state=null;me=null;setView('home');$('homeError').textContent=e.message;show('connectionOverlay',false);}
  }
});
socket.on('disconnect',()=>{
  connection(false,'Reconnecting');resetControls();
  if(state&&view==='lobby')renderLobby();
  if(state){show('connectionOverlay',true);toast('Connection lost. Trying to rejoin your room…');}
});
socket.on('connect_error',()=>{connection(false,'Offline');if(!state)$('homeError').textContent='The game server is not available yet. Waiting to reconnect…';});
socket.on('state',updateState);
socket.on('shutdown',data=>{toast(data.message);token=null;storage.remove('glyphstorm.session');});
socket.connect();
$('pilotName').value=storage.get('glyphstorm.name',true)||'';
$('roomCode').value=new URLSearchParams(location.search).get('room')?.slice(0,6)||'';
$('roomCode').addEventListener('input',()=>{$('roomCode').value=$('roomCode').value.toUpperCase().replace(/[^A-Z2-9]/g,'');});
$('createButton').onclick=()=>join(true);$('joinButton').onclick=()=>join(false);
$('roomCode').addEventListener('keydown',e=>{if(e.key==='Enter')join(false);});
$('pilotName').addEventListener('keydown',e=>{if(e.key==='Enter')join(Boolean(!$('roomCode').value));});
async function leave(){
  if(socket.connected)try{await emitAck('leave',{});}catch{}
  state=null;me=null;token=null;storage.remove('glyphstorm.session');traySelection.useAll();resetControls();setView('home');
  const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);$('homeError').textContent='';
}
document.querySelectorAll('.leave-button').forEach(button=>button.onclick=leave);
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied. Send it to your crew.');}catch{toast('Copy this: '+text);}}
$('copyCode').onclick=()=>copy(state.code);
$('copyLink').onclick=()=>{const url=new URL(location.href);url.searchParams.set('room',state.code);copy(url.href);};
$('readyButton').onclick=()=>act('ready',{ready:!current()?.ready});
$('claimButton').onclick=()=>act('claim');
$('startButton').onclick=()=>act('start');
$('team0').onclick=()=>act('team',{team:0});$('team1').onclick=()=>act('team',{team:1});
$('rematchButton').onclick=()=>act('lobby');
for(const id of ['modeSelect','durationSelect','disruptionToggle','defenseToggle'])$(id).onchange=()=>act('settings',{
  mode:$('modeSelect').value,minutes:Number($('durationSelect').value),disruption:$('disruptionToggle').checked,defense:$('defenseToggle').checked
});
function renderBriefing(){
  const mission=missionBriefing(state),signature=JSON.stringify([mission,Boolean(state)]);
  if(signature===briefingSignature)return;briefingSignature=signature;
  for(const prefix of ['brief','helpMission']){
    $(prefix+'Label').textContent=state?mission.label:'DEFAULT MISSION · YOUR HOST CAN CHANGE THE RULES';
    $(prefix+'Title').textContent=mission.title;$(prefix+'Intro').textContent=mission.intro;
    const steps=mission.steps.map(step=>{const li=node('li');li.append(node('strong','',step.title),node('p','',step.text));return li;});
    $(prefix+'Steps').replaceChildren(...steps);
    $(prefix+'Win').textContent=mission.win;$(prefix+'Loss').textContent=mission.loss;
  }
  $('missionGoal').textContent=mission.ribbon;$('missionReminder').textContent=mission.reminder;
  $('arena').setAttribute('aria-describedby','missionGoal missionReminder');
}
function openMission(){resetControls();renderBriefing();$('helpDialog').showModal();$('helpDialog').scrollTop=0;}
$('helpButton').onclick=openMission;$('missionButton').onclick=openMission;
renderBriefing();
$('closeHelp').onclick=()=>$('helpDialog').close();
$('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog')){const r=$('helpDialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('helpDialog').close();}});
$('soundButton').onclick=()=>{muted=!muted;storage.set('glyphstorm.sound',muted?'off':'on',true);preferences();sound('pickup');};
$('motionButton').onclick=()=>{reduced=!reduced;storage.set('glyphstorm.motion',reduced?'reduced':'full',true);preferences();};
function renderLobby(){
  const p=current(),active=state.players.filter(p=>p.role==='player'),host=state.hostId===me;
  const signature=JSON.stringify({host:state.hostId,settings:state.settings,online:socket.connected,choosingShip,players:state.players.map(p=>[p.id,p.name,p.shipId,p.role,p.team,p.connected,p.ready])});
  if(signature===lobbySignature)return;lobbySignature=signature;
  $('lobbyCode').textContent=state.code;$('playerCount').textContent=active.length+' / 8 PILOTS';
  $('roster').replaceChildren();
  for(const pilot of active){
    const ship=shipFor(pilot.shipId);
    const row=node('div','pilot-row'),avatar=node('div','pilot-avatar ship-avatar');avatar.style.color=pilot.color;
    const image=node('img','');image.src=ship.src;image.alt='';image.decoding='async';image.draggable=false;
    image.onerror=()=>{avatar.textContent=pilot.name.slice(0,1).toUpperCase();};avatar.append(image);
    const info=node('div','pilot-info',pilot.name+(pilot.id===me?' (you)':''));
    const description=[ship.name,pilot.id===state.hostId?'Host':'',state.settings.mode==='teams'?TEAMS[pilot.team]:'',!pilot.connected?'Reconnecting':''].filter(Boolean).join(' · ');
    info.append(node('small','',description||'Word pilot'));
    row.append(avatar,info,node('span',pilot.ready?'ready-tag':'waiting-tag',pilot.ready?'READY ✓':'WAITING'));$('roster').append(row);
  }
  if(active.length<2)$('roster').append(node('div','empty-seat','＋ Invite a friend to launch your first round'));
  const spectators=state.players.filter(p=>p.role==='spectator');
  $('spectatorList').textContent=spectators.length?'Watching: '+spectators.map(p=>p.name).join(', '):'';
  $('modeSelect').value=state.settings.mode;$('durationSelect').value=String(state.settings.minutes);$('disruptionToggle').checked=state.settings.disruption;$('defenseToggle').checked=state.settings.defense;
  for(const id of ['modeSelect','durationSelect','disruptionToggle','defenseToggle'])$(id).disabled=!host;
  $('hostBadge').textContent=host?'YOUR CONTROLS':'HOST CONTROLS';
  show('readyButton',p?.role==='player');show('claimButton',p?.role==='spectator');show('startButton',host);
  $('readyButton').textContent=p?.ready?'Ready ✓ · click to undo':'Ready up ✓';
  $('readyButton').disabled=choosingShip||!socket.connected;
  show('shipPicker',p?.role==='player');
  const selected=shipFor(p?.shipId);
  $('selectedShipName').textContent=choosingShip?'Saving…':selected.name;
  $('pilotMarker').style.color=p?.color||'#70f7d1';
  for(const [id,button] of shipButtons){
    button.setAttribute('aria-pressed',String(id===selected.id));
    button.disabled=choosingShip||!socket.connected||p?.role!=='player';
  }
  show('teamActions',state.settings.mode==='teams'&&p?.role==='player');
  for(let i=0;i<2;i++)$('team'+i).style.borderColor=p?.team===i?TEAM_COLORS[i]:'';
  const balanced=state.settings.mode!=='teams'||active.filter(p=>p.team===0).length===active.filter(p=>p.team===1).length;
  const allReady=active.length>=2&&active.every(p=>p.ready&&p.connected)&&balanced;
  $('startButton').disabled=!allReady||choosingShip||!socket.connected;
  $('claimButton').disabled=active.length>=8;
  $('lobbyHint').textContent=active.length<2?'Share the room code or invite link. You need at least two pilots.':
    !balanced?'Balance the two teams before launching.':allReady?(host?'Your crew is ready. Launch when you are.':'Your crew is ready. Waiting for the host to launch.'):'Every pilot needs to ready up.';
}
async function chooseShip(shipId){
  const pilot=current();
  if(choosingShip||state?.phase!=='lobby'||pilot?.role!=='player'||pilot.shipId===shipId)return;
  const playerId=pilot.id;
  choosingShip=true;renderLobby();
  try{
    const result=await action('ship',{shipId});
    const currentPilot=current();
    if(currentPilot?.id===playerId&&state.phase==='lobby'){
      currentPilot.shipId=result.self.shipId;currentPilot.ready=result.self.ready;
      toast(shipFor(result.self.shipId).name+' selected. Ready up when you are.');
    }
  }catch(e){toast(e.message);}
  finally{choosingShip=false;lobbySignature='';if(state&&view==='lobby')renderLobby();}
}
function renderScores(){
  const pilots=state.players.filter(p=>p.role==='player'||p.role==='retired').sort((a,b)=>b.score-a.score);
  const race=raceStatus(state,me);
  for(const [id,text] of [['raceNumber',String(race.score)],['raceLabel',race.label],['raceGap',race.message]])if($(id).textContent!==text)$(id).textContent=text;
  $('raceStatus').classList.toggle('leading',race.leading);
  const signature=JSON.stringify([state.settings.mode,me,pilots.map(p=>[p.id,p.name,p.team,p.color,p.score,p.connected])]);
  if(signature===scoreSignature)return;scoreSignature=signature;
  const fragment=document.createDocumentFragment();
  if(state.settings.mode==='teams'){
    for(let i=0;i<2;i++){
      const total=pilots.filter(p=>p.team===i).reduce((n,p)=>n+p.score,0),row=node('div','team-total',TEAMS[i]+'  '+total+' pts');
      row.style.color=TEAM_COLORS[i];fragment.append(row);
    }
  }
  for(const p of pilots){const row=node('div','score-row'+(p.id===me?' me':'')+(race.leaders.some(e=>e.id===(state.settings.mode==='teams'?String(p.team):p.id))?' front-runner':''));row.style.borderLeftColor=p.color;
    row.append(node('span','',p.name+(p.connected?'':' · away')),node('b','',String(p.score)));fragment.append(row);}
  $('scoreboard').replaceChildren(fragment);
}
function renderGame(){
  const p=current(),spectating=p?.role!=='player';
  $('game').classList.toggle('is-spectator',spectating);$('game').classList.toggle('has-defense',Boolean(state.defense?.enabled));
  show('spectatorBar',spectating);show('trayDock',!spectating);
  $('gameMode').textContent=(state.settings.mode==='teams'?'TEAM ORBIT':'FREE-FOR-ALL')+(state.settings.disruption?' · DISRUPTION ON':'');
  $('gameRoom').textContent='ROOM '+state.code;
  renderScores();renderTray();
  const sig=state.players.filter(p=>p.role==='player').map(p=>p.id).join(',');
  if(sig!==followSignature){
    followSignature=sig;$('followSelect').replaceChildren();
    for(const pilot of state.players.filter(p=>p.role==='player')){const option=node('option','',pilot.name);option.value=pilot.id;$('followSelect').append(option);}
    if(!state.players.some(p=>p.id===arena.follow&&p.role==='player'))arena.follow=null;
  }
  arena.follow=spectating?($('followSelect').value||null):null;
  const building=Boolean(state.self.wordMode)&&!spectating&&state.phase==='playing'&&!p?.resetUntil;
  show('wordPanel',building);

  const choice=submissionChoice(state.self,traySelection.range(state.self.tray));
  $('game').classList.toggle('reviewing',building);
  $('buildButton').disabled=state.phase!=='playing'||Boolean(p?.resetUntil)||!choice.valid||submitting||discardingTile||arranging;
  $('buildButton').textContent=submitting?'Checking…':choice.valid?'Submit '+choice.word+(choice.keep?' · keep '+choice.keep:''):'Submit word';
  $('reviewButton').disabled=state.phase!=='playing'||Boolean(p?.resetUntil)||building||submitting;
  $('discardButton').disabled=state.phase!=='playing'||Boolean(p?.resetUntil)||!state.self.tray.length||submitting;
  $('discardLastButton').disabled=state.phase!=='playing'||Boolean(p?.resetUntil)||!state.self.tray.length||submitting||discardingTile||arranging;
  $('discardButton').textContent=discardMode?'Cancel discard':'Choose a letter to discard';
  if(building)renderWord();
  renderMissions(serverNow());renderDefense(serverNow());renderPowerUp(serverNow());
  renderSignals(serverNow());
}
function renderDefense(now){
  const d=state.defense;show('defenseStatus',d?.enabled);
  if(!d?.enabled)return;
  const hp=$('earthMeter');hp.value=earthHealth;hp.setAttribute('aria-valuetext',earthHealth+' of 100 integrity');
  $('earthHealth').textContent=earthHealth+' / 100';
  $('barrierLevel').textContent=barrierThickness.toFixed(1)+' / '+maxBarrierThickness;
  const incoming=state.letters.filter(l=>l.incoming).length;
  $('defenseHint').textContent=incoming+' incoming · wave '+(d.wave+1)+' in '+Math.max(0,Math.ceil((d.nextWaveAt-now)/1000))+'s';
  $('defenseStatus').classList.toggle('critical',earthHealth<=25);
  const age=now-(d.lastImpactAt||-Infinity);$('defenseStatus').classList.toggle('impact-warning',age>=0&&age<450);
}
function renderPowerUp(now){
  show('powerUpCard',Boolean(state.defense?.enabled));
  if(!state.defense?.enabled)return;
  const power=powerUpStatus(state,me,now);
  $('comboMeter').value=power.progress;$('comboMeter').setAttribute('aria-valuetext',power.progress+' of 5 words toward the next power-up');
  $('comboLabel').textContent=(state.settings.mode==='teams'?'TEAM ':'')+power.progress+' / 5 words';
  const labels={powerUpName:power.title,powerUpTimer:power.timer,powerUpCombo:power.combo,powerUpHint:power.hint};
  for(const [id,text]of Object.entries(labels))if($(id).textContent!==text)$(id).textContent=text;
  $('powerUpCard').classList.toggle('active',Boolean(power.kind));
  $('powerUpCard').style.setProperty('--power-color',power.color);
  $('powerUpCard').title=power.source+'. '+power.hint;
}
function renderMissions(now){
  const m=missionStatus(state,now),p=current(),cooldown=Math.max(0,(state.self.boostReadyAt||0)-now);
  const labels={bountyWord:m.bountyWord,bountyHint:m.bountyHint,meteorTitle:m.meteorTitle,meteorHint:m.meteorHint,
    boostLabel:state.self.boostUntil>now?'BOOSTING':cooldown>0?(cooldown/1000).toFixed(1)+'s':'READY · SHIFT'};
  for(const [id,value] of Object.entries(labels))if($(id).textContent!==value)$(id).textContent=value;
  $('bountyCard').classList.toggle('active',m.bountyActive);$('meteorCard').classList.toggle('active',m.meteorActive);
  $('bountyHint').title=m.bountyHint;
  show('boostButton',p?.role==='player');
  $('boostButton').disabled=boosting||state.phase!=='playing'||!socket.connected||p?.role!=='player'||Boolean(p?.resetUntil)||
    state.self.wordMode||p?.protectionUntil>now||cooldown>0;
  $('boostButton').style.setProperty('--charge',Math.max(0,Math.min(1,1-cooldown/RULES.boostCooldownMs))*100+'%');
  $('boostButton').setAttribute('aria-label',cooldown>0?'Boost recharging: '+Math.ceil(cooldown/1000)+' seconds':'Boost in movement direction, or forward when stationary. Shortcut: Shift.');
}
async function boost(){
  if(boosting||!state||view!=='game'||$('boostButton').disabled||liveDialogOpen())return;
  boosting=true;updateMovement();
  try{await action('boost',{x:movement.x,y:movement.y});}
  catch(e){toast(e.message);}
  finally{boosting=false;if(state&&view==='game')renderMissions(serverNow());}
}
$('boostButton').onclick=boost;
function selectedRange(){return traySelection.range(state?.self.tray||[]);}
function inlineWordError(message=''){
  $('wordError').textContent=message;
  $('trayError').textContent=state?.self.wordMode?'':message;
}
function renderTray(){
  if(draggingTile)return;
  const tray=state.self.tray,p=current(),guide=state.self.wordGuide;
  const sig=JSON.stringify([state.matchId,me,tray,selectedRange(),traySelection.first,traySelection.focus,traySelection.mode,discardMode,state.self.wordMode,guide?.trayKey,revealedTile]);
  if(sig===traySignature){renderCollectionHint();return;}traySignature=sig;
  const boardKey=state.matchId+':'+me,sameBoard=collectionMatch===boardKey;
  const range=selectedRange()||{start:0,end:tray.length},choice=submissionChoice(state.self,selectedRange());
  const selected=tray.slice(Math.max(0,range.start),Math.max(0,range.end));
  const word=selected.map(t=>t.letter).join(''),remaining=[...tray.slice(0,Math.max(0,range.start)),...tray.slice(Math.max(0,range.end))].map(t=>t.letter).join('');
  const full=tray.length===RULES.trayLimit;
  $('trayCount').textContent=tray.length+' / '+RULES.trayLimit;
  $('trayCount').setAttribute('aria-label',tray.length+' of '+RULES.trayLimit+' letters collected');
  $('trayDock').classList.toggle('is-full',full);$('trayDock').classList.toggle('is-discarding',discardMode);
  $('collectionLabel').textContent=traySelection.start?'SELECTED RANGE':'ALL TRAY TILES';
  $('collectionWord').textContent=word||'Fly into letters to begin';$('collectionWord').classList.toggle('is-empty',!word);
  $('collectionRemainder').textContent=remaining?'KEEP '+remaining:'';show('collectionRemainder',Boolean(remaining));
  $('collectionStatus').textContent=choice.valid?'Valid · '+choice.points+' points'+(choice.multiplier===2?' · ★ ×2':''):choice.message;
  $('collectionStatus').classList.toggle('valid',choice.valid);
  $('rangeButton').setAttribute('aria-pressed',String(traySelection.mode==='range'));
  $('swapButton').setAttribute('aria-pressed',String(traySelection.mode==='swap'));
  const announcement=tray.length+' of '+RULES.trayLimit+' letters collected'+(tray.length?': '+tray.map(tile=>tile.letter).join(', '):'. Fly into letters to start.');
  if($('collectionAnnouncement').textContent!==announcement)$('collectionAnnouncement').textContent=announcement;
  const focusedTile=$('tray').contains(document.activeElement)?document.activeElement?.dataset.tileId:null;
  clearTimeout(longPressTimer);$('tray').replaceChildren();
  for(let i=0;i<RULES.trayLimit;i++){
    const tile=tray[i],next=!tile&&i===tray.length,newPickup=tile&&sameBoard&&!collectionTileIds.has(tile.id);
    const isSelected=tile&&traySelection.start&&i>=range.start&&i<range.end;
    const wrap=node('div','tile'+(!tile?' empty':'')+(next?' next-slot':'')+(isSelected?' selected':'')+(discardMode&&tile?' discarding':'')+(newPickup?' just-collected':'')+(tile?.gift?' gifted':'')+(tile&&guide?.leastUseful?.includes(tile.id)&&(full||(!guide.possibleCount&&tray.length>=6))?' low-utility':'')+(tile&&traySelection.first===tile.id?' swap-source':''));
    if(tile&&revealedTile===tile.id)wrap.classList.add('show-remove');
    const button=tile?node('button','tile-select'):wrap;if(tile){button.type='button';button.dataset.tileId=tile.id;button.draggable=true;}
    button.setAttribute('aria-label',tile?'Tile '+(i+1)+': '+tile.letter+(tile.doubleScore?', double word star':'')+(discardMode?'. Discard':traySelection.mode==='range'?'. Select range endpoint':'. Tap two tiles to swap, or drag to reorder'):'Empty slot '+(i+1));
    button.append(node('span','tile-order',String(i+1).padStart(2,'0')),node('span','tile-letter',tile?.letter||'+'));
    if(tile){
      button.append(node('small','tile-value',String(VALUES[tile.letter])+(tile.doubleScore?' ★':'')));wrap.append(button);
      button.onclick=()=>{if(performance.now()-gestureStamp<350)return;selectTile(tile.id);};
      button.ondragstart=e=>{if(arranging||submitting){e.preventDefault();return;}clearTimeout(longPressTimer);draggingTile=tile.id;e.dataTransfer.setData('text/plain',tile.id);e.dataTransfer.effectAllowed='move';};
      wrap.ondragover=e=>{if(draggingTile)e.preventDefault();};
      wrap.ondrop=e=>{e.preventDefault();const from=draggingTile;draggingTile=null;gestureStamp=performance.now();if(from)arrangeTiles(moveTile(state.self.tray.map(t=>t.id),from,tile.id));};
      button.ondragend=()=>{draggingTile=null;gestureStamp=performance.now();traySignature='';renderTray();};
      button.onpointerdown=e=>{if(e.pointerType!=='touch')return;clearTimeout(longPressTimer);longPressTimer=setTimeout(()=>{revealedTile=tile.id;wrap.classList.add('show-remove');traySelection.focus=tile.id;gestureStamp=performance.now();},500);};
      button.onpointermove=()=>clearTimeout(longPressTimer);
      button.onpointerup=()=>{clearTimeout(longPressTimer);if(wrap.classList.contains('show-remove'))gestureStamp=performance.now();};
      button.onpointercancel=()=>clearTimeout(longPressTimer);
      button.oncontextmenu=e=>e.preventDefault();
      const remove=node('button','tile-remove','×');remove.type='button';remove.setAttribute('aria-label','Discard '+tile.letter+' at position '+(i+1));remove.onclick=e=>{e.stopPropagation();discardTile(tile.id);};wrap.append(remove);
    }else if(next)button.append(node('span','tile-next','NEXT'));
    $('tray').append(wrap);if(tile&&focusedTile===tile.id)button.focus({preventScroll:true});
  }
  collectionMatch=boardKey;collectionTileIds=new Set(tray.map(tile=>tile.id));
  $('lastWord').textContent=p?.lastWord?'LAST WORD: '+p.lastWord.word+' +'+p.lastWord.points:'';
  renderCollectionHint();
}
function renderCollectionHint(){
  const notice=pickupExplanation(state,current(),serverNow()),guide=state.self.wordGuide,full=state.self.tray.length===RULES.trayLimit;
  const stuck=(full||state.self.tray.length>=6)&&guide?.possibleCount===0;
  arena.guideLetter=current()?.role==='player'?guide?.suggestion?.next||null:null;
  let text=state.self.pendingVowel?'Free '+state.self.pendingVowel+' waiting — discard one tile to receive it.':
    stuck?'No words from these letters, discard one or Shuffle.':
    full?'Tray full · '+(guide?.best?'Try '+guide.best.word+' using Review → Shorter word.':'Discard one tile to collect again.'):
    discardMode?'Tap any tile to discard.':traySelection.mode==='range'?'Tap a start tile, then an end tile. Use all clears the range.':
    traySelection.first?'Tap a second tile to swap. Backspace/Delete removes the selected tile.':
    guide?.best?'Available: '+guide.best.word+' · arrange it or use Review → Shorter word.':
    guide?.suggestion?'Try '+guide.suggestion.word+' · next '+guide.suggestion.next+' · drag tiles or tap two to swap.':'Fly into letters. Drag to arrange, or tap two tiles to swap.';
  if(notice&&!notice.startsWith('Board full')&&!notice.startsWith('Review'))text=notice;
  if($('trayHint').textContent!==text)$('trayHint').textContent=text;
  $('trayHint').classList.toggle('pickup-blocked',Boolean(notice)||stuck);
  $('smartDiscardButton').disabled=!guide?.smartDiscard||submitting||arranging||discardingTile||state.phase!=='playing'||Boolean(current()?.resetUntil);
  const tile=state.self.tray.find(t=>t.id===guide?.smartDiscard?.tileId);
  $('smartDiscardButton').textContent='Smart discard'+(tile?' · '+tile.letter:'');
  $('smartDiscardButton').title=guide?.smartDiscard?.reason||'Collect a letter first';
  const seconds=Math.max(0,Math.ceil(((state.self.shuffleReadyAt||0)-serverNow())/1000));
  $('shuffleButton').textContent=seconds?'Shuffle · '+seconds+'s':'Shuffle · R';
  $('shuffleButton').disabled=seconds>0||state.self.tray.length<2||submitting||arranging||state.phase!=='playing'||Boolean(current()?.resetUntil);
  const nudge=guide?.nudge||'';if($('stuckNudge').textContent!==nudge)$('stuckNudge').textContent=nudge;
  if(state.self.tray.some(t=>!t.gift))flightTips.action('collect');
  show('guidedTip',Boolean(flightTips.text)&&current()?.role==='player'&&state.phase==='playing');
  $('guidedTipText').textContent=flightTips.text.replace(' and repair Earth',state.defense?.enabled?' and repair Earth':'');
  const feed=wordFeed.filter(e=>serverNow()-e.at<14000).map(e=>e.name+' spelled '+e.word+' +'+e.points).join('\n');
  if($('wordFeed').textContent!==feed)$('wordFeed').textContent=feed;
}
async function arrangeTiles(tileIds,select=null){
  if(arranging||submitting||discardingTile||state?.phase!=='playing')return;
  arranging=true;inlineWordError();
  try{await action('arrange',{tileIds});revealedTile=null;traySelection.useAll();if(select)traySelection.selectWord(select);flightTips.action('arrange');}
  catch(e){inlineWordError(e.message);}
  finally{arranging=false;traySignature='';if(state&&view==='game')renderGame();}
}
async function discardTile(id,smart=false){
  if(submitting||discardingTile||arranging)return;discardingTile=true;inlineWordError();renderGame();
  try{await action(smart?'smartDiscard':'discard',smart?{}:{tileId:id});discardMode=false;revealedTile=null;traySelection.useAll();}
  catch(e){inlineWordError(e.message);}
  finally{discardingTile=false;if(state&&view==='game'){renderGame();renderWord();}}
}
$('discardLastButton').onclick=()=>{const tile=state?.self.tray.at(-1);if(tile)discardTile(tile.id);};
$('smartDiscardButton').onclick=()=>discardTile(null,true);
$('shuffleButton').onclick=async()=>{
  if($('shuffleButton').disabled)return;arranging=true;inlineWordError();
  try{await action('shuffle');traySelection.useAll();flightTips.action('arrange');}
  catch(e){inlineWordError(e.message);}
  finally{arranging=false;if(state&&view==='game')renderGame();}
};
$('rangeButton').onclick=()=>{traySelection.clear();traySelection.mode='range';discardMode=false;renderGame();};
$('swapButton').onclick=()=>{traySelection.useAll();discardMode=false;renderGame();};
$('dismissTip').onclick=()=>{flightTips.dismiss();show('guidedTip',false);};
async function selectTile(id){
  if(submitting||arranging)return;
  if(discardMode){await discardTile(id);return;}
  inlineWordError();const order=traySelection.tap(id,state.self.tray);
  if(order)await arrangeTiles(order);else renderGame();
}
async function build(){
  if(view!=='game'||state?.phase!=='playing'||current()?.role!=='player')return;
  resetControls();await action('wordMode',{enter:true});discardMode=false;
  inlineWordError();show('wordPanel',true);renderGame();$('trayDock').scrollTop=0;
}
async function closeWord(){
  if(submitting)return;
  try{await action('wordMode',{enter:false});discardMode=false;show('wordPanel',false);renderGame();resetControls();}
  catch(e){inlineWordError(e.message);}
}
function renderWord(){
  if(!state)return;
  const range=selectedRange()||{start:0,end:state.self.tray.length},letters=state.self.tray.slice(Math.max(0,range.start),Math.max(0,range.end)).map(t=>t.letter).join('');
  $('wordLetters').textContent=letters||'Arrange your letters';
  const choice=submissionChoice(state.self,selectedRange()),bounty=state.bounty,bonus=bounty&&!bounty.claimedBy&&bounty.word===letters&&serverNow()<bounty.expiresAt?bounty.bonus:0;
  $('wordScore').textContent=choice.valid?'Valid · '+choice.points+' points'+(choice.multiplier===2?' · ★ ×2':'')+(bonus?' · +20 bounty if available':''):choice.message;
  $('wordScore').classList.toggle('valid',choice.valid);
  show('wordMissionReward',Boolean(state.defense?.enabled));
  $('submitButton').disabled=!choice.valid||submitting||discardingTile||arranging;
  $('backspaceButton').disabled=!state.self.wordGuide?.longest||submitting||arranging;
  $('clearWord').disabled=submitting||arranging;
  const best=state.self.wordGuide?.best;
  $('bestWordHint').textContent=best?'Best word: '+best.word+' · '+best.points+' points':'Best word: none yet — collect or discard a tile';
  $('submitButton').firstChild.textContent=submitting?'Checking…':choice.valid?'Submit '+choice.word+' ':'Submit word ';
}
$('buildButton').onclick=submit;$('reviewButton').onclick=()=>build().catch(e=>inlineWordError(e.message));$('closeWord').onclick=closeWord;
$('discardButton').onclick=()=>{discardMode=!discardMode;traySelection.first=null;renderGame();};
$('backspaceButton').onclick=()=>{
  const offer=state?.self.wordGuide?.longest;if(!offer)return;
  const used=new Set(offer.tileIds);arrangeTiles([...offer.tileIds,...state.self.tray.filter(t=>!used.has(t.id)).map(t=>t.id)],offer.tileIds);
};
$('clearWord').onclick=()=>{traySelection.useAll();renderGame();};
async function submit(){
  if(submitting||arranging||discardingTile||view!=='game'||state?.phase!=='playing'||current()?.role!=='player')return;
  const choice=submissionChoice(state.self,selectedRange());
  if(!choice.valid){inlineWordError(choice.message);return;}
  const tileIds=choice.tileIds,submitMatch=state.matchId,submitPilot=me;
  submitting=true;inlineWordError();renderWord();
  try{
    if(!state.self.wordMode)await build();
    if(state?.matchId!==submitMatch||me!==submitPilot)return;
    const result=await action('submit',{tileIds});
    if(state?.matchId!==submitMatch||me!==submitPilot)return;
    traySelection.useAll();show('wordPanel',false);celebrateWord(feedback.word(result.value));renderTray();
  }
  catch(e){inlineWordError(e.message);}
  finally{submitting=false;renderWord();if(view==='game')renderGame();}
}
$('submitButton').onclick=submit;
function renderResults(){
  const r=state.results;if(!r)return;
  const sig=state.matchId+state.hostId;
  if(sig===resultSignature)return;resultSignature=sig;
  const names=r.mode==='teams'?r.winners.map(t=>TEAMS[t]):r.winners.map(id=>r.ranking.find(p=>p.id===id)?.name||'Pilot');
  $('resultsOutcome').textContent=r.reason==='earth-lost'?'MISSION FAILED · EARTH AT 0 HP':r.defense?'MISSION COMPLETE · EARTH SAVED':'ROUND COMPLETE';
  $('winnerTitle').textContent=r.reason==='earth-lost'?'Earth’s defense was breached.':names.length>1?'A shared constellation.':names[0]+' takes the orbit.';
  $('winnerSubtitle').textContent=r.reason==='earth-lost'?'Planet integrity reached zero. The round ends for everyone; scores are preserved below.':r.defense?'Earth survived with '+r.defense.earthHealth+'% integrity. '+names.join(' & ')+' led the word scores.':names.length>1?names.join(' & ')+' tied for the win.':'Every word counted. Ready for another round?';
  $('resultsMode').textContent=(r.mode==='teams'?'TEAMS':'FREE-FOR-ALL')+' · '+state.settings.minutes+' MIN';
  $('resultsTable').replaceChildren();
  if(r.mode==='teams')for(const t of r.teams){const row=node('div','pilot-row');row.style.color=TEAM_COLORS[t.team];row.append(node('strong','pilot-info',TEAMS[t.team]),node('strong','',t.score+' pts'));$('resultsTable').append(row);}
  r.ranking.forEach((p,i)=>{
    const row=node('div','result-row'),name=node('div','',p.name+(p.id===me?' (you)':''));
    name.append(node('small','',p.words+' word'+(p.words===1?'':'s')));name.style.color=p.color;
    row.append(node('span','result-rank',String(i+1).padStart(2,'0')),name,node('span','result-best',p.best?'Best: '+p.best.word:'No word yet'),node('strong','result-score',String(p.score)));
    $('resultsTable').append(row);
  });
  const history=r.ranking.find(p=>p.id===me)?.history||[];
  $('resultWordCount').textContent=history.length+' WORDS';$('resultWords').replaceChildren();
  if(!history.length)$('resultWords').append(node('p','muted',current()?.role==='spectator'?'Claim a pilot seat in the next lobby to join the fun.':'A fresh tray and a new round are waiting.'));
  for(const entry of history){const chip=node('span','word-chip',entry.word);chip.append(node('b','', '+'+entry.points));$('resultWords').append(chip);}
  show('rematchButton',state.hostId===me);
  $('rematchHint').textContent=state.hostId===me?'Your crew stays in the same room.':'Waiting for the host to return to the lobby.';
}
window.addEventListener('keydown',e=>{
  if(liveDialogOpen())return;
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(view!=='game')return;
  if(e.target.tagName==='BUTTON'&&!e.target.classList.contains('tile-select')&&['Enter',' '].includes(e.key))return;
  if(['Backspace','Delete'].includes(e.key)){e.preventDefault();if(!e.repeat){const id=traySelection.focus||state?.self.tray.at(-1)?.id;if(id)discardTile(id);}return;}
  if(e.code==='KeyR'){e.preventDefault();if(!e.repeat&&!$('shuffleButton').disabled)$('shuffleButton').click();return;}
  if(state?.self.wordMode){
    if(e.key==='Escape'){e.preventDefault();closeWord();}
    else if(e.key==='Enter'){e.preventDefault();if(!e.repeat)submit();}
    return;
  }
  if(e.key==='Enter'){e.preventDefault();if(!e.repeat)submit();return;}
  if(e.code==='Space'){e.preventDefault();if(!e.repeat&&!submitting)build().catch(error=>inlineWordError(error.message));return;}
  if(['ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();if(!e.repeat)boost();return;}
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyQ','KeyE'].includes(e.code)){e.preventDefault();keys.add(e.code);updateMovement();}
});
window.addEventListener('keyup',e=>{keys.delete(e.code);updateMovement();});
window.addEventListener('blur',resetControls);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetControls();});
function updateMovement(){
  if(document.hidden||state?.self.wordMode||liveDialogOpen()){movement.x=movement.y=0;movement.pulse=false;return;}
  const x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+touchMove.x;
  const y=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))+touchMove.y;
  const length=Math.max(1,Math.hypot(x,y));movement.x=x/length;movement.y=y/length;
}
function updateAim(dt){
  if(view!=='game'||state?.phase!=='playing'||current()?.role!=='player'||current()?.resetUntil||document.hidden||state.self.wordMode||liveDialogOpen())return;
  movement.angle=aim.update(dt,keys.has('KeyQ'),keys.has('KeyE'),(x,y)=>arena.aimAt(x,y));
}
// Listen on the arena wrapper so HUD overlays do not interrupt a full circle.
$('arenaWrap').addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||e.target.closest?.('.touch-stick')||state?.self.wordMode||liveDialogOpen())return;
  aim.point(e.clientX,e.clientY);updateAim(0);
});
$('arena').addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||state?.self.wordMode||liveDialogOpen())return;
  e.preventDefault();aim.point(e.clientX,e.clientY);updateAim(0);
  if(e.button===0){movement.pulse=true;$('arena').setPointerCapture(e.pointerId);}
});
window.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')movement.pulse=false;});
$('arena').addEventListener('pointercancel',()=>{movement.pulse=false;});
$('arena').addEventListener('lostpointercapture',()=>{movement.pulse=false;});
$('arena').addEventListener('contextmenu',e=>e.preventDefault());
function stick(id,isAim){
  const el=$(id),knob=el.querySelector('span');let pointer=null;
  const move=e=>{
    if(e.pointerId!==pointer||liveDialogOpen())return;
    e.preventDefault();const r=el.getBoundingClientRect(),limit=r.width*.38;
    let x=(e.clientX-r.left-r.width/2)/limit,y=(e.clientY-r.top-r.height/2)/limit;
    const length=Math.max(1,Math.hypot(x,y));x/=length;y/=length;knob.style.transform='translate('+x*limit+'px,'+y*limit+'px)';
    if(isAim){
      if(!state?.self.wordMode&&aim.stick(x,y)){movement.angle=aim.angle;movement.pulse=true;}
      else movement.pulse=false;
    }
    else{touchMove={x,y};updateMovement();}
  };
  const end=e=>{if(e.pointerId!==pointer)return;pointer=null;knob.style.transform='';if(isAim)movement.pulse=false;else{touchMove={x:0,y:0};updateMovement();}};
  el.addEventListener('pointerdown',e=>{if(pointer!==null||liveDialogOpen())return;pointer=e.pointerId;el.setPointerCapture(pointer);move(e);});
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);
}
stick('leftStick',false);stick('rightStick',true);
setInterval(()=>{
  if(!socket.connected||view!=='game'||state?.phase!=='playing'||current()?.role!=='player')return;
  updateMovement();
  socket.volatile.emit('input',{...movement,matchId:state.matchId,seq:++inputSeq});
},1000/30);
function timers(){
  if(!state||view!=='game')return;
  const now=serverNow(),p=current(),remaining=Math.max(0,Math.ceil((state.endAt-now)/1000));
  renderCollectionHint();renderSignals(now);
  renderMissions(now);renderDefense(now);renderPowerUp(now);
  $('clock').textContent=Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0');
  $('clock').classList.toggle('urgent',remaining<=30);
  $('arenaWrap').classList.toggle('final-push',state.phase==='playing'&&remaining>0&&remaining<=30);
  const seconds=state.phase==='countdown'?Math.max(1,Math.ceil((state.startAt-now)/1000)):remaining;
  const cue=feedback.clock(state.phase,seconds);if(cue.tick)sound('tick');if(cue.notice)announce(cue.notice);
  let overlay=false;
  if(state.phase==='countdown'){
    const mission=missionBriefing(state);
    overlay=true;$('overlayLabel').textContent=mission.launch;$('overlayValue').textContent=String(Math.max(1,Math.ceil((state.startAt-now)/1000)));$('overlayHint').textContent=mission.launchHint;
  }else if(p?.resetUntil>now){
    overlay=true;$('overlayLabel').textContent='RECALIBRATING';$('overlayValue').textContent=String(Math.ceil((p.resetUntil-now)/1000));$('overlayHint').textContent='Your points are safe. Returning to orbit…';
  }
  show('phaseOverlay',overlay);
  if(!p)return;
  $('stability').textContent=state.settings.disruption?'◈'.repeat(Math.max(0,p.stability))+'◇'.repeat(Math.max(0,3-p.stability)):'';
  const shield=Math.max(0,Math.ceil((p.shieldUntil-now)/1000)),cooldown=Math.max(0,Math.ceil((state.self.cooldownUntil-now)/1000));
  $('shieldStatus').textContent=shield?'Word shield '+shield+'s':cooldown?'Shield ready in '+cooldown+'s':'Word shield ready';
  $('wordProtection').textContent=shield?'◈ Protected for '+shield+'s · ship stationary':'◇ Unprotected · '+(cooldown?'shield recharges in '+cooldown+'s':'close and reopen to activate your shield');
  $('wordProtection').style.color=shield?'var(--mint)':'#ffbe78';
}
function frame(time){
  const dt=Math.max(0,Math.min((time-lastAimFrame)/1000,.05));lastAimFrame=time;
  updateAim(dt);
  syncPowerUpState(state?.phase==='playing'&&state.defense?.enabled?state.powerUps:null,serverNow());
  backdrop.draw(time);
  if(view==='game')arena.draw(time);
  if(time-lastUI>100){timers();lastUI=time;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
