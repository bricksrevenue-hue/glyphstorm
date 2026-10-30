import {WORLD,RULES,distance,wrap} from '../public/rules.js';
export const VOWELS='AEIOU';
export const TILE_FREQUENCIES=Object.freeze({A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1});
const vowelBag=Object.entries(TILE_FREQUENCIES).filter(([l])=>VOWELS.includes(l)).map(([l,n])=>l.repeat(n)).join('');
const consonantBag=Object.entries(TILE_FREQUENCIES).filter(([l])=>!VOWELS.includes(l)).map(([l,n])=>l.repeat(n)).join('');
export function vowelShare(room){const tiles=[...room.crystals,...room.letters].filter(t=>!t.opened&&(!t.expiresAt||t.expiresAt>room.simulationNow));return {tiles,share:tiles.length?tiles.filter(t=>VOWELS.includes(t.letter)).length/tiles.length:0};}
export function drawLetter(room,near=null,force=null){
  const {tiles,share}=vowelShare(room);let chance=.375;
  const pilot=near&&room.active().filter(p=>p.connected&&distance(p,near)<600).sort((a,b)=>distance(a,near)-distance(b,near))[0];
  if(pilot){const vowels=pilot.tray.filter(t=>VOWELS.includes(t.letter)).length;chance=vowels<2?.72:vowels>4?.18:.375;}
  if(tiles.length>8)chance=share<.35?1:share>.4?0:chance;
  const vowels=force===null?room.random()<chance:force;
  const bag=vowels?vowelBag:consonantBag;return bag[Math.min(bag.length-1,Math.floor(room.random()*bag.length))];
}
export function balanceDistantCrystals(room){
  // Correct the field ratio without changing any released/collected tile or nearby target.
  const {tiles}=vowelShare(room);if(!tiles.length)return;
  let count=tiles.filter(t=>VOWELS.includes(t.letter)).length;
  const target=Math.round(tiles.length*.375);
  for(const c of room.crystals){
    if(count/tiles.length>=.35&&count/tiles.length<=.4)break;
    if(c.opened||room.active().some(p=>p.connected&&distance(p,c)<=600))continue;
    const want=count<target;if(VOWELS.includes(c.letter)===want)continue;
    c.letter=drawLetter(room,null,want);count+=want?1:-1;
  }
}
export function replenishNearbyLetters(room,now){
  if(room.phase!=='playing'||now<room.nextSupplyAt)return;
  room.nextSupplyAt=now+2000;
  const pilots=room.active().filter(p=>p.connected&&!p.resetUntil);
  room.letters=room.letters.filter(l=>!l.localSupply||pilots.some(p=>distance(p,l)<=650));
  for(const p of pilots){
    let count=room.letters.filter(l=>!l.incoming&&distance(l,p)<=600).length;
    for(let i=0;i<2&&count<4&&room.letters.length<RULES.maxLetters&&room.letters.filter(l=>l.localSupply).length<24;i++){
      let spot=null;
      for(let attempt=0;attempt<20;attempt++){
        const angle=room.random()*Math.PI*2,r=180+room.random()*300;
        const candidate={x:wrap(p.x+Math.cos(angle)*r,WORLD.width),y:wrap(p.y+Math.sin(angle)*r,WORLD.height)};
        if([...room.crystals,...room.asteroids].every(b=>distance(b,candidate)>b.r+55)&&room.letters.every(l=>distance(l,candidate)>70)){spot=candidate;break;}
      }
      if(!spot)break;
      room.letters.push({id:room.id(),letter:drawLetter(room,spot),...spot,localSupply:true,
        ownerId:null,team:null,priorityUntil:0,expiresAt:now+18000});count++;
    }
  }
  balanceDistantCrystals(room);
}
