import * as THREE from 'three';

const cameraInHangar=new THREE.Vector3();
export function updateHangarView(world,camera){
  world.updateWorldMatrix(true,false);
  world.worldToLocal(cameraInHangar.copy(camera.position));
  world.traverse(object=>{
    const section=object.userData.hangarSection;
    if(!section)return;
    // Cut away only architecture on the camera side, before crossing it.
    object.visible=section==='roof'?cameraInHangar.y<8.5:
      section==='left'?cameraInHangar.x>-13.8:
      section==='right'?cameraInHangar.x<13.8:cameraInHangar.z>-16.8;
  });
}

// All scenery is procedural and local. No images, downloads or animation loop.
export function createHangar(world, renderer) {
  const steel=new THREE.MeshStandardMaterial({color:0x223440,roughness:.65,metalness:.5});
  const wall=new THREE.MeshStandardMaterial({color:0x344550,roughness:.9});
  const beam=new THREE.MeshStandardMaterial({color:0x344855,roughness:.55,metalness:.65});
  const yellow=new THREE.MeshStandardMaterial({color:0xb6a269,roughness:.9});
  const cool=new THREE.MeshBasicMaterial({color:0xa8d4df,toneMapped:false});
  function box(w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);
    if(mat===wall||mat===beam||mat===cool){
      if(z<=-17.5)m.userData.hangarSection='back';
      else if(y>=8.5)m.userData.hangarSection='roof';
      else if(x<=-14)m.userData.hangarSection='left';
      else if(x>=14)m.userData.hangarSection='right';
    }
    world.add(m);return m;}
  function texture(draw,size=256){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;draw(canvas.getContext('2d'),size);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;}
  const concrete=texture((ctx,s)=>{ctx.fillStyle='#727a7d';ctx.fillRect(0,0,s,s);let seed=7429;for(let i=0;i<9000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%s;seed=(seed*1664525+1013904223)>>>0;const y=seed%s;ctx.fillStyle=i%2?'#ffffff08':'#0000000b';ctx.fillRect(x,y,1,1);}});
  concrete.wrapS=concrete.wrapT=THREE.RepeatWrapping;concrete.repeat.set(12,12);
  const floor=new THREE.MeshStandardMaterial({color:0x7c898e,map:concrete,roughness:.62,metalness:.18});
  const ground=box(30,.18,42,floor,0,-1,1);ground.receiveShadow=true;
  // Concrete expansion joints and restrained aircraft stand markings.
  for(let x=-12;x<=12;x+=6)box(.018,.006,40,steel,x,-.904,1);
  for(let z=-16;z<=20;z+=6)box(29,.006,.018,steel,0,-.904,z);
  for(const x of [-7,7])box(.065,.008,16,yellow,x,-.9,1);
  box(14,.008,.065,yellow,0,-.9,9);
  for(let z=-10;z<=12;z+=2.2)box(.07,.009,.9,yellow,0,-.895,z);

  // Side walls, roof structure and a broad open rear door.
  box(.45,11,38,wall,-15,4.5,0);box(.45,11,38,wall,15,4.5,0);
  box(30,.25,38,wall,0,10,0);
  for(let z=-17;z<=18;z+=5){
    for(const x of [-14.7,14.7])box(.34,10.8,.4,beam,x,4.5,z);
    box(29.4,.3,.35,beam,0,9.6,z);
    // Shallow diagonal braces give the roof a readable industrial silhouette.
    for(const x of [-10,-5,0,5,10]){const m=box(5.1,.09,.13,beam,x,9.1,z);m.rotation.z=x%10===0?.16:-.16;}
  }
  box(4.8,11,.5,wall,-12.5,4.5,-18);box(4.8,11,.5,wall,12.5,4.5,-18);
  box(20.4,2,.5,wall,0,9,-18);
  for(const x of [-10.15,10.15]){box(.3,9,.7,beam,x,3.5,-18);box(.055,8.4,.08,cool,x,3.2,-17.6);}
  // Ceiling fixtures use emissive surfaces rather than many expensive lights.
  for(const z of [-12,-4,4,12])for(const x of [-9,9])box(.2,.05,3,cool,x,9.65,z);

  const sky=texture((ctx,s)=>{const g=ctx.createLinearGradient(0,0,0,s);g.addColorStop(0,'#263e59');g.addColorStop(.45,'#7b9ca8');g.addColorStop(.75,'#e4bc9d');g.addColorStop(1,'#f4d9ac');ctx.fillStyle=g;ctx.fillRect(0,0,s,s);});
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(180,65),new THREE.MeshBasicMaterial({map:sky,toneMapped:false,fog:false}));backdrop.position.set(0,20,-80);world.add(backdrop);
  const sun=new THREE.Mesh(new THREE.CircleGeometry(2.5,48),new THREE.MeshBasicMaterial({color:0xffe6b3,toneMapped:false,fog:false}));sun.position.set(-10,2,-76);world.add(sun);
  box(140,.12,100,new THREE.MeshStandardMaterial({color:0x57696a,roughness:1}),0,-1.04,-60);
  const runway=new THREE.MeshStandardMaterial({color:0x424c50,roughness:1});
  box(15,.04,85,runway,0,-.95,-58);
  for(let z=-28;z>=-85;z-=8)box(.16,.015,3,new THREE.MeshBasicMaterial({color:0xbfc6bb}),0,-.92,z);
  // Small distant terminal silhouettes establish the scale of the airfield.
  for(let i=0;i<7;i++)box(5+i%3,1.3+i%2,.8,steel,-30+i*9,-.3,-67);

  const light=new THREE.DirectionalLight(0xffd5a2,3.5);light.position.set(-8,9,-24);light.target.position.set(0,-.8,2);world.add(light,light.target);
  light.castShadow=true;light.shadow.mapSize.set(innerWidth<850?1024:2048,innerWidth<850?1024:2048);
  Object.assign(light.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:65});light.shadow.bias=-.0003;light.shadow.normalBias=.025;light.shadow.intensity=.5;
  const fill=new THREE.HemisphereLight(0x9fc5e8,0x62605a,1.8);world.add(fill);
  const front=new THREE.DirectionalLight(0xb6d7eb,1.3);front.position.set(4,7,12);world.add(front);
  // A soft contact patch complements the directional wheel and fuselage shadows.
  const contact=texture((ctx,s)=>{const g=ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(0,0,0,.25)');g.addColorStop(.5,'rgba(0,0,0,.12)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,s,s);});
  const patch=new THREE.Mesh(new THREE.PlaneGeometry(9,7),new THREE.MeshBasicMaterial({map:contact,transparent:true,depthWrite:false}));patch.rotation.x=-Math.PI/2;patch.position.set(0,-.885,0);world.add(patch);

  // Ground equipment stays at the periphery.
  const rubber=new THREE.MeshStandardMaterial({color:0x111820,roughness:1});
  box(1.4,.8,.7,steel,11,-.35,-6);box(1.35,.08,.74,yellow,11,.1,-6);
  for(const x of [10.5,11.5])for(const z of [-6.3,-5.7]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.09,12),rubber);wheel.rotation.z=Math.PI/2;wheel.position.set(x,-.72,z);world.add(wheel);}
  for(const x of [-11,11]){const cone=new THREE.Mesh(new THREE.ConeGeometry(.16,.5,12),yellow);cone.position.set(x,-.64,7);world.add(cone);}
  const signMap=texture((ctx,s)=>{ctx.fillStyle='#1e303a';ctx.fillRect(0,0,s,s);ctx.fillStyle='#c2d5db';ctx.font='bold 46px Arial';ctx.fillText('HANGAR',15,90);ctx.fillStyle='#b8a581';ctx.font='100px Arial';ctx.fillText('01',15,200);});
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.1,2.1),new THREE.MeshBasicMaterial({map:signMap}));sign.position.set(12.5,3,-17.65);sign.userData.hangarSection='back';world.add(sign);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
}

