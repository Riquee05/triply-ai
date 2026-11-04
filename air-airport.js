import * as T from './vendor/three.module.js';

// Procedural art: no remote textures, models, services or post-processing pass.
export function createAirport(scene) {
  const ground=new T.Group(),gate=new T.Group(),bridge=new T.Group();
  scene.add(ground);ground.add(gate);gate.add(bridge);
  const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,10,7);
  const mat=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const concrete=mat('#a1a49c'),steel=mat('#d5ded5',.35,.5),charcoal=mat('#263c49'),roof=mat('#d6d5c6'),yellow=mat('#f4c969'),white=mat('#e6e7d7'),tire=mat('#18252c'),grass=mat('#5a756a');
  const glass=new T.MeshStandardMaterial({color:'#497989',roughness:.23,metalness:.65,emissive:'#203f4c',emissiveIntensity:.3});
  const warm=new T.MeshStandardMaterial({color:'#ffdda2',emissive:'#ffc779',emissiveIntensity:1.2});
  function box(parent,w,h,d,material,x,y,z,shadow=false){const m=new T.Mesh(cube,material);m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m;}
  function instances(parent,geometry,material,items){const m=new T.InstancedMesh(geometry,material,items.length),dummy=new T.Object3D();items.forEach((p,i)=>{dummy.position.set(...p.slice(0,3));dummy.scale.set(...p.slice(3,6));dummy.rotation.set(0,p[6]||0,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.receiveShadow=true;parent.add(m);return m;}
  function label(parent,text,x,y,z,w=4,h=1,bg='#102b3b',fg='#edf0d7'){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 100px system-ui';ctx.fillText(text,512,132,970);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const material=new T.MeshBasicMaterial({map:texture});const m=new T.Mesh(new T.PlaneGeometry(w,h),material);m.position.set(x,y,z);parent.add(m);return m;
  }
  // Concrete apron with fine grain, expansion joints, stand guidance and vehicle lanes.
  const asphaltCanvas=document.createElement('canvas');asphaltCanvas.width=asphaltCanvas.height=128;const ac=asphaltCanvas.getContext('2d'),noise=ac.createImageData(128,128);
  let seed=71023;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<noise.data.length;i+=4){const n=135+Math.floor(random()*20);noise.data.set([n,n+2,n,255],i);}ac.putImageData(noise,0,0);
  const texture=new T.CanvasTexture(asphaltCanvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(35,35);texture.colorSpace=T.SRGBColorSpace;
  const apron=new T.MeshStandardMaterial({color:'#aab4b1',map:texture,roughness:1});
  box(ground,320,.4,240,grass,0,-1.5,-20);
  box(ground,118,.08,47,apron,0,-1.245,-4);
  box(ground,300,.07,10,mat('#35434a'),0,-1.24,15);
  const joints=[],lane=[],runwayMarks=[];
  for(let x=-55;x<60;x+=6)joints.push([x,-1.197,-5,.022,.005,39]);
  for(let z=-23;z<15;z+=6)joints.push([0,-1.196,z,116,.005,.022]);
  instances(ground,cube,mat('#71817e'),joints);
  for(let x=-55;x<58;x+=4)lane.push([x,-1.18,-11,2,.012,.1]);
  instances(ground,cube,white,lane);
  for(let x=-145;x<150;x+=8)runwayMarks.push([x,-1.19,15,3,.015,.18]);
  const stripes=instances(ground,cube,white,runwayMarks);
  box(ground,298,.012,.1,white,0,-1.19,10.5);box(ground,298,.012,.1,white,0,-1.19,19.5);
  for(const x of [-15,0,15]){box(gate,.09,.013,13,yellow,x,-1.18,-1.3);box(gate,9,.013,.09,yellow,x,-1.178,5.2);const text=label(gate,x===0?'G12':x<0?'G11':'G13',x,-1.17,-7,2.1,.55,'#b7a46b','#263b40');text.rotation.x=-Math.PI/2;}
  // Terminal: lit interior, glazed facade, mullions, roof, canopy and three gates.
  box(gate,52,4,8,charcoal,5,.8,-19,true);
  box(gate,51,2.75,.12,glass,5,1.05,-14.92);
  box(gate,54,.28,9.6,roof,5,2.98,-18.6,true);
  box(gate,54,.18,1.3,steel,5,2.45,-14.1);
  const pillars=[],crossbars=[],ceilingLights=[];
  for(let x=-20;x<=30;x+=2){pillars.push([x,1,-14.73,.075,3.6,.09]);ceilingLights.push([x,2.3,-14.64,1.2,.045,.06]);}
  for(const y of [-.15,1.2,2.4])crossbars.push([5,y,-14.71,51,.055,.08]);
  instances(gate,cube,steel,pillars);instances(gate,cube,steel,crossbars);instances(gate,cube,warm,ceilingLights);
  label(gate,'TRIPLY AIR  /  TERMINAL 01',4,3.65,-14.7,17,1.25);
  for(const x of [-12,3,18]){box(gate,4,.7,.25,charcoal,x,2,-14.5);label(gate,x===3?'G12  •  SALVADOR':x<0?'G11  •  TRIPLY':'G13  •  TRIPLY',x,2,-14.35,3.7,.54,'#132e3c','#eedbad');}
  // The jet bridge reaches the forward port-side door; the outer cabin retracts at pushback.
  box(bridge,1.55,1.2,9.2,steel,3,.25,-9.9,true);
  box(bridge,1.58,.65,8.8,glass,3,.32,-9.9);
  box(bridge,1.8,.14,9.6,roof,3,.94,-9.9,true);
  const bridgeFrames=[];for(let z=-14;z<-5;z+=1.25)bridgeFrames.push([3,.3,z,1.69,1.3,.055]);instances(bridge,cube,steel,bridgeFrames);
  box(bridge,.15,1.6,.15,steel,2.4,-.45,-8);box(bridge,.15,1.6,.15,steel,3.6,-.45,-8);
  const docking=new T.Group();bridge.add(docking);
  box(docking,1.5,1.25,3.7,steel,3,.22,-3.45,true);box(docking,1.53,.65,3.3,glass,3,.3,-3.55);box(docking,1.7,.14,3.8,roof,3,.94,-3.5);
  box(docking,1.8,1.5,.7,charcoal,3,.3,-1.55);label(docking,'G12',3,1.46,-2.2,1.55,.6,'#103342','#d5f2b3');
  // Airport service vehicles and baggage carts, shared low-poly geometry.
  function vehicle(x,z,type){const g=new T.Group();g.position.set(x,-.98,z);gate.add(g);const bus=type==='bus',w=bus?1.2:.7,len=bus?3.5:1.3;
    box(g,len,.5,w,white,0,.15,0,true);box(g,bus?2.9:.65,.65,w*.95,bus?glass:yellow,bus?0:-.3,.65,0,true);box(g,len+.08,.09,w+.06,charcoal,0,-.12,0);
    for(const xx of [-len*.32,len*.32])for(const zz of [-w*.52,w*.52]){const wheel=new T.Mesh(new T.CylinderGeometry(.18,.18,.12,10),tire);wheel.rotation.x=Math.PI/2;wheel.position.set(xx,-.05,zz);g.add(wheel);}
    box(g,.05,.12,w*.7,warm,len*.51,.2,0);return g;
  }
  const tug=vehicle(-6,1.1,'tug');vehicle(-8,-9,'bus');vehicle(12,-8,'bus');
  for(let i=0;i<3;i++){box(gate,1.1,.2,.7,steel,-7-i*1.4,-.8,-5.5,true);box(gate,.8,.65,.55,mat(['#778a8d','#a98f72','#586d78'][i]),-7-i*1.4,-.4,-5.5);}
  // Safety cones and apron floodlights.
  const cones=[];for(const [x,z] of [[-5,5],[5,5],[-6,-4],[7,-4],[10,-10]])cones.push([x,-.94,z,.16,.42,.16]);instances(gate,new T.ConeGeometry(1,1,8),mat('#ed995b'),cones);
  for(const x of [-22,22]){box(gate,.15,10,.15,steel,x,3.8,-8,true);box(gate,2.4,.3,.6,charcoal,x,8.8,-8);box(gate,2.25,.12,.7,warm,x,8.6,-7.9);}
  // Control tower with a faceted glazed cab and antenna.
  const tower=new T.Group();tower.position.set(-31,-1.2,-33);ground.add(tower);
  box(tower,2.3,11,2.3,concrete,0,5.5,0,true);box(tower,4.5,.5,4.5,steel,0,11,0,true);
  const cab=new T.Mesh(new T.CylinderGeometry(2.8,2.2,2,8),glass);cab.position.y=12.1;tower.add(cab);
  const lid=new T.Mesh(new T.CylinderGeometry(3,3,.35,8),charcoal);lid.position.y=13.3;tower.add(lid);box(tower,.08,3,.08,steel,0,14.5,0);
  // Deterministic skyline with a single instanced facade material.
  const windows=document.createElement('canvas');windows.width=128;windows.height=256;const wc=windows.getContext('2d');wc.fillStyle='#4b6471';wc.fillRect(0,0,128,256);
  for(let y=8;y<250;y+=16)for(let x=6;x<125;x+=16){wc.fillStyle=random()>.58?'#f7d8a3':'#77929c';wc.fillRect(x,y,7,9);}
  const windowTex=new T.CanvasTexture(windows);windowTex.colorSpace=T.SRGBColorSpace;const buildingMaterial=new T.MeshStandardMaterial({map:windowTex,color:'#b7c6c6',roughness:.8,emissiveMap:windowTex,emissive:'#cfab7e',emissiveIntensity:.18});
  const city=[];for(let row=0;row<3;row++)for(let i=0;i<32;i++){const h=3+random()*13;city.push([(i-16)*6+random()*2,h/2-1.3,-66-row*18,2+random()*3,h,2+random()*4,0]);}instances(ground,cube,buildingMaterial,city);
  const trees=[],trunks=[];for(let i=0;i<72;i++){const x=(random()-.5)*190,z=-43-random()*9;trunks.push([x,-.15,z,.12,2,.12]);trees.push([x,1,z,.7+random()*.6,1.3,.8]);}instances(ground,cube,mat('#635b4d'),trunks);instances(ground,sphere,mat('#416e60'),trees);
  // Atmospheric hills and a layered sea horizon.
  box(ground,400,.05,140,mat('#578f9b',.3,.3),0,-1.4,-200);
  const hills=[];for(let i=0;i<20;i++)hills.push([(i-10)*24,-3,-145-random()*30,15+random()*20,8+random()*14,12]);instances(ground,sphere,mat('#789796'),hills);
  // Single shadow sprite gives soft aircraft contact without a second draw of its 148 meshes.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(12,26,38,.38)');gradient.addColorStop(1,'rgba(12,26,38,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
  const shadow=new T.Mesh(new T.PlaneGeometry(13,11),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.16;ground.add(shadow);
  // Painted runway edge lights are instanced instead of dozens of real lights.
  const lights=[];for(let x=-140;x<145;x+=7)for(const z of [10.4,19.6])lights.push([x,-1.12,z,.07,.07,.07]);instances(ground,sphere,warm,lights);
  return {ground,update(phase,dt,position){
    docking.position.z=phase===0||phase===8?0:-3.3;
    tug.visible=phase<3||phase===8;tug.position.x=phase===1?-7.5:-6;
    ground.visible=phase!==5;ground.position.y=phase===6?-6:0;
    shadow.position.x=position.x;shadow.position.z=position.z;shadow.material.opacity=Math.max(0,1-position.y/8);
    if([3,4,7].includes(phase)&&dt>0)stripes.position.x=(stripes.position.x-dt*(phase===3?3:20))%8;
  }};
}

export function createAirportSky(scene) {
  const sky=new T.Mesh(new T.SphereGeometry(240,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color('#427d9e')},horizon:{value:new T.Color('#ecd2ad')}},vertexShader:'varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vPosition; uniform vec3 top; uniform vec3 horizon; void main(){float t=smoothstep(-.3,.45,normalize(vPosition).y);gl_FragColor=vec4(mix(horizon,top,t),1.);\n #include <tonemapping_fragment> \n #include <colorspace_fragment> }'}));scene.add(sky);
  const sun=new T.Mesh(new T.SphereGeometry(5,16,10),new T.MeshBasicMaterial({color:'#ffe5ac',fog:false}));sun.position.set(-90,32,-100);scene.add(sun);
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const c=canvas.getContext('2d');
  for(const [x,y,r]of [[50,70,28],[90,48,38],[132,55,40],[176,67,32],[210,77,18]]){const g=c.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'rgba(255,242,218,.7)');g.addColorStop(1,'rgba(255,242,218,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  const material=new T.SpriteMaterial({map:new T.CanvasTexture(canvas),transparent:true,depthWrite:false,opacity:.6,fog:false});for(let i=0;i<9;i++){const cloud=new T.Sprite(material);cloud.position.set((i-4)*38,28+(i%3)*8,-90-(i%2)*50);cloud.scale.set(45,19,1);scene.add(cloud);}
}
