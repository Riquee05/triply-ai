import * as THREE from 'three';

export function createSalvadorCentral(world,renderer){
  const white=new THREE.MeshStandardMaterial({color:0xeee5cf,roughness:.85});
  const black=new THREE.MeshStandardMaterial({color:0x25333b,roughness:.7});
  const stone=new THREE.MeshStandardMaterial({color:0xb59e77,roughness:1});
  const red=new THREE.MeshStandardMaterial({color:0xa86949,roughness:1});
  const green=new THREE.MeshStandardMaterial({color:0x5e8050,roughness:1});
  const cube=new THREE.BoxGeometry(1,1,1);
  function box(w,h,d,mat,x,y,z){const m=new THREE.Mesh(cube,mat);m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;world.add(m);return m;}
  function texture(draw){const c=document.createElement('canvas');c.width=c.height=256;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
  // A coastal point and a low fortress frame the recognizable striped lighthouse.
  const shore=new THREE.Shape();shore.moveTo(-8,6);shore.lineTo(7,6);shore.lineTo(6,2);shore.lineTo(4,-3);shore.quadraticCurveTo(1,-6,-3,-4.5);shore.lineTo(-6,-1);shore.closePath();
  const ground=new THREE.Mesh(new THREE.ExtrudeGeometry(shore,{depth:.65,bevelEnabled:true,bevelThickness:.15,bevelSize:.25,bevelSegments:2,steps:1}),stone);ground.rotation.x=-Math.PI/2;ground.position.y=-.65;ground.receiveShadow=true;world.add(ground);
  box(5,.55,3.8,stone,0,.22,0);box(4.8,.15,3.6,white,0,.56,0);box(3.8,.85,2.7,white,0,1,0);box(4,.12,2.9,red,0,1.48,0);
  for(const x of [-1.4,-.7,.7,1.4]){box(.23,.38,.08,black,x,1,1.39);box(.3,.05,.12,stone,x,.78,1.42);}
  box(.42,.7,.1,black,0,.91,1.4);
  for(const x of [-2.2,2.2])for(const z of [-1.6,1.6])box(.45,.32,.45,white,x,.75,z);
  for(let i=0;i<8;i++){
    const lower=.49-i*.018,upper=lower-.018;
    const stripe=new THREE.Mesh(new THREE.CylinderGeometry(upper,lower,.45,32),i%2?black:white);stripe.position.set(0,1.7+i*.45,0);stripe.castShadow=true;world.add(stripe);
  }
  const gallery=new THREE.Mesh(new THREE.CylinderGeometry(.58,.5,.15,32),white);gallery.position.y=5.18;world.add(gallery);
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.46,16),new THREE.MeshStandardMaterial({color:0xadc5c8,metalness:.35,roughness:.2}));glass.position.y=5.48;world.add(glass);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;box(.04,.5,.04,black,Math.cos(a)*.34,5.48,Math.sin(a)*.34);}
  const canopy=new THREE.Mesh(new THREE.ConeGeometry(.56,.42,24),black);canopy.position.y=5.91;world.add(canopy);box(.035,.4,.035,black,0,6.25,0);
  // A seafront walk with a few low buildings, all on the mainland side.
  for(let i=0;i<5;i++){
    const x=-5+i*2.1,z=-4.5,h=1.1+(i%3)*.3;
    box(1.8,h,1.3,new THREE.MeshStandardMaterial({color:[0xd5ac67,0x9fb6ba,0xd4b6a1,0xb5c2a3,0xe3d2ae][i],roughness:1}),x,h/2,z);
    box(1.95,.18,1.45,red,x,h+.05,z);
    for(const dx of [-.5,0,.5])box(.2,.38,.05,black,x+dx,h*.58,z+.67);
  }
  const trunkMat=new THREE.MeshStandardMaterial({color:0x80674b,roughness:1});
  const leafGeometry=new THREE.SphereGeometry(1,8,4);
  for(const [x,z]of [[-3.8,1.5],[3.7,-1.8],[-5,-2]]){
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.07,.11,1.8,8),trunkMat);trunk.position.set(x,.9,z);trunk.castShadow=true;world.add(trunk);
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const leaf=new THREE.Mesh(leafGeometry,green);leaf.scale.set(.9,.07,.17);leaf.rotation.z=-.2;leaf.rotation.y=a;leaf.position.set(x+Math.cos(a)*.47,1.85,z-Math.sin(a)*.47);leaf.castShadow=true;world.add(leaf);}
  }
  const waterMap=texture(ctx=>{ctx.fillStyle='#6fb2b9';ctx.fillRect(0,0,256,256);for(let y=0;y<256;y+=5){ctx.strokeStyle='#f8edcf24';ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(65,y-2,160,y+2,256,y);ctx.stroke();}});waterMap.wrapS=waterMap.wrapT=THREE.RepeatWrapping;waterMap.repeat.set(45,45);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x3e9fae,map:waterMap,roughness:.4,metalness:.15}));sea.rotation.x=-Math.PI/2;sea.position.y=-.9;sea.receiveShadow=true;world.add(sea);
  const sailGeo=new THREE.BufferGeometry();sailGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,1.1,0,.6,0,0],3));sailGeo.computeVertexNormals();
  const sailMat=new THREE.MeshStandardMaterial({color:0xffe4a5,side:THREE.DoubleSide});
  for(const [x,z]of [[8,-10],[-9,-14],[13,-22],[-6,9]]){box(.8,.12,.25,black,x,-.77,z);box(.025,1.2,.025,stone,x,-.2,z);const sail=new THREE.Mesh(sailGeo,sailMat);sail.position.set(x,-.65,z);world.add(sail);}
  const skyMap=texture(ctx=>{const g=ctx.createLinearGradient(0,0,0,256);g.addColorStop(0,'#52839b');g.addColorStop(.5,'#a3bcc2');g.addColorStop(.8,'#f1d5b0');g.addColorStop(1,'#dca77f');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(70,24,12),new THREE.MeshBasicMaterial({map:skyMap,side:THREE.BackSide,toneMapped:false,fog:false}));world.add(sky);
  const sun=new THREE.DirectionalLight(0xffd5a4,3);sun.position.set(-9,14,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:50});sun.shadow.normalBias=.03;sun.shadow.intensity=.45;world.add(sun);
  world.add(new THREE.HemisphereLight(0xbcd8e8,0x8f7658,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
}
