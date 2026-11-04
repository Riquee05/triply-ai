import * as T from './vendor/three.module.js';
import {parseAircraft} from './aircraft-loader.js';
import {orientFlightAircraft} from './air-model.js';
import {createAirport,createAirportSky} from './air-airport.js';
// Loaded only when the flight section enters the viewport. No dependency on the main world's state.
export async function createFlight(container) {
  const response=await fetch('./assets/aircraft/aircraft.3ds');
  if(!response.ok)throw Error('Modelo do Hangar indisponível.');
  const aircraft=parseAircraft(await response.arrayBuffer());
  orientFlightAircraft(aircraft);
  aircraft.traverse(o=>{if(o.isMesh){o.geometry.computeVertexNormals();for(const material of(Array.isArray(o.material)?o.material:[o.material])){material.side=T.DoubleSide;material.shininess=Math.min(material.shininess||30,60);}}});
  const renderer=new T.WebGLRenderer({alpha:false,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
  renderer.domElement.className='air-canvas';renderer.domElement.setAttribute('aria-label','Aeroporto 3D com terminal, portão G12, ponte de embarque, cidade e avião do Hangar');container.prepend(renderer.domElement);
  const scene=new T.Scene();scene.fog=new T.Fog('#b9c0b4',65,190);
  createAirportSky(scene);
  const camera=new T.PerspectiveCamera(41,1,.1,500);
  scene.add(new T.HemisphereLight(0xc8e7f3,0x6d6856,2.5));
  const sun=new T.DirectionalLight(0xffd5a0,3.4);sun.position.set(-22,35,15);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-40,right:40,top:32,bottom:-32,near:1,far:100});sun.shadow.bias=-.0005;sun.shadow.normalBias=.04;scene.add(sun);
  const plane=new T.Group();plane.add(aircraft);scene.add(plane);
  const airport=createAirport(scene);renderer.shadowMap.needsUpdate=true;
  let phase=0,visible=false,frame=0,last=0,elapsed=0,currentY=0,currentZ=0,angle=0;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const resize=()=>{const {width,height}=container.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);draw(0);};
  function draw(dt){
    const targetY=[0,0,0,0,3,10,5,0,0][phase],targetZ=phase>=3&&phase<=7?15:0,targetAngle=[0,0,0,0,.22,0,-.06,0,0][phase];
    const ease=reduced.matches?1:Math.min(1,dt*2+.04);
    currentY+=(targetY-currentY)*ease;currentZ+=(targetZ-currentZ)*ease;angle+=(targetAngle-angle)*(reduced.matches?1:.05);
    plane.position.set(phase===1||phase===2?-3:0,currentY,currentZ);plane.rotation.z=angle;
    airport.update(phase,reduced.matches?0:dt,plane.position);
    const narrow=camera.aspect<1, distance=narrow?1.45:1;
    camera.position.set(-13.8*distance,(phase===5||phase===6?2.8:8.2)*distance+currentY,19*distance+currentZ);
    camera.lookAt(1,currentY+.7,currentZ-2);
    renderer.render(scene,camera);
  }
  function loop(t){frame=0;if(!visible||document.hidden)return;const dt=Math.min(.06,(t-last)/1000||0);last=t;elapsed+=dt;if(elapsed>.032){draw(elapsed);elapsed=0;}const settling=Math.abs(currentY-[0,0,0,0,3,10,5,0,0][phase])>.01||Math.abs(currentZ-(phase>=3&&phase<=7?15:0))>.01||Math.abs(angle-[0,0,0,0,.22,0,-.06,0,0][phase])>.001;if(!reduced.matches&&((phase>=1&&phase<=7)||settling))frame=requestAnimationFrame(loop);}
  function wake(){if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(loop);}
  new ResizeObserver(resize).observe(container);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){resize();wake();}else{cancelAnimationFrame(frame);frame=0;}},{threshold:.05}).observe(container);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  resize();return {setPhase(value){phase=value;renderer.shadowMap.needsUpdate=true;draw(0);wake();}};
}
