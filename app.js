import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { TDSLoader } from './vendor/TDSLoader.js';
const $=s=>document.querySelector(s);
const places=[{id:'pelourinho',name:'Pelourinho',note:'Cores, história e arquitetura no Centro Histórico.',x:-3,z:0,color:0xe3ac7b},{id:'barra',name:'Farol da Barra',note:'Uma pausa para contemplar o mar e o farol.',x:3,z:2,color:0xf2e7ca},{id:'lacerda',name:'Elevador Lacerda',note:'Um encontro entre a Cidade Alta e a Cidade Baixa.',x:0,z:-3,color:0xd8c7a2}];
let plan=[],persist=true;try{const saved=JSON.parse(localStorage.getItem('triply-plan')||'[]');if(Array.isArray(saved))plan=saved.filter(p=>places.some(l=>l.id===p.id)&&['12','13','14'].includes(p.day));}catch{persist=false;}
let noticeTimer;function notify(t){$('#status').textContent=t;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#status').textContent='',4000);}
function save(){try{localStorage.setItem('triply-plan',JSON.stringify(plan));}catch{persist=false;notify('Não foi possível salvar neste navegador. Exporte seu roteiro.');}renderPlan();}
function renderPlan(){const day=$('#day').value;$('#itinerary').replaceChildren();const list=plan.filter(p=>p.day===day);$('#total').textContent=list.length;$('#empty').hidden=!!list.length;list.forEach(p=>{const li=document.createElement('li');li.textContent=places.find(l=>l.id===p.id).name;const b=document.createElement('button');b.textContent='×';b.setAttribute('aria-label','Remover '+li.textContent);b.onclick=()=>{plan=plan.filter(x=>x!==p);save();};li.append(b);$('#itinerary').append(li);});}
places.forEach(p=>{const b=document.createElement('button');b.textContent='+ '+p.name;b.onclick=()=>{selectPlace(p);if(plan.some(x=>x.id===p.id&&x.day===$('#day').value))return notify('Este lugar já está no dia selecionado.');plan.push({id:p.id,day:$('#day').value});save();notify(persist?'Adicionado e salvo no navegador.':'Adicionado. Exporte para guardar.');};$('#places').append(b);});
$('#day').onchange=renderPlan;renderPlan();
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({destination:'Salvador',dates:'2027-03-12/2027-03-14',itinerary:plan.map(p=>({...p,name:places.find(l=>l.id===p.id).name}))},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='triply-roteiro.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('#count').textContent=Math.max(0,Math.ceil((new Date('2027-03-12T00:00:00-03:00')-Date.now())/86400000));
let renderer,scene,camera,controls,world,sceneName='central',targets=[],sceneVersion=0,aircraftData;
async function loadAircraft(version){
$('#intro').textContent='Preparando sua aeronave 3D…';
try{
aircraftData??=fetch('./assets/aircraft/aircraft.3ds').then(r=>{if(!r.ok)throw Error('Modelo indisponível');return r.arrayBuffer();}).catch(error=>{aircraftData=undefined;throw error;});
const data=await aircraftData;if(sceneName!=='hangar'||version!==sceneVersion)return;
const aircraft=new TDSLoader().parse(data,'./assets/aircraft/');
// O arquivo original usa Z como eixo vertical. O hangar usa Y.
aircraft.rotation.x=-Math.PI/2;aircraft.rotation.z=Math.PI/2;
aircraft.updateMatrixWorld(true);
let bounds=new THREE.Box3().setFromObject(aircraft);
const size=bounds.getSize(new THREE.Vector3());const scale=10.8/Math.max(size.x,size.y,size.z);
aircraft.scale.setScalar(scale);aircraft.updateMatrixWorld(true);bounds=new THREE.Box3().setFromObject(aircraft);
const center=bounds.getCenter(new THREE.Vector3());aircraft.position.set(-center.x,-.8-bounds.min.y,-center.z);
aircraft.traverse(o=>{if(o.isMesh){const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){m.side=THREE.DoubleSide;m.shininess=Math.min(m.shininess||30,60);}o.geometry.computeVertexNormals();}});
world.add(aircraft);$('#intro').textContent='Seu modelo 3D · arraste para observar cada detalhe.';renderer.render(scene,camera);
}catch(error){console.warn('Falha ao abrir aeronave',error);if(version===sceneVersion){$('#intro').textContent='Não foi possível abrir a aeronave.';notify('Use Visão geral para tentar carregar o modelo novamente.');}}
}
const titles={central:['O mundo espera.<br><em>Salvador também.</em>','Uma viagem em família. Um novo jeito de explorar.'],hangar:['Sua próxima<br><em>decolagem.</em>','Aeronave conceitual · dados de voo ainda não cadastrados.'],observatory:['Um novo ponto<br><em>no seu mundo.</em>','São Paulo → Salvador · rota ilustrativa, sem rastreamento ao vivo.'],salvador:['Entre cores,<br><em>mar e histórias.</em>','Escolha um lugar no cenário ou adicione pela lista.' ]};
function material(color){return new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.15});}
function box(w,h,d,color,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);world.add(m);return m;}
function sphere(r,color,x,y,z){const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,20),material(color));m.position.set(x,y,z);world.add(m);return m;}
function selectPlace(p){$('#panel-title').textContent=p.name;$('#detail').textContent=p.note+' Conteúdo conceitual; confirme horários e acesso antes de visitar.';if(controls&&sceneName==='salvador'){controls.target.set(p.x,.5,p.z);controls.update();}}
function build(name){sceneName=name;document.body.dataset.scene=name;const version=++sceneVersion;$('#title').innerHTML=titles[name][0];$('#intro').textContent=titles[name][1];document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===name)));if(!renderer)return;world.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();}});world.clear();targets=[];controls.target.set(0,0,0);camera.position.set(11,9,14);scene.background=new THREE.Color(name==='salvador'?0x173c48:0x081822);scene.fog=new THREE.Fog(scene.background,25,65);
if(name==='salvador'||name==='central'){
const island=new THREE.Mesh(new THREE.CylinderGeometry(7,5.8,.8,64),material(0x435f54));island.position.y=-.6;world.add(island);const sea=new THREE.Mesh(new THREE.CircleGeometry(100,64),material(0x174653));sea.rotation.x=-Math.PI/2;sea.position.y=-1.1;world.add(sea);
for(let i=0;i<34;i++){const x=Math.sin(i*17)*5,z=Math.cos(i*13)*4.8,h=.6+(i%5)*.3;box(.65,h,.7,[0xc48565,0xe3bb78,0x93b9ab,0xe1c8a2,0x668eab][i%5],x,h/2,z);box(.73,.12,.78,0x5d6762,x,h+.06,z);}
places.forEach(p=>{const m=sphere(.28,0xd0ffcf,p.x,2.4,p.z);m.userData.place=p;targets.push(m);const stem=box(.035,1.5,.035,0xd0ffcf,p.x,1.5,p.z);});box(.6,2.4,.6,0xf1e5d0,3,1.2,2);box(.8,.3,.8,0x293a3d,3,2.5,2);
}else if(name==='hangar'){
box(24,.2,24,0x172d36,0,-1,0);for(let i=-10;i<=10;i+=4){box(.15,7,.15,0x365a62,i,2,-7);box(.07,.07,18,0x8bc4b5,i,-.85,0);}loadAircraft(version);
}else{
const globe=sphere(4,0x286478,0,0,0);const grid=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(4.03,24,12)),new THREE.LineBasicMaterial({color:0x79b6ac,transparent:true,opacity:.2}));world.add(grid);const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-2,0,3.5),new THREE.Vector3(0,5,5),new THREE.Vector3(2,1,3.5));world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),new THREE.LineBasicMaterial({color:0xe4dfb2})));sphere(.12,0xffe8a3,-2,0,3.5);sphere(.12,0xffe8a3,2,1,3.5);
}controls.update();renderer.render(scene,camera);}
try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;$('#world').append(renderer.domElement);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,150);world=new THREE.Group();world.position.x=2;scene.add(world);scene.add(new THREE.HemisphereLight(0xcce7e2,0x172b35,2.8));const sun=new THREE.DirectionalLight(0xffd5a1,3);sun.position.set(5,9,4);scene.add(sun);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=30;controls.maxPolarAngle=Math.PI*.48;controls.addEventListener('change',()=>renderer.render(scene,camera));
let down;renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const rect=renderer.domElement.getBoundingClientRect();const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(targets)[0];if(hit)selectPlace(hit.object.userData.place);});
const resize=()=>{const r=$('#world').getBoundingClientRect();camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height);renderer.render(scene,camera);};window.addEventListener('resize',resize);build('central');resize();
}catch(error){console.warn('Cenário 3D indisponível',error);notify('3D indisponível. Seu roteiro continua acessível pela lista.');}
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>build(b.dataset.scene));$('#explore').onclick=()=>build('salvador');$('#reset').onclick=()=>build(sceneName);


