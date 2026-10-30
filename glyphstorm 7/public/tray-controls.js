export function moveTile(ids,from,to){
  const next=[...ids],start=next.indexOf(from),end=next.indexOf(to);if(start<0||end<0)return next;
  next.splice(start,1);next.splice(end,0,from);return next;
}
export function swapTiles(ids,a,b){
  const next=[...ids],i=next.indexOf(a),j=next.indexOf(b);if(i>=0&&j>=0)[next[i],next[j]]=[next[j],next[i]];return next;
}
export class TraySelection{
  constructor(){this.clear();this.mode='swap';}
  clear(){this.start=null;this.end=null;this.focus=null;this.first=null;}
  useAll(){this.clear();this.mode='swap';}
  range(tray){
    if(this.start===null)return null;
    const a=tray.findIndex(t=>t.id===this.start),b=tray.findIndex(t=>t.id===(this.end??this.start));
    return a<0||b<0?{start:-1,end:-1}:{start:Math.min(a,b),end:Math.max(a,b)+1};
  }
  tap(id,tray){
    this.focus=id;
    if(this.mode==='range'){
      if(this.start===null||this.end!==null){this.start=id;this.end=null;}else this.end=id;
      return null;
    }
    if(this.first===null){this.first=id;return null;}
    const first=this.first;this.first=null;if(first===id)return null;
    this.start=this.end=null;return swapTiles(tray.map(t=>t.id),first,id);
  }
  selectWord(tileIds){this.first=null;this.start=tileIds[0]??null;this.end=tileIds.at(-1)??null;this.mode='range';}
  sync(tray){
    const ids=new Set(tray.map(t=>t.id));
    if(this.focus&&!ids.has(this.focus))this.focus=null;
    if(this.first&&!ids.has(this.first))this.first=null;
    if((this.start&&!ids.has(this.start))||(this.end&&!ids.has(this.end)))this.start=this.end=null;
  }
}
export class FlightTips{
  constructor(done=false,onDone=()=>{}){this.step=done?3:0;this.onDone=onDone;}
  action(action){if(['collect','arrange','submit'][this.step]!==action)return;this.step++;if(this.step===3)this.onDone();}
  dismiss(){this.step=3;this.onDone();}
  get text(){return ['Fly into letters to collect them.','Rearrange your tiles to make a word.','Press Enter to submit and repair Earth.'][this.step]||'';}
}
