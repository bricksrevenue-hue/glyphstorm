// Move the same live nodes rather than maintaining a second, stale mobile HUD.
export class CompactHUD {
  constructor(doc=document,media=matchMedia('(max-width:900px), (max-height:600px)')){
    this.doc=doc;this.media=media;this.active=false;this.compact=false;
    this.dialog=doc.getElementById('telemetryDialog');
    this.destinations={powerUpCard:'telemetryObjectives',bountyCard:'telemetryObjectives',meteorCard:'telemetryObjectives',
      scoreboard:'telemetryScores',soundButton:'telemetryPreferences',motionButton:'telemetryPreferences'};
    this.slots=Object.keys(this.destinations).map(id=>{
      const element=doc.getElementById(id),marker=doc.createComment('desktop '+id);element.before(marker);return {id,element,marker};
    });
    media.addEventListener('change',()=>this.sync());
  }
  setActive(active){this.active=active;this.sync();}
  sync(){
    const compact=this.active&&this.media.matches;if(compact===this.compact)return;
    this.compact=compact;
    if(this.dialog.open)this.dialog.close();
    for(const {id,element,marker}of this.slots){
      if(compact)this.doc.getElementById(this.destinations[id]).append(element);
      else marker.after(element);
    }
  }
}
