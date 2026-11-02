import * as THREE from 'three';

// An artistic, explorable district. It is not a geographic reconstruction.
export function createSalvadorDistrict(world,renderer){
  const district=new THREE.Group();district.name='Centro Histórico — estudo artístico';world.add(district);
  const cube=new THREE.BoxGeometry(1,1,1),batches=new Map();
  function mat(color,roughness=.85){return new THREE.MeshStandardMaterial({color,roughness});}
  const stone=mat(0xd4bc91),trim=mat(0xf1dfbd),dark=mat(0x283e42),wood=mat(0x4f685d),iron=mat(0x3d4541),trunk=mat(0x6f5540),green=mat(0x547145),sand=mat(0xbaaa88);
  const palette=[0xc9a451,0x8ba8b1,0xc98673,0xcfc4a2,0x88a99a,0xb9b1bc,0xe0c27d];
  function block(w,h,d,material,x,y,z,parent=district){const m=new THREE.Mesh(cube,material);m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function instance(w,h,d,material,x,y,z,parent=district){
    parent.updateWorldMatrix(true,false);district.updateWorldMatrix(true,false);
    const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(w,h,d));
    matrix.premultiply(parent.matrixWorld).premultiply(district.matrixWorld.clone().invert());
    if(!batches.has(material))batches.set(material,[]);batches.get(material).push(matrix);
  }
  function canvasTexture(draw){const c=document.createElement('canvas');c.width=c.height=256;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
  const tiles=canvasTexture(ctx=>{ctx.fillStyle='#ab6543';ctx.fillRect(0,0,256,256);for(let y=0;y<256;y+=16)for(let x=0;x<256;x+=12){ctx.fillStyle=`rgb(${160+(x+y)%30},${88+(x*3+y)%25},${55+(x+y*2)%18})`;ctx.fillRect(x+(y%32?6:0),y,10,15);ctx.fillStyle='#edb17b55';ctx.fillRect(x+(y%32?6:0),y,2,13);}});tiles.repeat.set(3,2);
  const roofMat=new THREE.MeshStandardMaterial({map:tiles,roughness:1,side:THREE.DoubleSide});
  const roofGeometry=new THREE.BufferGeometry();
  const verts=[-.5,0,-.5,.5,0,-.5,0,1,-.5,-.5,0,.5,.5,0,.5,0,1,.5];
  roofGeometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));roofGeometry.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,2,5,4,2,4,1]);roofGeometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1,0,1,1,1,.5,0],2));roofGeometry.computeVertexNormals();
  function roof(w,h,d,x,y,z,parent=district){const m=new THREE.Mesh(roofGeometry,roofMat);m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  function house(x,z,w,h,d,color,rotation=0){
    const g=new THREE.Group();g.name='Casarão';g.userData.building=true;g.position.set(x,0,z);g.rotation.y=rotation;district.add(g);
    block(w,h,d,mat(color),0,h/2,0,g);roof(w+.22,.6,d+.22,0,h,0,g);
    block(w+.12,.13,d+.12,trim,0,.14,0,g);block(w+.16,.12,d+.16,trim,0,h-.05,0,g);
    const levels=Math.max(2,Math.round(h/1.25)),columns=Math.max(2,Math.round(w/.85));
    for(let level=0;level<levels;level++)for(let col=0;col<columns;col++){
      const px=(col-(columns-1)/2)*w/(columns+.3),py=.65+level*(h-.8)/levels,pz=d/2;
      instance(.47,.75,.1,trim,px,py,pz+.03,g);instance(.33,.57,.12,dark,px,py,pz+.085,g);
      instance(.035,.58,.035,trim,px,py,pz+.16,g);instance(.34,.035,.035,trim,px,py+.03,pz+.16,g);
      instance(.13,.61,.06,wood,px-.27,py,pz+.12,g);instance(.13,.61,.06,wood,px+.27,py,pz+.12,g);
      if(level===1){instance(.65,.06,.35,stone,px,py-.4,pz+.19,g);instance(.65,.05,.04,iron,px,py-.1,pz+.36,g);for(const dx of [-.27,0,.27])instance(.025,.3,.025,iron,px+dx,py-.25,pz+.36,g);}
    }
    for(const [px,pz,angle,span]of [[-w/2,0,-Math.PI/2,d],[w/2,0,Math.PI/2,d],[0,-d/2,Math.PI,w]]){
      const side=new THREE.Group();side.position.set(px,0,pz);side.rotation.y=angle;g.add(side);
      const cols=Math.max(2,Math.round(span/.9));
      for(let row=0;row<levels;row++)for(let col=0;col<cols;col++){
        const x=(col-(cols-1)/2)*span/(cols+.3),y=.65+row*(h-.8)/levels;
        instance(.45,.7,.07,trim,x,y,.035,side);instance(.31,.53,.08,dark,x,y,.09,side);
        instance(.025,.53,.025,trim,x,y,.14,side);instance(.31,.025,.025,trim,x,y+.03,.14,side);
      }
    }
    block(.6,1.05,.13,wood,0,.53,d/2+.08,g);block(.72,.09,.2,trim,0,1.12,d/2+.12,g);
    return g;
  }

  // Raised ground and a paved square, rather than isolated miniature blocks.
  // Enclose every house footprint, including the second waterfront block.
  const mainland=block(40,1.5,41,sand,-2,-.8,-2.5);mainland.userData.mainland=true;
  const paving=canvasTexture(ctx=>{ctx.fillStyle='#aaa28f';ctx.fillRect(0,0,256,256);for(let y=0;y<256;y+=12)for(let x=0;x<256;x+=18){ctx.fillStyle=`rgb(${150+(x+y)%30},${144+(x*2+y)%26},${125+(x+y*3)%24})`;ctx.fillRect(x+(y%24?9:0),y,16,10);}});paving.repeat.set(10,10);
  const plaza=new THREE.MeshStandardMaterial({map:paving,color:0xe0d4b7,roughness:1});block(23,.08,23,plaza,0,0,2);
  for(const x of [-6.5,6.5])block(.22,.12,22,trim,x,.07,1);
  // Close streets with varied roof lines. The front remains open to the camera.
  for(let i=0;i<7;i++){
    house(-9,-7+i*3.15,2.9,2.8+(i%3)*.6,3.2,palette[i%7],Math.PI/2);
    house(9,-6+i*3.15,2.9,3.1+(i%3)*.5,3,palette[(i+3)%7],-Math.PI/2);
  }
  for(let i=0;i<7;i++)house(-10+i*3.1,-9.8,2.9,2.6+(i%4)*.45,2.8,palette[(i+1)%7]);
  for(let i=0;i<8;i++)house(-11+i*3.05,15.1,2.8,2.4+(i%3)*.6,2.4,palette[(i+4)%7],Math.PI);
  // Second blocks give the city a continuous silhouette toward the waterfront.
  for(let i=0;i<14;i++)house(-18+(i%7)*3,-16-Math.floor(i/7)*3.3,2.7,1.8+(i%4)*.45,2.8,palette[(i+2)%7]);

  // A church with twin towers, a pediment and a recessed central doorway.
  const church=new THREE.Group();church.position.set(-3.7,0,-5.8);district.add(church);
  block(5,3.8,4,stone,0,1.9,0,church);roof(5.2,1.15,4.2,0,3.8,0,church);
  for(const x of [-2.15,2.15]){
    block(1.2,5.8,1.5,stone,x,2.9,1.3,church);block(1.4,.18,1.7,trim,x,4.2,1.3,church);block(1.4,.16,1.7,trim,x,5.6,1.3,church);
    block(.48,.9,.1,dark,x,4.9,2.1,church);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(.72,12,8,0,Math.PI*2,0,Math.PI/2),stone);dome.position.set(x,5.75,1.3);church.add(dome);
    block(.06,.65,.06,iron,x,6.65,1.3,church);block(.36,.06,.06,iron,x,6.77,1.3,church);
  }
  block(1.15,1.85,.12,wood,0,.95,2.1,church);block(1.4,.13,.3,trim,0,1.95,2.12,church);
  for(const x of [-1.2,1.2])block(.5,.85,.14,dark,x,2.75,2.08,church);

  // Monument, benches and trees create a human-scale plaza.
  block(1.45,.25,1.45,stone,0,.2,3);block(.85,1.1,.85,stone,0,.85,3);block(.4,1.1,.35,iron,0,1.9,3);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),stone);head.position.set(0,2.62,3);district.add(head);
  const foliageGeometry=new THREE.IcosahedronGeometry(1,1),crowns=[];
  function tree(x,z,scale=1,y=0){instance(.12,1.4*scale,.12,trunk,x,y+.7*scale,z);crowns.push({x,y:y+1.7*scale,z,scale});}
  for(const [x,z]of [[-5,7],[5,7],[-5,0],[5,0],[-5,11],[5,11]]){
    tree(x,z);block(1.5,.25,1.5,stone,x,.16,z);
    for(const dx of [-1,1]){instance(.65,.09,.28,wood,x+dx,.5,z+1);instance(.05,.45,.2,iron,x+dx,.24,z+1);}
  }
  // Art-inspired Lacerda silhouette overlooking the bay.
  const elevator=new THREE.Group();elevator.position.set(13,-.9,-12);district.add(elevator);
  for(const x of [-1.4,1.4]){block(.7,5.8,1,trim,x,2.9,0,elevator);block(.14,4.9,1.03,stone,x,2.9,0,elevator);}
  block(4.6,.8,1.6,stone,0,5.4,0,elevator);block(4.3,.38,1.64,dark,0,5.5,0,elevator);
  for(let x=-2;x<=2;x+=.3)instance(.045,.4,.06,trim,x,5.5,.84,elevator);
  block(1.4,2.1,1.5,trim,-1.4,6.85,0,elevator);

  const seaGeometry=new THREE.PlaneGeometry(220,220);
  const waterTexture=canvasTexture(ctx=>{ctx.fillStyle='#71b7bc';ctx.fillRect(0,0,256,256);for(let y=0;y<256;y+=4){ctx.strokeStyle=y%12?'#f4edcc20':'#286f811c';ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(60,y-2,160,y+2,256,y);ctx.stroke();}});waterTexture.repeat.set(35,35);
  const sea=new THREE.Mesh(seaGeometry,new THREE.MeshStandardMaterial({color:0x39a6b3,map:waterTexture,roughness:.4,metalness:.25}));sea.rotation.x=-Math.PI/2;sea.position.set(0,-1.7,-50);sea.receiveShadow=true;district.add(sea);
  const islandGeometry=new THREE.SphereGeometry(1,18,9);
  for(const [x,z,s]of [[-18,-35,6],[5,-48,7],[27,-33,5],[-35,-59,8],[42,-61,10]]){
    const island=new THREE.Mesh(islandGeometry,green);island.scale.set(s,.8,s*.5);island.position.set(x,-1.35,z);district.add(island);
    for(let i=0;i<8;i++)tree(x+Math.sin(i*2.4)*s*.65,z+Math.cos(i*2.4)*s*.25,.4,-.9);
  }
  // Stylized boats remain static, keeping the scene quiet and inexpensive.
  const sailGeometry=new THREE.BufferGeometry();sailGeometry.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,1,0,.6,0,0],3));sailGeometry.computeVertexNormals();
  const sailMat=new THREE.MeshStandardMaterial({color:0xffe5a7,side:THREE.DoubleSide,roughness:1});
  for(let i=0;i<9;i++){const x=-22+i*6,z=-23-(i%3)*8;block(.8,.15,.25,wood,x,-1.5,z);instance(.025,1.1,.025,iron,x,-.9,z);const sail=new THREE.Mesh(sailGeometry,sailMat);sail.position.set(x,-1.3,z);district.add(sail);}
  // Farol on a small coastal point; preserved as an illustrative destination.
  const farolBase=new THREE.Mesh(islandGeometry,sand);farolBase.scale.set(3,.75,2.8);farolBase.position.set(-20,-1.1,-24);farolBase.receiveShadow=true;district.add(farolBase);
  const farol=new THREE.Group();farol.position.set(-20,-.35,-24);district.add(farol);
  for(let i=0;i<7;i++){const ring=new THREE.Mesh(new THREE.CylinderGeometry(.3-i*.013,.31-i*.013,.45,16),i%2?dark:trim);ring.position.y=i*.45;farol.add(ring);}
  block(.7,.18,.7,stone,0,3,0,farol);

  for(const [material,matrices]of batches){const batch=new THREE.InstancedMesh(cube,material,matrices.length);matrices.forEach((m,i)=>batch.setMatrixAt(i,m));batch.castShadow=true;batch.receiveShadow=true;district.add(batch);}
  const leaves=new THREE.InstancedMesh(foliageGeometry,green,crowns.length),matrix=new THREE.Matrix4();crowns.forEach((p,i)=>{matrix.compose(new THREE.Vector3(p.x,p.y,p.z),new THREE.Quaternion(),new THREE.Vector3(p.scale*.9,p.scale*.62,p.scale*.8));leaves.setMatrixAt(i,matrix);});leaves.castShadow=true;district.add(leaves);

  const skyMap=canvasTexture(ctx=>{const g=ctx.createLinearGradient(0,0,0,256);g.addColorStop(0,'#65a3c0');g.addColorStop(.55,'#c6d7d1');g.addColorStop(.8,'#f6d8ad');g.addColorStop(1,'#eab98f');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(110,24,12),new THREE.MeshBasicMaterial({map:skyMap,side:THREE.BackSide,fog:false,toneMapped:false}));district.add(sky);
  const sun=new THREE.DirectionalLight(0xffd3a0,3.1);sun.position.set(-18,22,8);sun.target.position.set(0,0,0);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:80});sun.shadow.bias=-.0003;sun.shadow.normalBias=.06;sun.shadow.intensity=.55;district.add(sun,sun.target);
  district.add(new THREE.HemisphereLight(0xc2dce8,0x8b7352,1.9));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  return {anchors:{pelourinho:new THREE.Vector3(0,1.2,3),lacerda:new THREE.Vector3(13,6.8,-12),barra:new THREE.Vector3(-20,2.8,-24)}};
}
