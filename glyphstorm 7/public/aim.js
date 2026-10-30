const TAU = Math.PI * 2;
export const TURN_SPEED = Math.PI; // 180 degrees per second, independent of frame rate.
export const wrapAngle = angle => ((angle % TAU) + TAU) % TAU;
export function vectorAngle(x,y,previous=0,deadZone=.15) {
  return Number.isFinite(x)&&Number.isFinite(y)&&Math.hypot(x,y)>deadZone
    ? wrapAngle(Math.atan2(y,x)) : previous;
}

// The most recent aiming control takes over. A released turn key holds its
// heading until the mouse moves again; a stale cursor must not snap it back.
export class AimControls {
  constructor(angle=0) { this.angle=wrapAngle(angle);this.pointer=null; }
  hold(angle=this.angle) { this.angle=wrapAngle(angle);this.pointer=null; }
  point(x,y) {
    if(Number.isFinite(x)&&Number.isFinite(y))this.pointer={x,y};
  }
  stick(x,y) {
    if(!Number.isFinite(x)||!Number.isFinite(y)||Math.hypot(x,y)<=.15)return false;
    this.hold(vectorAngle(x,y,this.angle));return true;
  }
  update(dt,left,right,aimAt) {
    if(left||right){
      this.pointer=null;
      this.angle=wrapAngle(this.angle+(Number(right)-Number(left))*TURN_SPEED*Math.max(0,dt));
    }else if(this.pointer){
      const angle=aimAt(this.pointer.x,this.pointer.y);
      if(Number.isFinite(angle))this.angle=wrapAngle(angle);
    }
    return this.angle;
  }
}
