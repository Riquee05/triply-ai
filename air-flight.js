import * as T from './vendor/three.module.js';
import {parseAircraft} from './aircraft-loader.js';
// Loaded only when the flight section enters the viewport. No dependency on the main world's state.
export async function createFlight(container) {
  const response=await fetch('./assets/aircraft/aircraft.3ds');
  if(!response.ok)throw Error('Modelo do Hangar indisponível.');
  const aircraft=parseAircraft(await response.arrayBuffer());
  aircraft.rotation.x=-Math.PI/2;aircraft.rotation.z=Math.PI/2;
  aircraft.updateMatrixWorld(true);
  let bounds=new T.Box3().setFromObject(aircraft);
  const extent=bounds.getSize(new T.Vector3());aircraft.scale.multiplyScalar(10.8/Math.max(extent.x,extent.y,extent.z));
  aircraft.updateMatrixWorld(true);bounds=new T.Box3().setFromObject(aircraft);
  const center=bounds.getCenter(new T.Vector3());aircraft.position.set(-center.x,-1.08-bounds.min.y,-center.z);
  aircraft.traverse(o=>{if(o.isMesh){o.geometry.computeVertexNormals();for(const material of(Array.isArray(o.material)?o.material:[o.material])){material.side=T.DoubleSide;material.shininess=Math.min(material.shininess||30,60);}}});
  const renderer=new T.WebGLRenderer({alpha:false,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.domElement.className='air-canvas';renderer.domElement.setAttribute('aria-label','Aeronave 3D conceitual sobre a pista');container.prepend(renderer.domElement);
  const scene=new T.Scene();scene.background=new T.Color('#326879');scene.fog=new T.Fog('#326879',40,150);
  const camera=new T.PerspectiveCamera(38,1,.1,300);scene.add(new T.HemisphereLight(0xf1e5c8,0x183344,3));const sun=new T.DirectionalLight(0xffdaab,3);sun.position.set(-20,25,15);scene.add(sun);
  const plane=new T.Group();scene.add(plane);
  const white=new T.MeshStandardMaterial({color:0xe3ece2,metalness:.35,roughness:.45}),navy=new T.MeshStandardMaterial({color:0x173f4d,metalness:.3,roughness:.55}),lime=new T.MeshStandardMaterial({color:0xcceba7,roughness:.55}),dark=new T.MeshStandardMaterial({color:0x152630});
  function mesh(geo,mat,parent=plane,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
  plane.add(aircraft);
  const ground=new T.Group();scene.add(ground);mesh(new T.BoxGeometry(250,.2,180),new T.MeshStandardMaterial({color:0x59766b}),ground,0,-1.28,0);mesh(new T.BoxGeometry(220,.03,10),new T.MeshStandardMaterial({color:0x263943}),ground,0,-1.15,0);
  const stripes=[];for(let i=0;i<28;i++)stripes.push(mesh(new T.BoxGeometry(3,.025,.2),white,ground,i*8-110,-1.12,0));
  for(const z of [-5,5])for(let x=-90;x<100;x+=8)mesh(new T.SphereGeometry(.07,5,4),lime,ground,x,-1.05,z);
  const terminal=mesh(new T.BoxGeometry(30,3,7),navy,ground,20,.3,-24);mesh(new T.BoxGeometry(28,1.1,.05),new T.MeshStandardMaterial({color:0x88b9bd,metalness:.65,roughness:.2}),ground,20,.8,-20.45);
  camera.position.set(-12,6,14);camera.lookAt(0,0,0);
  let phase=0,visible=false,frame=0,last=0,elapsed=0,currentY=0,angle=0;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const resize=()=>{const {width,height}=container.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);draw(0);};
  function draw(dt){const targetY=[0,0,0,0,3,10,5,0,0][phase],targetAngle=[0,0,0,0,.22,0,-.06,0,0][phase];currentY+= (targetY-currentY)*(reduced.matches?1:Math.min(1,dt*2+.04));angle+=(targetAngle-angle)*(reduced.matches?1:.05);plane.position.y=currentY;plane.rotation.z=angle;plane.position.x=phase===1?-1.2:phase===8?2:0;
    ground.position.y=phase===5?-18:phase===6?-6:0;ground.visible=phase!==5;
    if(!reduced.matches){if([3,4,7].includes(phase))for(const s of stripes)s.position.x=((s.position.x+110-dt*(phase===3?4:24)+224)%224)-110;}
    camera.position.y=6+currentY;camera.lookAt(0,currentY,0);
    renderer.render(scene,camera);
  }
  function loop(t){frame=0;if(!visible||document.hidden)return;const dt=Math.min(.06,(t-last)/1000||0);last=t;elapsed+=dt;if(elapsed>.032){draw(elapsed);elapsed=0;}if(!reduced.matches&&phase>=1&&phase<=7)frame=requestAnimationFrame(loop);}
  function wake(){if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(loop);}
  new ResizeObserver(resize).observe(container);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){resize();wake();}else{cancelAnimationFrame(frame);frame=0;}},{threshold:.05}).observe(container);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  resize();return {setPhase(value){phase=value;draw(0);wake();}};
}
