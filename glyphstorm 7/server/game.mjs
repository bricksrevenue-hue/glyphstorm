import { randomUUID } from 'node:crypto';
import { WORLD, RULES, COLORS, TEAM_COLORS, wrap, delta, distance, scoreWord } from '../public/rules.js';
import { FLEET, findShip } from '../public/fleet.js';
import { DEFENSE, createDefenseState, sweepCircle } from '../public/defense.js';
import { inspectTray, pickupReason, suggestWord, starters } from './word-guide.mjs';
import {wordIndex,letterCounts,canMake} from './word-index.mjs';
import {drawLetter,VOWELS,replenishNearbyLetters,balanceDistantCrystals} from './letter-supply.mjs';
import { SIGNAL_RULES, SIGNAL_TYPES, visibleSignals } from '../public/signals.js';
import { POWER_UPS, POWER_RULES, POWER_INFO, createPowerUpState, comboKey, activePowerUp, remainingPowerFrames, incomingSpeedFactor } from '../public/power-ups.js';

export class GameError extends Error {}
const fail = message => { throw new GameError(message); };
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

export class GameRoom {
  constructor(code, { words = new Set(), random = Math.random, now = Date.now() } = {}) {
    this.code = code;
    this.words = words;
    this.wordIndex=wordIndex(words);this.nextSupplyAt=Infinity;
    this.simulationNow=now;
    this.random = random;
    this.players = new Map();
    this.hostId = null;
    this.phase = 'lobby';
    this.settings = { mode:'ffa', minutes:5, disruption:false, defense:true };
    this.defense=createDefenseState();this.powerUps=createPowerUpState();
    this.matchId = randomUUID();
    this.startAt = 0;
    this.endAt = 0;
    this.lastActivity = now;
    this.crystals = [];
    this.asteroids = [];
    this.letters = [];
    this.pulses = [];
    this.events = [];
    this.eventSeq = 0;
    this.signals=[];this.signalSeq=0;
    this.entitySeq = 0;
    this.snapshotSeq = 0;
    this.results = null;
    this.bounty=null;this.bountyCycle=-1;this.shower=null;this.showerCycle=-1;
  }
  active() { return [...this.players.values()].filter(p => p.role === 'player'); }
  id() { return String(++this.entitySeq); }
  randomLetter(near=null,force=null) { return drawLetter(this,near,force); }
  event(type, details = {}) {
    this.events.push({ seq:++this.eventSeq, type, ...details });
    this.events = this.events.slice(-32);
  }
  color(p) { return this.settings.mode === 'teams' ? TEAM_COLORS[p.team] : p.color; }
  addPlayer(name, now) {
    if ([...this.players.values()].some(p => p.name.toLowerCase() === name.toLowerCase()))
      fail('That pilot name is taken in this room.');
    const role = this.phase === 'lobby' && this.active().length < RULES.maxPlayers ? 'player' : 'spectator';
    if (role === 'spectator' && [...this.players.values()].filter(p => p.role === 'spectator').length >= RULES.maxSpectators)
      fail('This room is full, including spectator seats.');
    const teamCounts = [0,0];
    this.active().forEach(p => teamCounts[p.team]++);
    const occupiedShips = new Set(this.active().map(p => p.shipId));
    const defaultShip = FLEET.find(ship => !occupiedShips.has(ship.id)) || FLEET[0];
    const p = {
      id:randomUUID(), name, role, team:teamCounts[0] <= teamCounts[1] ? 0 : 1,
      shipId:defaultShip.id,
      color:COLORS.find(color=>this.active().every(p=>p.color!==color))||COLORS[0], joinedAt:now, connected:true,
      disconnectedAt:null, socketId:null, ready:false, x:0, y:0, vx:0, vy:0, angle:0,
      score:0, tray:[], history:[], used:new Set(), stability:RULES.stability,
      shieldUntil:0, cooldownUntil:0, resetUntil:0, protectionUntil:0, lastHitAt:0,
      regenAt:0, lastPulseAt:0, wordMode:false, lastDiscardAt:0,
      boostUntil:0,boostReadyAt:0,boostX:0,boostY:0,
      signalReadyAt:0,
      shuffleReadyAt:0,lastProgressAt:now,lastGiftAt:-Infinity,pendingVowel:null,analysisCache:null,rechargeCredit:false,
      input:{ x:0,y:0,angle:0,pulse:false }, inputAt:now, inputSeq:-1, requests:new Map()
    };
    this.players.set(p.id,p);
    if (!this.hostId) this.hostId = p.id;
    this.position(p);
    this.lastActivity = now;
    return p;
  }
  position(p) {
    let spot = {x:WORLD.width/2,y:WORLD.height/2};
    for (let i = 0; i < 40; i++) {
      spot = {x:80 + this.random() * (WORLD.width-160), y:80 + this.random() * (WORLD.height-160)};
      if (this.active().every(other => other.id === p.id || distance(spot,other) > 140) &&
          [...this.crystals,...this.asteroids].every(c => distance(spot,c) > c.r + 50)) break;
    }
    p.x = spot.x; p.y = spot.y; p.vx = 0; p.vy = 0;
  }
  needHost(id) { if (id !== this.hostId) fail('Only the host can change this.'); }
  needLobby() { if (this.phase !== 'lobby') fail('This action is available in the lobby.'); }
  player(id) { const p = this.players.get(id); if (!p) fail('Your seat is no longer in this room.'); return p; }
  needPlaying(p, now) {
    if (this.phase !== 'playing' || now >= this.endAt) fail('The round is not accepting actions.');
    if (p.role !== 'player') fail('Spectators can watch but cannot play this round.');
    if (p.resetUntil > now) fail('Your ship is resetting.');
  }
  disconnect(id, now) {
    const p = this.players.get(id); if (!p) return;
    this.lastActivity = now;
    p.connected = false; p.disconnectedAt = now; p.socketId = null;
    p.input = {x:0,y:0,angle:p.angle,pulse:false};
    p.boostUntil=0;
    p.ready = false;
  }
  remove(id, now) {
    const p=this.players.get(id);
    // Preserve points already earned by a departing pilot for final standings.
    if(p && p.role==='player' && ['playing','countdown','results'].includes(this.phase)){
      p.role='retired';p.connected=false;p.socketId=null;p.disconnectedAt=null;p.ready=false;
    }else this.players.delete(id);
    this.lastActivity = now;
    if (this.hostId === id) this.transferHost();
  }
  transferHost() {
    const connected = [...this.players.values()].filter(p => p.connected).sort((a,b) =>
      Number(a.role === 'spectator') - Number(b.role === 'spectator') || a.joinedAt-b.joinedAt);
    this.hostId = connected[0]?.id ?? null;
  }
  configure(id, settings) {
    this.needHost(id); this.needLobby();
    if (!['ffa','teams'].includes(settings.mode) || ![3,5,7].includes(settings.minutes) || typeof settings.disruption !== 'boolean' ||
        (settings.defense!==undefined&&typeof settings.defense!=='boolean'))
      fail('Choose one of the available room settings.');
    const changedMode = settings.mode !== this.settings.mode;
    this.settings = {mode:settings.mode, minutes:settings.minutes, disruption:settings.disruption,defense:settings.defense??this.settings.defense};
    this.defense=createDefenseState(this.settings.defense);this.powerUps=createPowerUpState();
    this.active().forEach((p,i) => { p.ready = false; if (changedMode) p.team = i%2; });
  }
  team(id, team) {
    this.needLobby();
    const p = this.player(id);
    if (p.role !== 'player' || ![0,1].includes(team)) fail('Choose Aurora or Nebula.');
    p.team = team; p.ready = false;
  }
  claimSeat(id) {
    this.needLobby();
    const p = this.player(id);
    if (p.role === 'player') return;
    if (this.active().length >= 8) fail('All 8 pilot seats are occupied.');
    const counts = [0,0]; this.active().forEach(other => counts[other.team]++);
    p.role = 'player'; p.team = counts[0] <= counts[1] ? 0 : 1;
    const usedColors = new Set(this.active().filter(other=>other.id!==id).map(other=>other.color));
    p.color = COLORS.find(c=>!usedColors.has(c)) || COLORS[0];
    p.ready = false;
  }
  chooseShip(id, shipId) {
    this.needLobby();
    const p = this.player(id);
    if (p.role !== 'player') fail('Claim a pilot seat before choosing a ship.');
    if (!findShip(shipId)) fail('Choose one of the eight available ships.');
    if (p.shipId !== shipId) { p.shipId = shipId; p.ready = false; }
  }
  start(id, now) {
    this.needHost(id); this.needLobby();
    const players = this.active();
    if (players.length < 2) fail('At least 2 pilots are needed.');
    if (!players.every(p => p.connected && p.ready)) fail('Every pilot must be connected and ready.');
    if (this.settings.mode === 'teams' && players.filter(p=>p.team===0).length !== players.filter(p=>p.team===1).length)
      fail('Teams must be equal. Switch a team or choose free-for-all.');
    this.matchId = randomUUID();
    this.phase = 'countdown'; this.startAt = now+3000;
    this.endAt = this.startAt+this.settings.minutes*60000;
    this.nextSupplyAt=this.startAt+5000;
    this.defense=createDefenseState(this.settings.defense);this.powerUps=createPowerUpState();this.defense.nextWaveAt=this.startAt+DEFENSE.firstWaveMs;
    this.results = null; this.events = []; this.crystals = []; this.asteroids = []; this.letters = []; this.pulses = [];
    this.signals=[];
    this.bounty=null;this.bountyCycle=-1;this.shower=null;this.showerCycle=-1;
    for (const p of this.players.values()) {
      p.score=0; p.tray=[]; p.history=[]; p.used.clear(); p.requests.clear();
      p.guideTarget=null;p.guideCache=null;p.pickupNotice=null;
      p.signalReadyAt=0;
      p.shuffleReadyAt=0;p.lastProgressAt=this.startAt;p.lastGiftAt=-Infinity;p.pendingVowel=null;p.analysisCache=null;p.rechargeCredit=false;
      p.stability=3; p.resetUntil=0; p.shieldUntil=0; p.cooldownUntil=0; p.wordMode=false;
      p.boostUntil=0;p.boostReadyAt=0;p.boostX=0;p.boostY=0;
      p.protectionUntil=this.startAt+2000; p.regenAt=this.startAt+4000; p.lastPulseAt=0;
      p.input={x:0,y:0,angle:p.angle,pulse:false}; p.inputSeq=-1; this.position(p);
    }
    this.replenishFields();
  }
  lobby(id, now) {
    this.needHost(id);
    if (this.phase !== 'results') fail('Finish the current round first.');
    this.phase='lobby'; this.results=null; this.pulses=[]; this.letters=[]; this.crystals=[]; this.asteroids=[];
    this.signals=[];
    this.nextSupplyAt=Infinity;
    this.bounty=null;this.shower=null;this.defense=createDefenseState(this.settings.defense);this.powerUps=createPowerUpState();
    this.lastActivity=now;
    for(const p of this.players.values())if(p.role==='retired')this.players.delete(p.id);
    for (const p of this.players.values()) {
      p.ready=false; p.wordMode=false; p.shieldUntil=0; p.score=0; p.tray=[]; p.history=[]; p.used.clear();
      p.guideTarget=null;p.guideCache=null;p.pickupNotice=null;
      p.signalReadyAt=0;
      p.shuffleReadyAt=0;p.pendingVowel=null;p.analysisCache=null;p.rechargeCredit=false;
      p.boostUntil=0;p.boostReadyAt=0;
    }
  }
  replenishFields() {
    while(this.crystals.length<RULES.crystalCount)this.spawnCrystal();
    while(this.asteroids.filter(a=>a.kind!=='meteor').length<RULES.asteroidCount)this.spawnAsteroid();
    replenishNearbyLetters(this,this.simulationNow);
  }
  spawnCrystal() {
    let c;
    for (let i=0; i<25; i++) {
      c={id:this.id(),x:this.random()*WORLD.width,y:this.random()*WORLD.height,r:24+this.random()*10,
        vx:(this.random()-.5)*24,vy:(this.random()-.5)*24,rotation:this.random()*6.28};
      if (this.active().every(p=>distance(p,c)>100) && this.crystals.every(other=>distance(c,other)>90) &&
          this.asteroids.every(other=>distance(c,other)>other.r+c.r+48) &&
          this.letters.every(tile=>distance(c,tile)>c.r+RULES.shipRadius+RULES.letterRadius)) break;
    }
    c.letter=this.randomLetter(c);this.crystals.push(c);balanceDistantCrystals(this);
  }
  spawnAsteroid(kind='ordinary',expiresAt=0) {
    let asteroid;
    const meteor=kind==='meteor';
    for(let i=0;i<40;i++){
      asteroid={id:this.id(),x:this.random()*WORLD.width,y:this.random()*WORLD.height,r:(meteor?54:44)+this.random()*10,
        vx:meteor?60+this.random()*30:(this.random()-.5)*36,vy:meteor?25+this.random()*25:(this.random()-.5)*36,
        rotation:this.random()*Math.PI*2,spin:(this.random()-.5)*.35,kind,expiresAt,
        maxHits:meteor?4:RULES.asteroidHits,hitsRemaining:meteor?4:RULES.asteroidHits,letterCount:meteor?6:RULES.asteroidLetters};
      if(this.active().every(p=>distance(p,asteroid)>asteroid.r+120) &&
          [...this.crystals,...this.asteroids].every(other=>distance(asteroid,other)>asteroid.r+other.r+48) &&
          this.letters.every(tile=>distance(asteroid,tile)>asteroid.r+RULES.shipRadius+RULES.letterRadius))break;
    }
    const roll=this.random();asteroid.rewardType=roll<.7?'letters':roll<.85?'vowel':roll<.95?'double':'shield';
    this.asteroids.push(asteroid);
  }
  openAsteroid(asteroid,pulse,now) {
    if(asteroid.opened)return;
    asteroid.opened=true;
    const letters=Array.from({length:asteroid.letterCount||RULES.asteroidLetters},()=>this.randomLetter(asteroid));
    if(!letters.some(letter=>'AEIOU'.includes(letter)))letters[0]='AEIOU'[Math.floor(this.random()*5)];
    if(asteroid.rewardType==='vowel')letters.push(this.randomLetter(asteroid,true));
    if(asteroid.rewardType==='shield'){
      const p=this.players.get(pulse.ownerId);
      if(p?.role==='player'){p.cooldownUntil=now;if(p.shieldUntil>now)p.rechargeCredit=true;
        this.event('shieldRecharge',{playerId:p.id,x:asteroid.x,y:asteroid.y,at:now});}
    }
    const obstacles=[...this.crystals,...this.asteroids].filter(body=>!body.opened);
    const released=[];
    for(let i=0;i<letters.length;i++){
      const angle=asteroid.rotation+i*Math.PI*2/letters.length;
      let spot;
      // Separate the tiles and seek clear space around nearby solid bodies.
      for(let attempt=0;attempt<16;attempt++){
        const a=angle+(attempt%4)*.24,r=asteroid.r+48+(letters.length>4?18:0)+Math.floor(attempt/4)*28;
        spot={x:wrap(asteroid.x+Math.cos(a)*r,WORLD.width),y:wrap(asteroid.y+Math.sin(a)*r,WORLD.height)};
        if(obstacles.every(body=>distance(spot,body)>body.r+RULES.shipRadius+RULES.letterRadius) &&
            released.every(tile=>distance(spot,tile)>2*(RULES.shipRadius+RULES.letterRadius)))break;
      }
      const tile={id:this.id(),letter:letters[i],...spot,ownerId:pulse.ownerId,team:pulse.team,
        priorityUntil:now+RULES.priorityMs,expiresAt:now+RULES.letterLifeMs};
      if(asteroid.rewardType==='double'&&i===0)tile.doubleScore=true;
      released.push(tile);this.letters.push(tile);
    }
    this.event('asteroidOpen',{asteroidId:asteroid.id,x:asteroid.x,y:asteroid.y,playerId:pulse.ownerId,
      color:asteroid.kind==='meteor'?'#a0e7f4':'#ffcf92',kind:asteroid.kind||'ordinary',rewardType:asteroid.rewardType||'letters',count:released.length,at:now});
  }
  updateObjectives(now) {
    if(this.phase!=='playing'||now>=this.endAt)return;
    this.asteroids=this.asteroids.filter(a=>!a.expiresAt||a.expiresAt>now);
    const first=this.startAt+RULES.showerFirstMs;
    const cycle=Math.max(0,Math.floor((now-first)/RULES.showerCycleMs)),startsAt=first+cycle*RULES.showerCycleMs;
    const endsAt=startsAt+RULES.showerDurationMs,active=now>=startsAt&&now<endsAt;
    if(active&&cycle!==this.showerCycle){
      this.showerCycle=cycle;
      for(let i=0;i<RULES.showerCount;i++)this.spawnAsteroid('meteor',endsAt);
      this.event('showerStart',{at:now});
    }else if(this.shower?.active&&!active)this.event('showerEnd',{at:now});
    this.shower={active,startsAt,endsAt,nextAt:now<first?first:startsAt+RULES.showerCycleMs};
    const bountyFirst=this.startAt+RULES.bountyFirstMs;
    const round=Math.floor((now-bountyFirst)/RULES.bountyCycleMs),bountyStart=bountyFirst+round*RULES.bountyCycleMs;
    if(round>=0&&round!==this.bountyCycle&&now<bountyStart+RULES.bountyDurationMs){
      this.bountyCycle=round;
      const field=[...this.crystals,...this.letters].filter(t=>!t.opened&&(!t.expiresAt||t.expiresAt>now)).map(t=>t.letter).join('');
      const supplies=this.active().map(p=>({p,counts:letterCounts(field+p.tray.map(t=>t.letter).join(''))}));
      const achievable=w=>supplies.some(({p,counts})=>!p.used.has(w)&&canMake(w,counts));
      const common=starters.filter(w=>w.length<=5&&this.words.has(w)&&achievable(w));
      const available=common.length?common:this.wordIndex.shortWords.filter(achievable);
      const choices=available.filter(word=>word!==this.bounty?.word);
      const pool=choices.length?choices:available;
      const word=pool[Math.floor(this.random()*pool.length)];
      this.bounty=word?{id:this.matchId+':'+round,word,bonus:RULES.bountyBonus,startsAt:bountyStart,
        expiresAt:bountyStart+RULES.bountyDurationMs,claimedBy:null,claimedName:null}:null;
      if(this.bounty)this.event('bountyStart',{word,bonus:RULES.bountyBonus,at:now});
    }
  }
  updatePowerUps(now) {
    const power=this.powerUps;
    power.powerUpTimer=remainingPowerFrames(power,now);
    if(power.currentPowerUp&&!power.powerUpTimer){
      const kind=power.currentPowerUp;
      power.currentPowerUp=null;power.startedAt=0;power.endsAt=0;
      this.event('powerUpEnd',{kind,at:now});
    }
  }
  breakCombo(p,now) {
    if(!this.defense.enabled)return;
    const key=comboKey(p,this.settings.mode);
    if(!this.powerUps.comboWords[key])return;
    this.powerUps.comboWords[key]=0;
    this.event('comboBreak',{playerId:p.id,comboKey:key,at:now});
  }
  recordCombo(p,now) {
    if(!this.defense.enabled)return;
    const key=comboKey(p,this.settings.mode),power=this.powerUps;
    power.comboWords[key]=(power.comboWords[key]||0)+1;
    if(power.comboWords[key]%POWER_RULES.milestone!==0)return;
    const kinds=Object.values(POWER_UPS),kind=kinds[Math.floor(this.random()*kinds.length)];
    this.activatePowerUp(kind,p,now);
  }
  activatePowerUp(kind,p,now) {
    if(!this.defense.enabled||this.phase!=='playing'||now>=this.endAt||!POWER_INFO[kind])return;
    const power=this.powerUps;
    // A milestone replaces the current effect; no stacking or duration multiplication.
    Object.assign(power,{currentPowerUp:kind,powerUpTimer:POWER_RULES.frames,startedAt:now,
      endsAt:now+POWER_RULES.durationMs,activatedBy:p.id,activatedName:p.name,comboKey:comboKey(p,this.settings.mode)});
    this.event('powerUpStart',{kind,playerId:p.id,name:p.name,comboKey:power.comboKey,endsAt:power.endsAt,
      x:this.defense.x,y:this.defense.y,color:POWER_INFO[kind].color,at:now});
    if(kind===POWER_UPS.EMP_BLAST)this.empBlast(now);
  }
  empBlast(now) {
    if(activePowerUp(this.powerUps,now)!==POWER_UPS.EMP_BLAST)return;
    let count=0;
    for(const letter of this.letters){
      if(!letter.incoming||letter.expiresAt<=now)continue;
      // Preserve identity and position so safe pickups never jump or duplicate.
      Object.assign(letter,{incoming:false,vx:0,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:now+RULES.letterLifeMs});
      count++;
    }
    if(count)this.event('empPulse',{x:this.defense.x,y:this.defense.y,count,color:'#00f3ff',at:now});
  }
  updateDefense(now) {
    const d=this.defense;
    if(!d.enabled||this.phase!=='playing'||now>=this.endAt||now<d.nextWaveAt)return;
    // Skip missed waves after suspension; never unleash a catch-up avalanche.
    const wave=Math.floor((now-this.startAt-DEFENSE.firstWaveMs)/DEFENSE.waveMs);
    d.wave=wave+1;d.nextWaveAt=this.startAt+DEFENSE.firstWaveMs+(wave+1)*DEFENSE.waveMs;
    const count=Math.min(3,1+Math.floor(this.active().length/3)),speed=Math.min(75,38+wave*1.5);
    for(let i=0;i<count&&this.letters.length<RULES.maxLetters&&this.letters.filter(l=>l.incoming).length<DEFENSE.maxIncoming;i++){
      const angle=-Math.PI/2+(this.random()-.5)*2.5,radius=530+this.random()*90;
      this.letters.push({id:this.id(),letter:this.randomLetter(),incoming:true,
        x:d.x+Math.cos(angle)*radius,y:d.y+Math.sin(angle)*radius,
        vx:-Math.cos(angle)*speed,vy:-Math.sin(angle)*speed,
        ownerId:null,team:null,priorityUntil:0,expiresAt:now+RULES.letterLifeMs});
    }
    if(d.wave===1)this.event('defenseStart',{at:now});
  }
  moveIncomingLetters(dt,now) {
    const paths=new Map(),d=this.defense;
    if(!d.enabled)return paths;
    for(const letter of this.letters){
      if(!letter.incoming)continue;
      const factor=incomingSpeedFactor(this.powerUps,now);
      const path={x:letter.x,y:letter.y,dx:letter.vx*dt*factor,dy:letter.vy*dt*factor,stopAt:1};
      path.breachTime=sweepCircle(delta(letter.x,d.x,WORLD.width),delta(letter.y,d.y,WORLD.height),
        path.dx,path.dy,d.barrierRadius+d.barrierThickness/2+RULES.letterRadius);
      paths.set(letter.id,path);
      letter.x=wrap(letter.x+path.dx,WORLD.width);letter.y=wrap(letter.y+path.dy,WORLD.height);
    }
    return paths;
  }
  handleBarrierCollision(letter,now) {
    const d=this.defense,index=this.letters.findIndex(l=>l.id===letter.id);
    if(!d.enabled||this.phase!=='playing'||!letter.incoming||index<0||now>=this.endAt)return false;
    this.letters.splice(index,1); // Remove before emitting/finishing; a breach can apply only once.
    const invulnerable=activePowerUp(this.powerUps,now)===POWER_UPS.INVULNERABILITY,oldHealth=d.earthHealth;
    if(!invulnerable){d.earthHealth=Math.max(0,d.earthHealth-DEFENSE.damage);d.lastImpactAt=now;d.breaches++;}
    const angle=Math.atan2(delta(letter.y,d.y,WORLD.height),delta(letter.x,d.x,WORLD.width));
    this.event(invulnerable?'barrierBlock':'barrierImpact',{x:wrap(d.x+Math.cos(angle)*d.barrierRadius,WORLD.width),
      y:wrap(d.y+Math.sin(angle)*d.barrierRadius,WORLD.height),letterId:letter.id,damage:oldHealth-d.earthHealth,earthHealth:d.earthHealth,color:invulnerable?'#bd00ff':'#ff6770',at:now});
    if(d.earthHealth<=0)this.finish(now,'earth-lost');
    return true;
  }
  movingLetterContact(start,end,letter,motion) {
    if(!motion)return this.contactTime(start,end,letter);
    const dx=delta(end.x,start.x,WORLD.width),dy=delta(end.y,start.y,WORLD.height);
    const x=delta(motion.x,start.x,WORLD.width),y=delta(motion.y,start.y,WORLD.height),stop=motion.stopAt;
    const first=sweepCircle(x,y,(motion.dx-dx)*stop,(motion.dy-dy)*stop,RULES.shipRadius+RULES.letterRadius);
    if(first!==null)return first*stop;
    if(stop>=1)return null;
    const second=sweepCircle(x+(motion.dx-dx)*stop,y+(motion.dy-dy)*stop,
      -dx*(1-stop),-dy*(1-stop),RULES.shipRadius+RULES.letterRadius);
    return second===null?null:stop+second*(1-stop);
  }
  boost(id,direction,now) {
    const p=this.player(id);this.needPlaying(p,now);
    if(!p.connected)fail('Reconnect before boosting.');
    if(p.wordMode||p.shieldUntil>now||p.protectionUntil>now)fail('Boost is available after protection or word review ends.');
    if(now<p.boostReadyAt)fail('Boost is recharging.');
    if(!direction||![direction.x,direction.y].every(Number.isFinite))fail('Invalid boost direction.');
    let x=clamp(direction.x,-1,1),y=clamp(direction.y,-1,1),length=Math.hypot(x,y);
    if(length<.15){x=Math.cos(p.angle);y=Math.sin(p.angle);length=1;}
    p.boostX=x/length;p.boostY=y/length;p.boostUntil=now+RULES.boostMs;p.boostReadyAt=now+RULES.boostCooldownMs;
    this.event('boost',{playerId:p.id,x:p.x,y:p.y,color:this.color(p),at:now});
  }
  input(id, data, now) {
    const p=this.player(id);
    if (this.phase!=='playing' || p.role!=='player' || now>=this.endAt) return;
    if (data.matchId!==this.matchId || !Number.isSafeInteger(data.seq) || data.seq<=p.inputSeq) return;
    if (![data.x,data.y,data.angle].every(Number.isFinite)) return;
    p.inputSeq=data.seq;
    const x=clamp(data.x,-1,1), y=clamp(data.y,-1,1), length=Math.max(1,Math.hypot(x,y));
    p.input={x:x/length,y:y/length,angle:wrap(data.angle,Math.PI*2),pulse:data.pulse===true};
    p.inputAt=now;
  }
  endShield(p, now) {
    if (p.shieldUntil) {
      p.cooldownUntil=Math.min(now,p.shieldUntil)+RULES.cooldownMs;
      if(p.rechargeCredit){p.cooldownUntil=now;p.rechargeCredit=false;}
      p.shieldUntil=0;
    }
  }
  wordMode(id, enter, now) {
    const p=this.player(id); this.needPlaying(p,now);
    if (!enter) { this.endShield(p,now); p.wordMode=false; return; }
    if (p.wordMode) return;
    p.wordMode=true; p.vx=0; p.vy=0; p.input.pulse=false;p.boostUntil=0;
    if (now>=p.cooldownUntil) p.shieldUntil=now+RULES.shieldMs;
  }
  signal(id,payload,now){
    const p=this.player(id);this.needPlaying(p,now);
    if(now<p.signalReadyAt)fail('Signals recharge in 5 seconds.');
    const kind=payload.kind,letter=payload.letter;
    if(!Object.values(SIGNAL_TYPES).includes(kind))fail('Choose a preset signal.');
    if(kind===SIGNAL_TYPES.NEED_LETTER&&(this.settings.mode!=='teams'||typeof letter!=='string'||!/^[A-Z]$/.test(letter)))
      fail('Choose one letter to request from your team.');
    if(kind===SIGNAL_TYPES.DEFEND_EARTH&&!this.defense.enabled)fail('Earth defense is off this round.');
    const target=kind===SIGNAL_TYPES.DEFEND_EARTH?this.defense:p;
    this.signals=this.signals.filter(s=>s.expiresAt>now);
    this.signals.push({id:++this.signalSeq,playerId:p.id,name:p.name,team:p.team,
      scope:this.settings.mode==='teams'?'team':'all',kind,letter:kind===SIGNAL_TYPES.NEED_LETTER?letter:null,
      x:target.x,y:target.y,at:now,expiresAt:now+SIGNAL_RULES.lifetimeMs});
    this.signals=this.signals.slice(-SIGNAL_RULES.maxSignals);p.signalReadyAt=now+SIGNAL_RULES.cooldownMs;
  }
  submit(id, tileIds, now) {
    const p=this.player(id); this.needPlaying(p,now);
    if(!p.wordMode)fail('Enter word review first.');
    this.endShield(p,now);
    if (!Array.isArray(tileIds) || tileIds.length<3 || tileIds.length>10 || new Set(tileIds).size!==tileIds.length)
      fail('Use 3–10 different tiles from your tray.');
    const start=p.tray.findIndex(t=>t.id===tileIds[0]),tiles=p.tray.slice(start,start+tileIds.length);
    if (tiles.length!==tileIds.length || tiles.some((tile,index)=>tile.id!==tileIds[index]))
      fail('The tray changed. Arrange tiles first, then choose one contiguous range.');
    const word=tiles.map(t=>t.letter).join('');
    if (!this.words.has(word)) {this.breakCombo(p,now);fail('That word is not in the game dictionary.');}
    if (p.used.has(word)) {this.breakCombo(p,now);fail('You already scored '+word+' this round.');}
    this.updatePowerUps(now);this.updateObjectives(now);
    const basePoints=scoreWord(word),bounty=this.bounty;
    const bonus=bounty&&bounty.word===word&&!bounty.claimedBy&&now>=bounty.startsAt&&now<bounty.expiresAt?bounty.bonus:0;
    if(bonus){bounty.claimedBy=p.id;bounty.claimedName=p.name;this.event('bountyClaim',{playerId:p.id,name:p.name,word,bonus,at:now});}
    const multiplier=tiles.some(t=>t.doubleScore)?2:1,points=basePoints*multiplier+bonus;
    let defenseReward=null;
    if(this.defense.enabled){
      const d=this.defense,oldHealth=d.earthHealth,oldThickness=d.barrierThickness;
      d.barrierThickness=Math.min(d.barrierThickness+word.length*.5,d.maxBarrierThickness);
      d.earthHealth=Math.min(DEFENSE.maxHealth,d.earthHealth+DEFENSE.repair);
      defenseReward={hp:d.earthHealth-oldHealth,shield:d.barrierThickness-oldThickness,
        earthHealth:d.earthHealth,barrierThickness:d.barrierThickness,x:d.x,y:d.y,barrierRadius:d.barrierRadius};
      this.event('repair',{playerId:p.id,word,earthHealth:d.earthHealth,barrierThickness:d.barrierThickness,at:now});
    }
    p.tray.splice(start,tileIds.length);p.lastProgressAt=now;
    p.score+=points; p.used.add(word); p.wordMode=false;
    const entry={word,points,basePoints,multiplier,bonus,defenseReward,at:now};
    p.history.push(entry);
    this.event('word',{playerId:p.id,name:p.name,word,points,basePoints,multiplier,bonus,defenseReward,x:p.x,y:p.y,color:this.color(p),at:now});
    this.recordCombo(p,now);
    this.deliverVowel(p,now);
    return entry;
  }
  discard(id, tileId, now) {
    const p=this.player(id); this.needPlaying(p,now);
    if (now-p.lastDiscardAt<1000) fail('Wait a moment before discarding another tile.');
    if (!p.tray.some(t=>t.id===tileId)) fail('That letter is no longer in your tray.');
    p.tray=p.tray.filter(t=>t.id!==tileId); p.lastDiscardAt=now;
    this.deliverVowel(p,now);
  }
  trayAdvice(p){
    const key=p.tray.map(t=>t.id+':'+t.letter+':'+Boolean(t.doubleScore)).join('|')+':'+p.used.size;
    if(p.analysisCache?.key!==key)p.analysisCache={key,value:inspectTray(p.tray,p.used,this.words)};
    return p.analysisCache.value;
  }
  arrange(id,tileIds,now){
    const p=this.player(id);this.needPlaying(p,now);
    if(!Array.isArray(tileIds)||tileIds.length!==p.tray.length||new Set(tileIds).size!==p.tray.length||
      tileIds.some(id=>!p.tray.some(t=>t.id===id)))fail('The tray changed. Try arranging again.');
    const byId=new Map(p.tray.map(t=>[t.id,t]));p.tray=tileIds.map(id=>byId.get(id));
  }
  shuffle(id,now){
    const p=this.player(id);this.needPlaying(p,now);
    if(now<p.shuffleReadyAt)fail('Shuffle recharges in 3 seconds.');
    if(p.tray.length<2)fail('Collect at least two letters to shuffle.');
    for(let i=p.tray.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[p.tray[i],p.tray[j]]=[p.tray[j],p.tray[i]];}
    p.shuffleReadyAt=now+3000;
  }
  smartDiscard(id,now){
    const p=this.player(id);this.needPlaying(p,now);
    const suggestion=this.trayAdvice(p).smartDiscard;
    if(!suggestion)fail('Collect a letter first.');this.discard(id,suggestion.tileId,now);
  }
  deliverVowel(p,now){
    if(!p.pendingVowel||p.tray.length>=RULES.trayLimit)return;
    const tile={id:this.id(),letter:p.pendingVowel,gift:true};p.tray.push(tile);p.pendingVowel=null;p.lastGiftAt=now;p.lastProgressAt=now;
    this.event('vowelGift',{playerId:p.id,letter:tile.letter,x:p.x,y:p.y,at:now});
  }
  updateStuckPlayers(now){
    for(const p of this.active()){
      if(!p.connected||p.resetUntil>now||p.wordMode||p.protectionUntil>now)continue;
      if(!p.pendingVowel&&now-p.lastProgressAt>=20000&&now-p.lastGiftAt>=45000){
        const text=p.tray.map(t=>t.letter).join('');
        // Prefer the vowel that unlocks the most dictionary words after making room.
        const candidates=p.tray.length>=RULES.trayLimit?p.tray.map((_,i)=>text.slice(0,i)+text.slice(i+1)):[text];
        const ranked=[...VOWELS].map(letter=>({letter,count:Math.max(...candidates.map(t=>this.wordIndex.find(t+letter).filter(w=>!p.used.has(w)).length))}));
        ranked.sort((a,b)=>b.count-a.count||'EAIOU'.indexOf(a.letter)-'EAIOU'.indexOf(b.letter));
        p.pendingVowel=ranked[0].letter;
      }
      this.deliverVowel(p,now);
    }
  }
  moveMagnetLetters(dt,now,paths){
    const targets=new Map();
    for(const p of this.active()){
      if(!p.connected||pickupReason(p,null,this.settings.mode,now))continue;
      const advice=this.trayAdvice(p);
      const letter=this.letters.filter(l=>!l.incoming&&!pickupReason(p,l,this.settings.mode,now)&&
        advice.usefulness[l.letter]==='useful'&&distance(p,l)>RULES.shipRadius+RULES.letterRadius&&distance(p,l)<=72)
        .sort((a,b)=>distance(p,a)-distance(p,b)||a.id.localeCompare(b.id))[0];
      if(letter&&(!targets.has(letter.id)||distance(p,letter)<distance(targets.get(letter.id),letter)))targets.set(letter.id,p);
    }
    for(const letter of this.letters){
      letter.magnetized=false;const p=targets.get(letter.id);if(!p)continue;
      const d=distance(p,letter),step=Math.min(d,42*dt),dx=delta(p.x,letter.x,WORLD.width)/d*step,dy=delta(p.y,letter.y,WORLD.height)/d*step;
      paths.set(letter.id,{x:letter.x,y:letter.y,dx,dy,stopAt:1,breachTime:null});
      letter.x=wrap(letter.x+dx,WORLD.width);letter.y=wrap(letter.y+dy,WORLD.height);letter.magnetized=true;
    }
  }
  reset(p, now) {
    const dropped=[];
    while (dropped.length<3 && p.tray.length) {
      const index=Math.floor(this.random()*p.tray.length);
      const [tile]=p.tray.splice(index,1), angle=this.random()*Math.PI*2;
      const letter={...tile,x:wrap(p.x+Math.cos(angle)*32,WORLD.width),y:wrap(p.y+Math.sin(angle)*32,WORLD.height),
        ownerId:null,team:null,priorityUntil:0,expiresAt:now+RULES.letterLifeMs};
      this.letters.push(letter); dropped.push(tile.letter);
    }
    this.letters=this.letters.slice(-RULES.maxLetters);
    this.endShield(p,now); p.wordMode=false; p.resetUntil=now+RULES.resetMs;
    p.vx=0; p.vy=0; p.input.pulse=false;p.boostUntil=0;
    this.event('reset',{playerId:p.id,x:p.x,y:p.y,dropped:dropped.length,color:this.color(p),at:now});
  }
  // Segment-circle intersection in wrapped coordinates avoids tunneling at arena seams.
  touches(pulse, target, radius, dt) {
    return this.pulseContactTime(pulse,target,radius,dt)!==null;
  }
  pulseContactTime(pulse,target,radius,dt) {
    const x=delta(target.x,pulse.oldX,WORLD.width), y=delta(target.y,pulse.oldY,WORLD.height);
    const dx=pulse.vx*dt,dy=pulse.vy*dt;
    const c=x*x+y*y-radius*radius;if(c<0)return 0;
    const a=dx*dx+dy*dy;if(!a)return null;
    const b=x*dx+y*dy,d=b*b-a*c;if(d<=0)return null;
    const t=(b-Math.sqrt(d))/a;return t>=0&&t<=1?t:null;
  }
  // First physical contact along a ship's movement, including a wrapped edge.
  contactTime(start, end, letter) {
    const dx=delta(end.x,start.x,WORLD.width),dy=delta(end.y,start.y,WORLD.height);
    const x=delta(letter.x,start.x,WORLD.width),y=delta(letter.y,start.y,WORLD.height);
    const radius=RULES.shipRadius+RULES.letterRadius;
    const c=x*x+y*y-radius*radius;
    if(c<=0)return 0;
    const a=dx*dx+dy*dy;
    if(!a)return null;
    const b=x*dx+y*dy,discriminant=b*b-a*c;
    if(discriminant<0)return null;
    const t=(b-Math.sqrt(discriminant))/a;
    return t>=0&&t<=1?t:null;
  }
  collectLetters(paths, existingIds, now, letterPaths=new Map()) {
    const contacts=[];
    for(const letter of this.letters){
      const motion=letterPaths.get(letter.id);
      if(letter.incoming&&motion?.breachTime!==null&&motion?.breachTime!==undefined)
        contacts.push({letter,time:motion.breachTime,breach:true,distance:0});
      for(const p of this.active()){
        // A letter released this tick can only be touched at the current position.
        const start=existingIds.has(letter.id)?(paths.get(p.id)||p):p;
        const contact=this.movingLetterContact(start,p,letter,motion);
        const blocked=pickupReason(p,letter,this.settings.mode,now);
        if(blocked){
          if(contact!==null)p.pickupNotice={message:blocked,until:Math.min(now+1400,letter.priorityUntil>now?letter.priorityUntil:now+1400)};
          continue;
        }
        if(contact!==null)contacts.push({p,letter,time:existingIds.has(letter.id)?contact:1,distance:distance(start,motion||letter)});
      }
    }
    contacts.sort((a,b)=>a.time-b.time||Number(Boolean(b.breach))-Number(Boolean(a.breach))||a.distance-b.distance||
      (a.p?.id||'').localeCompare(b.p?.id||'')||a.letter.id.localeCompare(b.letter.id));
    const collected=new Set();
    for(const {p,letter,breach} of contacts){
      if(this.phase!=='playing')break;
      if(collected.has(letter.id))continue;
      if(breach){this.handleBarrierCollision(letter,now);collected.add(letter.id);continue;}
      if(p.tray.length>=RULES.trayLimit)continue;
      p.tray.push({id:letter.id,letter:letter.letter,...(letter.doubleScore?{doubleScore:true}:{})});p.lastProgressAt=now;
      p.pickupNotice=null;
      collected.add(letter.id);
      this.event('pickup',{playerId:p.id,letter:letter.letter,x:letter.x,y:letter.y,color:this.color(p),at:now});
    }
    this.letters=this.letters.filter(letter=>!collected.has(letter.id));
  }
  finish(now,reason='time') {
    if (this.phase==='results') return;
    const ranking=[...this.players.values()].filter(p=>p.role==='player'||p.role==='retired').map(p=>({id:p.id,name:p.name,team:p.team,color:this.color(p),score:p.score,
      words:p.history.length,best:[...p.history].sort((a,b)=>b.points-a.points)[0]||null,history:p.history}))
      .sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
    const teams=[0,1].map(team=>({team,score:ranking.filter(p=>p.team===team).reduce((n,p)=>n+p.score,0)}));
    const best=this.settings.mode==='teams' ? Math.max(...teams.map(t=>t.score)) : ranking[0]?.score ?? 0;
    const winners=this.settings.mode==='teams' ? teams.filter(t=>t.score===best).map(t=>t.team) : ranking.filter(p=>p.score===best).map(p=>p.id);
    this.results={ranking,teams,winners:reason==='earth-lost'?[]:winners,mode:this.settings.mode,endedAt:Math.min(now,this.endAt),
      reason,defense:this.defense.enabled?{...this.defense}:null};
    this.phase='results'; this.pulses=[];
    this.powerUps.currentPowerUp=null;this.powerUps.powerUpTimer=0;this.powerUps.startedAt=0;this.powerUps.endsAt=0;
    for (const p of this.players.values()) { this.endShield(p,now); p.wordMode=false; p.vx=0;p.vy=0;p.boostUntil=0; }
    this.event('finish',{at:now});
  }
  tick(dt, now) {
    this.simulationNow=now;
    for (const p of this.players.values()) {
      if (!p.connected && p.disconnectedAt!==null && now-p.disconnectedAt>RULES.reconnectMs) this.remove(p.id,now);
    }
    const host=this.players.get(this.hostId);
    if (!host || (!host.connected && now-host.disconnectedAt>=10000)) this.transferHost();
    if (this.phase==='countdown' && now>=this.startAt) { this.phase='playing'; this.event('start',{at:now}); }
    if (this.phase!=='playing') return;
    if (now>=this.endAt) { this.finish(now); return; }
    this.updatePowerUps(now);this.updateObjectives(now);this.updateDefense(now);this.empBlast(now);
    this.updateStuckPlayers(now);
    const paths=new Map(),existingIds=new Set(this.letters.map(letter=>letter.id));
    for (const p of this.active()) {
      if (p.shieldUntil && now>=p.shieldUntil) this.endShield(p,now);
      if (p.resetUntil) {
        if (now<p.resetUntil) continue;
        p.resetUntil=0; p.stability=3; p.regenAt=now+4000; p.protectionUntil=now+RULES.protectionMs;
        this.position(p); this.event('return',{playerId:p.id,x:p.x,y:p.y,color:this.color(p),at:now});
      }
      paths.set(p.id,{x:p.x,y:p.y});
      if (now-p.inputAt>350 || !p.connected) p.input={x:0,y:0,angle:p.angle,pulse:false};
      p.angle=p.input.angle;
      if (!p.wordMode) {
        const blend=1-Math.exp(-RULES.acceleration*dt);
        if(p.boostUntil>now){p.vx=p.boostX*RULES.boostSpeed;p.vy=p.boostY*RULES.boostSpeed;}
        else {p.vx+=(p.input.x*RULES.speed-p.vx)*blend; p.vy+=(p.input.y*RULES.speed-p.vy)*blend;}
        p.x=wrap(p.x+p.vx*dt,WORLD.width); p.y=wrap(p.y+p.vy*dt,WORLD.height);
      } else { p.vx=0; p.vy=0; }
      if (p.stability<3 && now>=p.regenAt) { p.stability++; p.regenAt=now+4000; }
      if (p.input.pulse && !p.wordMode && now>=p.protectionUntil && now-p.lastPulseAt>=RULES.pulseInterval && this.pulses.length<180) {
        p.lastPulseAt=now;
        this.pulses.push({id:this.id(),ownerId:p.id,team:p.team,color:this.color(p),
          x:wrap(p.x+Math.cos(p.angle)*22,WORLD.width),y:wrap(p.y+Math.sin(p.angle)*22,WORLD.height),
          vx:Math.cos(p.angle)*RULES.pulseSpeed,vy:Math.sin(p.angle)*RULES.pulseSpeed,expiresAt:now+1250});
      }
    }
    for (const c of [...this.crystals,...this.asteroids]) {
      c.x=wrap(c.x+c.vx*dt,WORLD.width); c.y=wrap(c.y+c.vy*dt,WORLD.height);
      for (const p of this.active()) {
        if (p.resetUntil || p.wordMode) continue;
        const d=distance(p,c), min=c.r+RULES.shipRadius;
        if (d<min) {
          const a=Math.atan2(delta(p.y,c.y,WORLD.height),delta(p.x,c.x,WORLD.width));
          p.x=wrap(c.x+Math.cos(a)*(min+1),WORLD.width); p.y=wrap(c.y+Math.sin(a)*(min+1),WORLD.height);
        }
      }
    }
    this.letters=this.letters.filter(l=>l.expiresAt>now);
    const letterPaths=this.moveIncomingLetters(dt,now);
    this.moveMagnetLetters(dt,now,letterPaths);
    for (const pulse of this.pulses) {
      if(pulse.expiresAt<=now)continue;
      pulse.oldX=pulse.x; pulse.oldY=pulse.y;
      pulse.x=wrap(pulse.x+pulse.vx*dt,WORLD.width); pulse.y=wrap(pulse.y+pulse.vy*dt,WORLD.height);
      let target=null,nearest=Infinity;
      for(const body of [...this.crystals,...this.asteroids]){
        if(body.opened)continue;
        const contact=this.pulseContactTime(pulse,body,body.r+4,dt);
        if(contact!==null&&contact<nearest){target=body;nearest=contact;}
      }
      for(const letter of this.letters){
        if(!letter.incoming)continue;
        const motion=letterPaths.get(letter.id);if(!motion)continue;
        const contact=sweepCircle(delta(motion.x,pulse.oldX,WORLD.width),delta(motion.y,pulse.oldY,WORLD.height),
          motion.dx-pulse.vx*dt,motion.dy-pulse.vy*dt,RULES.letterRadius+4);
        if(contact!==null&&contact<nearest&&(motion.breachTime===null||contact<motion.breachTime)){
          target=letter;nearest=contact;
        }
      }
      if(target?.incoming){
        const motion=letterPaths.get(target.id);
        target.x=wrap(motion.x+motion.dx*nearest,WORLD.width);target.y=wrap(motion.y+motion.dy*nearest,WORLD.height);
        target.incoming=false;target.vx=0;target.vy=0;motion.stopAt=nearest;
        target.ownerId=pulse.ownerId;target.team=pulse.team;target.priorityUntil=now+RULES.priorityMs;
        target.expiresAt=now+RULES.letterLifeMs;pulse.expiresAt=0;
        this.event('intercept',{x:target.x,y:target.y,playerId:pulse.ownerId,color:'#85ff6e',at:now});
        continue;
      }
      if(target?.hitsRemaining!==undefined){
        pulse.expiresAt=0;target.hitsRemaining--;
        if(target.hitsRemaining<=0)this.openAsteroid(target,pulse,now);
        else this.event('asteroidCharge',{asteroidId:target.id,x:target.x,y:target.y,playerId:pulse.ownerId,
          color:'#ffcf92',hitsRemaining:target.hitsRemaining,at:now});
        continue;
      }
      const crystal=target;
      if (crystal) {
        crystal.opened=true; pulse.expiresAt=0;
        this.letters.push({id:this.id(),letter:crystal.letter,x:crystal.x,y:crystal.y,ownerId:pulse.ownerId,team:pulse.team,
          priorityUntil:now+RULES.priorityMs,expiresAt:now+RULES.letterLifeMs});
        this.event('open',{x:crystal.x,y:crystal.y,color:pulse.color,playerId:pulse.ownerId,at:now});
        continue;
      }
      if (this.settings.disruption) {
        const hit=this.active().find(p=>p.id!==pulse.ownerId && !p.resetUntil &&
          !(this.settings.mode==='teams' && p.team===pulse.team) && this.touches(pulse,p,RULES.shipRadius+5,dt));
        if (hit) {
          pulse.expiresAt=0;
          this.event('ripple',{playerId:hit.id,x:hit.x,y:hit.y,color:this.color(hit),at:now});
          if (hit.shieldUntil>now || hit.protectionUntil>now) continue;
          hit.stability--; hit.lastHitAt=now; hit.regenAt=now+4000;
          if (hit.stability<=0) this.reset(hit,now);
        }
      }
    }
    this.pulses=this.pulses.filter(p=>p.expiresAt>now);
    this.crystals=this.crystals.filter(c=>!c.opened);
    this.asteroids=this.asteroids.filter(a=>!a.opened);
    this.replenishFields();
    const incoming=this.letters.filter(l=>l.incoming),ordinary=this.letters.filter(l=>!l.incoming);
    this.letters=[...incoming,...ordinary.slice(-Math.max(1,RULES.maxLetters-incoming.length))];
    this.collectLetters(paths,existingIds,now,letterPaths);
  }
  publicState(now) {
    return {
      code:this.code,phase:this.phase,hostId:this.hostId,settings:this.settings,matchId:this.matchId,
      now,startAt:this.startAt,endAt:this.endAt,seq:++this.snapshotSeq,world:WORLD,results:this.results,bounty:this.bounty,shower:this.shower,defense:{...this.defense},
      powerUps:{...this.powerUps,powerUpTimer:remainingPowerFrames(this.powerUps,now),comboWords:{...this.powerUps.comboWords}},
      players:[...this.players.values()].map(p=>({
        id:p.id,name:p.name,shipId:p.shipId,role:p.role,team:p.team,color:this.color(p),connected:p.connected,ready:p.ready,
        x:p.x,y:p.y,vx:p.vx,vy:p.vy,angle:p.angle,score:p.score,tileCount:p.tray.length,wordCount:p.history.length,
        stability:p.stability,shieldUntil:p.shieldUntil,resetUntil:p.resetUntil,protectionUntil:p.protectionUntil,
        boostUntil:p.boostUntil,boostX:p.boostX,boostY:p.boostY,
        wordMode:p.wordMode,lastWord:p.history.at(-1)||null
      })),
      crystals:this.crystals.map(({id,x,y,r,letter,rotation})=>({id,x,y,r,letter,rotation})),
      asteroids:this.asteroids.map(({id,x,y,r,vx,vy,rotation,spin,hitsRemaining,maxHits,letterCount,kind,rewardType})=>({id,x,y,r,vx,vy,rotation,spin,hitsRemaining,maxHits,letterCount,kind,rewardType})),
      letters:this.letters,pulses:this.pulses.map(({id,x,y,vx,vy,color})=>({id,x,y,vx,vy,color})),events:this.events
    };
  }
  privateState(id,now=this.simulationNow) {
    const p=this.player(id);
    const wordGuide=p.role==='player'?{...this.trayAdvice(p)}:null;
    if(wordGuide){
      const key=wordGuide.trayKey+':'+p.used.size+':'+this.phase+':'+this.settings.mode+':'+p.team+':'+Math.floor(now/1000);
      if(p.guideCache?.key!==key){
        const suggestion=this.phase==='playing'&&!wordGuide.best?suggestWord(p,this,now):null;
        p.guideCache={key,suggestion};p.guideTarget=suggestion?.word||null;
      }
      wordGuide.suggestion=p.guideCache.suggestion;
      wordGuide.nudge=this.phase==='playing'&&p.score===0&&now-this.startAt>=45000?
        wordGuide.shortWord?'Try '+wordGuide.shortWord.word+' — arrange those tiles, select them and submit.':
          wordGuide.suggestion?.available?'Try '+wordGuide.suggestion.word+' — look for '+wordGuide.suggestion.next+' nearby.':'Try Smart discard; a recovery vowel helps you restart.':null;
    }
    return {id:p.id,shipId:p.shipId,ready:p.ready,tray:p.tray,history:p.history,cooldownUntil:p.cooldownUntil,wordMode:p.wordMode,
      boostUntil:p.boostUntil,boostReadyAt:p.boostReadyAt,wordGuide,pickupNotice:p.pickupNotice||null,
      shuffleReadyAt:p.shuffleReadyAt,pendingVowel:p.pendingVowel,signalReadyAt:p.signalReadyAt,signals:this.phase==='playing'?visibleSignals(this.signals,p,this.settings.mode,now):[]};
  }
}
