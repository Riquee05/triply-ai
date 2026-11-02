import * as THREE from 'three';

export function earthPoint(lat,lon,radius=4){const p=THREE.MathUtils.degToRad(lat),l=THREE.MathUtils.degToRad(lon);return new THREE.Vector3(Math.cos(p)*Math.cos(l)*radius,Math.sin(p)*radius,-Math.cos(p)*Math.sin(l)*radius);}

export function createObservatory(world){
  const globe=new THREE.Group();world.add(globe);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#123d54';ctx.fillRect(0,0,1024,512);
  const continents=[
    [[-81,12],[-72,11],[-62,10],[-50,3],[-35,-6],[-39,-19],[-48,-29],[-54,-39],[-67,-55],[-73,-48],[-75,-30],[-80,-8]],
    [[-168,66],[-140,69],[-125,58],[-108,74],[-81,73],[-55,52],[-63,45],[-81,25],[-89,21],[-86,16],[-80,9],[-96,17],[-113,29],[-126,49],[-151,59]],
    [[-17,35],[0,37],[16,33],[32,31],[43,12],[51,11],[43,-12],[32,-29],[18,-35],[10,-20],[1,5],[-15,12]],
    [[-10,36],[-9,44],[5,49],[11,59],[25,71],[55,72],[85,75],[140,66],[177,58],[151,46],[132,32],[123,19],[108,0],[99,6],[80,8],[70,23],[48,29],[36,40],[23,39]],
    [[112,-11],[135,-11],[153,-26],[145,-39],[116,-34]],
    [[-52,60],[-43,60],[-22,76],[-42,83],[-61,78]],[[130,32],[142,45],[146,39],[137,31]],[[47,-13],[50,-17],[46,-26],[43,-24]],
  ];
  ctx.fillStyle='#6d9e96';ctx.strokeStyle='#c1d9bd';ctx.lineWidth=1;
  for(const polygon of continents){ctx.beginPath();polygon.forEach(([lon,lat],i)=>{const x=(lon+180)/360*1024,y=(90-lat)/180*512;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.strokeStyle='#c7e3da16';ctx.lineWidth=1;
  for(let x=0;x<1024;x+=1024/24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke();}
  for(let y=0;y<512;y+=512/12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1024,y);ctx.stroke();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const earth=new THREE.Mesh(new THREE.SphereGeometry(4,64,40),new THREE.MeshStandardMaterial({map,roughness:.9,metalness:.05}));globe.add(earth);
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(4.1,48,32),new THREE.MeshBasicMaterial({color:0x73c9ec,transparent:true,opacity:.12,side:THREE.BackSide,depthWrite:false}));globe.add(atmosphere);
  const start=earthPoint(-23.55,-46.63,4.04),end=earthPoint(-12.97,-38.5,4.04),mid=start.clone().add(end).normalize();
  globe.quaternion.setFromUnitVectors(mid,new THREE.Vector3(-.12,-.03,1).normalize());
  const points=Array.from({length:49},(_,i)=>{const t=i/48;return start.clone().lerp(end,t).normalize().multiplyScalar(4.06+Math.sin(t*Math.PI)*.65);});
  const curve=new THREE.CatmullRomCurve3(points);
  const route=new THREE.Mesh(new THREE.TubeGeometry(curve,48,.035,6,false),new THREE.MeshBasicMaterial({color:0xf3d18d}));globe.add(route);
  const targets=[route];
  for(const [name,position,dy]of [['SÃO PAULO',start,-.38],['SALVADOR',end,.4]]){
    const marker=new THREE.Mesh(new THREE.SphereGeometry(.095,16,10),new THREE.MeshBasicMaterial({color:0xffe2a1}));marker.position.copy(position);globe.add(marker);targets.push(marker);
    const c=document.createElement('canvas');c.width=256;c.height=64;const cctx=c.getContext('2d');cctx.fillStyle='#102731dd';cctx.fillRect(0,0,256,64);cctx.fillStyle='#f5dfb5';cctx.font='bold 22px Arial';cctx.textAlign='center';cctx.fillText(name,128,40);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));label.position.copy(position).add(new THREE.Vector3(0,dy,.2));label.scale.set(1.6,.4,1);globe.add(label);
  }
  // Deterministic star field; no continuous motion or remote textures.
  const stars=[];let seed=1973;for(let i=0;i<400;i++){seed=(seed*1664525+1013904223)>>>0;const a=seed/4294967296*Math.PI*2;seed=(seed*1664525+1013904223)>>>0;const y=seed/4294967296*2-1;const r=40+ i%20;stars.push(Math.cos(a)*Math.sqrt(1-y*y)*r,y*r,Math.sin(a)*Math.sqrt(1-y*y)*r);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));world.add(new THREE.Points(geometry,new THREE.PointsMaterial({color:0xb3d5df,size:.07,transparent:true,opacity:.6})));
  world.add(new THREE.HemisphereLight(0xbbdeec,0x142d3c,1.9));const sun=new THREE.DirectionalLight(0xffe6b5,2.5);sun.position.set(-5,5,9);world.add(sun);
  return {targets,focus:new THREE.Vector3(0,-.5,0)};
}
