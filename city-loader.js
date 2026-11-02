import * as THREE from 'three';
import { OBJLoader } from './vendor/OBJLoader.js';

export async function loadCityMaterials(){
  const response=await fetch('./assets/salvador/salvador_bahia.mtl');
  if(!response.ok)throw Error('Materiais indisponíveis');
  const source=await response.text(),definitions={};let current;
  for(const line of source.split(/\r?\n/)){
    const [key,...values]=line.trim().split(/\s+/);
    if(key==='newmtl'){current={};definitions[values[0]]=current;}
    else if(current&&key==='Kd')current.color=values.map(Number);
    else if(current&&key==='map_Kd')current.map=values.join(' ');
  }
  const loader=new THREE.TextureLoader(),materials={};
  try{
    // Terrain and water already share one mesh; asphalt has no separate road mesh.
    for(const name of ['m_farol','m_pelourinho']){
      const definition=definitions[name];if(!definition)continue;
      const material=new THREE.MeshStandardMaterial({roughness:.85,side:THREE.DoubleSide});materials[name]=material;
      if(definition.color)material.color.setRGB(...definition.color,THREE.SRGBColorSpace);
      if(['texture_farol.png','texture_pelourinho.png'].includes(definition.map)){
        const map=await loader.loadAsync('./assets/salvador/'+definition.map);map.colorSpace=THREE.SRGBColorSpace;material.map=map;
      }
    }
    return materials;
  }catch(error){disposeCityMaterials(materials);throw error;}
}

export function disposeCityMaterials(materials){for(const m of Object.values(materials)){m.map?.dispose();m.dispose();}}

function mapFacades(mesh,material,cylindrical=false){
  const geometry=mesh.geometry;geometry.computeBoundingBox();
  const bounds=geometry.boundingBox,size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const position=geometry.attributes.position,uv=new Float32Array(position.count*2),sides=[],roofs=[];
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),faceNormal=new THREE.Vector3();
  geometry.clearGroups();
  for(let i=0;i<position.count;i+=3){
    a.fromBufferAttribute(position,i);b.fromBufferAttribute(position,i+1);c.fromBufferAttribute(position,i+2);
    faceNormal.subVectors(b,a).cross(c.sub(a)).normalize();
    const roof=Math.abs(faceNormal.y)>.7;(roof?roofs:sides).push(i,i+1,i+2);
    for(let k=i;k<i+3;k++){
      const x=position.getX(k),y=position.getY(k),z=position.getZ(k);
      uv[k*2]=cylindrical?Math.atan2(z-center.z,x-center.x)/(2*Math.PI)+.5:
        Math.abs(faceNormal.x)>.5?(z-bounds.min.z)/(size.z||1):(x-bounds.min.x)/(size.x||1);
      uv[k*2+1]=(y-bounds.min.y)/(size.y||1);
    }
  }
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  geometry.setIndex([...sides,...roofs]);geometry.addGroup(0,sides.length,0);geometry.addGroup(sides.length,roofs.length,1);
  const roof=material.clone();roof.map=null;roof.color.setHex(cylindrical?0xe0ded2:0xa66e55);
  mesh.material=[material,roof];
}

export function parseCity(text,materials={}){
  const model=new OBJLoader().parse(text);
  if(!model.children.length)throw Error('Modelo de Salvador vazio');
  const bounds=new THREE.Box3().setFromObject(model);
  const center=bounds.getCenter(new THREE.Vector3());
  const size=bounds.getSize(new THREE.Vector3());
  const scale=16/Math.max(size.x,size.z);
  const palette=[0xe1c186,0xd8977c,0x9fbab2,0xe4d3ac,0x89a9bc];
  model.children.forEach((mesh,i)=>{
    const old=Array.isArray(mesh.material)?mesh.material:[mesh.material];old.forEach(m=>m.dispose());
    mesh.geometry.computeVertexNormals();
    if(i===0){
      const position=mesh.geometry.attributes.position,colors=new Float32Array(position.count*3);
      const sea=new THREE.Color(0x246277),beach=new THREE.Color(0xcdb987),land=new THREE.Color(0x6d8d6f),high=new THREE.Color(0x9da47c);
      for(let v=0;v<position.count;v++){
        const h=position.getY(v);const color=h<0?sea:h<3?beach:land.clone().lerp(high,Math.min(1,(h-3)/22));
        color.toArray(colors,v*3);
      }
      mesh.geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
      mesh.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide});
    }else{
      mesh.material=new THREE.MeshStandardMaterial({color:i===1||i===23?0xe5e2d5:palette[i%palette.length],roughness:.8,side:THREE.DoubleSide});
      const assigned=i===23?materials.m_farol:i>=2&&i<=22?materials.m_pelourinho:null;
      if(assigned){mesh.material.dispose();mapFacades(mesh,assigned,i===23);}
    }
  });
  model.scale.setScalar(scale);model.position.set(-center.x*scale,-.7-bounds.min.y*scale,-center.z*scale);
  // Illustrative anchors inferred from the supplied geometry, not georeferenced.
  const raw={pelourinho:[7,29,-22],lacerda:[-13.2,31,-12],barra:[-16,15,66]};
  const anchors=Object.fromEntries(Object.entries(raw).map(([id,xyz])=>[id,new THREE.Vector3(...xyz).multiplyScalar(scale).add(model.position)]));
  return {model,anchors};
}
