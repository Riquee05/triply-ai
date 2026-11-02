import * as THREE from 'three';
import { TDSLoader } from './vendor/TDSLoader.js';

// 3DS stores reusable meshes separately from their positioned instances.
// TDSLoader reads the meshes; this adapter assembles the static scene at frame 0.
export function parseAircraft(buffer) {
  const view = new DataView(buffer);
  const string = offset => {
    let end = offset;
    while (end < view.byteLength && view.getUint8(end)) end++;
    return [new TextDecoder().decode(new Uint8Array(buffer, offset, end-offset)), end+1];
  };
  function chunks(start, end) {
    const result=[];
    for(let p=start;p+6<=end;){
      const size=view.getUint32(p+2,true);
      if(size<6||p+size>end)throw Error('Estrutura 3DS inválida');
      result.push({id:view.getUint16(p,true),start:p+6,end:p+size});p+=size;
    }
    return result;
  }
  const vector=p=>new THREE.Vector3(view.getFloat32(p,true),view.getFloat32(p+4,true),view.getFloat32(p+8,true));
  function key(chunk, rotation=false) {
    if(view.getUint32(chunk.start+10,true)===0)return null;
    let p=chunk.start+14+4;
    const flags=view.getUint16(p,true);p+=2;
    for(let bit=0;bit<5;bit++)if(flags&(1<<bit))p+=4;
    if(rotation){const angle=view.getFloat32(p,true),axis=vector(p+4);return axis.lengthSq()?new THREE.Quaternion().setFromAxisAngle(axis.normalize(),-angle):new THREE.Quaternion();}
    return vector(p);
  }
  const root=chunks(0,view.byteLength)[0];
  const top=chunks(root.start,root.end);
  const meshChunk=top.find(c=>c.id===0x3d3d);
  const frames=top.find(c=>c.id===0xb000);
  const original=new TDSLoader().parse(buffer,'./assets/aircraft/');
  if(!frames)return original;
  const matrices=new Map();
  for(const object of chunks(meshChunk.start,meshChunk.end).filter(c=>c.id===0x4000)){
    const [name,offset]=string(object.start);
    const mesh=chunks(offset,object.end).find(c=>c.id===0x4100);
    const transform=mesh&&chunks(mesh.start,mesh.end).find(c=>c.id===0x4160);
    if(transform){const v=Array.from({length:12},(_,i)=>view.getFloat32(transform.start+i*4,true));matrices.set(name,new THREE.Matrix4().set(v[0],v[3],v[6],v[9],v[1],v[4],v[7],v[10],v[2],v[5],v[8],v[11],0,0,0,1));}
  }
  const sources=new Map();
  original.updateMatrixWorld(true);
  for(const mesh of original.children){
    // Recover the original world vertices, then the source mesh's local space.
    mesh.geometry.applyMatrix4(mesh.matrix);
    const matrix=matrices.get(mesh.name);
    if(matrix){
      mesh.geometry.applyMatrix4(matrix.clone().invert());
      // 3DS keyframe scales omit the reflection stored in the mesh matrix.
      // Recover that handedness before positioning mirrored instances.
      if(matrix.determinant()<0)mesh.geometry.scale(-1,1,1);
    }
    sources.set(mesh.name,mesh);
  }
  const result=new THREE.Group(),nodes=new Map(),parents=[];
  result.scale.copy(original.scale);
  for(const tag of chunks(frames.start,frames.end).filter(c=>c.id===0xb002)){
    let name='',instance='',id=nodes.size,parent=-1,pivot=new THREE.Vector3(),position=new THREE.Vector3(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3(1,1,1);
    for(const c of chunks(tag.start,tag.end)){
      if(c.id===0xb010){let p;[name,p]=string(c.start);parent=view.getInt16(p+4,true);}
      else if(c.id===0xb011)[instance]=string(c.start);
      else if(c.id===0xb030)id=view.getUint16(c.start,true);
      else if(c.id===0xb013)pivot=vector(c.start);
      else if(c.id===0xb020)position=key(c)||position;
      else if(c.id===0xb021)rotation=key(c,true)||rotation;
      else if(c.id===0xb022)scale=key(c)||scale;
    }
    const node=new THREE.Group();node.name=instance||name;node.position.copy(position);node.quaternion.copy(rotation);node.scale.copy(scale);
    const source=sources.get(name);
    if(source){const mesh=new THREE.Mesh(source.geometry,source.material);mesh.position.copy(pivot).negate();node.add(mesh);}
    nodes.set(id,node);parents.push({node,parent});
  }
  for(const {node,parent}of parents)(nodes.get(parent)||result).add(node);
  result.userData.instanceCount=parents.length;
  return result;
}
