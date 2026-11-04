import * as T from './vendor/three.module.js';

export function orientFlightAircraft(aircraft) {
  aircraft.rotation.set(-Math.PI/2,0,Math.PI/2);
  // The Hangar adapter leaves the nose pointing along world +Z.
  // Rotate in WORLD space so the nose follows the runway's +X axis.
  aircraft.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2));
  aircraft.updateMatrixWorld(true);
  let bounds=new T.Box3().setFromObject(aircraft);
  const extent=bounds.getSize(new T.Vector3());
  aircraft.scale.multiplyScalar(10.8/Math.max(extent.x,extent.y,extent.z));
  aircraft.updateMatrixWorld(true);
  bounds=new T.Box3().setFromObject(aircraft);
  const center=bounds.getCenter(new T.Vector3());
  aircraft.position.set(-center.x,-1.08-bounds.min.y,-center.z);
  aircraft.updateMatrixWorld(true);
  return aircraft;
}
