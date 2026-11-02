import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { parseAircraft } from './aircraft-loader.js';
import { createHangar, updateHangarView } from './hangar.js';
import { parseCity, loadCityMaterials, disposeCityMaterials } from './city-loader.js';
import { createSalvadorDistrict } from './salvador-district.js';
import { createSalvadorCentral } from './salvador-central.js';
import { createObservatory } from './observatory.js';
import { setupJourney } from './journey.js';
const $=s=>document.querySelector(s);
const places=[{id:'pelourinho',name:'Pelourinho',note:'Cores, história e arquitetura no Centro Histórico.',x:-3,z:0,color:0xe3ac7b},{id:'barra',name:'Farol da Barra',note:'Uma pausa para contemplar o mar e o farol.',x:3,z:2,color:0xf2e7ca},{id:'lacerda',name:'Elevador Lacerda',note:'Um encontro entre a Cidade Alta e a Cidade Baixa.',x:0,z:-3,color:0xd8c7a2}];
let plan=[],persist=true;try{const saved=JSON.parse(localStorage.getItem('triply-plan')||'[]');if(Array.isArray(saved))plan=saved.filter(p=>places.some(l=>l.id===p.id)&&['12','13','14'].includes(p.day));}catch{persist=false;}
let noticeTimer;function notify(t){$('#status').textContent=t;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#status').textContent='',4000);}
function save(){try{localStorage.setItem('triply-plan',JSON.stringify(plan));}catch{persist=false;notify('Não foi possível salvar neste navegador. Exporte seu roteiro.');}renderPlan();}
function renderPlan(){const day=$('#day').value;$('#itinerary').replaceChildren();const list=plan.filter(p=>p.day===day);$('#total').textContent=list.length;$('#empty').hidden=!!list.length;list.forEach(p=>{const li=document.createElement('li');li.textContent=places.find(l=>l.id===p.id).name;const b=document.createElement('button');b.textContent='×';b.setAttribute('aria-label','Remover '+li.textContent);b.onclick=()=>{plan=plan.filter(x=>x!==p);save();};li.append(b);$('#itinerary').append(li);});}
places.forEach(p=>{const b=document.createElement('button');b.textContent='+ '+p.name;b.onclick=()=>{selectPlace(p);if(plan.some(x=>x.id===p.id&&x.day===$('#day').value))return notify('Este lugar já está no dia selecionado.');plan.push({id:p.id,day:$('#day').value});save();notify(persist?'Adicionado e salvo no navegador.':'Adicionado. Exporte para guardar.');};$('#places').append(b);});
$('#day').onchange=renderPlan;renderPlan();
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({destination:'Salvador',dates:'2027-03-12/2027-03-14',itinerary:plan.map(p=>({...p,name:places.find(l=>l.id===p.id).name}))},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='familia-a-bordo-roteiro.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('#count').textContent=Math.max(0,Math.ceil((new Date('2027-03-12T00:00:00-03:00')-Date.now())/86400000));
let renderer,scene,camera,controls,world,sceneName='central',targets=[],sceneVersion=0,aircraftData;
let cityData,cityAnchors={},cityView='district';
let renderFrame=0;function renderWorld(){if(renderFrame)return;renderFrame=requestAnimationFrame(()=>{renderFrame=0;if(sceneName==='hangar')updateHangarView(world,camera);renderer.render(scene,camera);});}
function focusRoute(){if(sceneName!=='observatory')return;controls.target.set(2,-.25,.7);camera.position.set(3.8,.4,10);controls.update();renderWorld();}
async function loadCity(version){
$('#intro').textContent='Preparando o modelo 3D de Salvador…';
try{
cityData??=fetch('./assets/salvador/salvador.obj').then(r=>{if(!r.ok)throw Error('Modelo indisponível');return r.text();}).catch(error=>{cityData=undefined;throw error;});
const text=await cityData;if(sceneName!=='salvador'||version!==sceneVersion)return;
let materials={};try{materials=await loadCityMaterials();}catch(error){console.warn('Texturas indisponíveis; usando cores locais',error);}
if(sceneName!=='salvador'||version!==sceneVersion){disposeCityMaterials(materials);return;}
const {model,anchors}=parseCity(text,materials);cityAnchors=anchors;world.add(model);
for(const p of places){const a=anchors[p.id];const marker=sphere(.14,0xe2f8c8,a.x,a.y+.4,a.z);marker.userData.place=p;targets.push(marker);box(.025,.35,.025,0xd0e8bd,a.x,a.y+.18,a.z);}
$('#intro').textContent='Modelo de Salvador · pontos ilustrativos, sem georreferenciamento.';renderWorld();
}catch(error){console.warn('Falha ao abrir Salvador',error);if(version===sceneVersion){$('#intro').textContent='Não foi possível abrir o modelo. Seu roteiro continua disponível.';notify('Use Visão geral para tentar novamente.');}}
}
async function loadAircraft(version){
$('#intro').textContent='Preparando sua aeronave 3D…';
try{
aircraftData??=fetch('./assets/aircraft/aircraft.3ds').then(r=>{if(!r.ok)throw Error('Modelo indisponível');return r.arrayBuffer();}).catch(error=>{aircraftData=undefined;throw error;});
const data=await aircraftData;if(sceneName!=='hangar'||version!==sceneVersion)return;
const aircraft=parseAircraft(data);
// O arquivo original usa Z como eixo vertical. O hangar usa Y.
aircraft.rotation.x=-Math.PI/2;aircraft.rotation.z=Math.PI/2;
aircraft.updateMatrixWorld(true);
let bounds=new THREE.Box3().setFromObject(aircraft);
const size=bounds.getSize(new THREE.Vector3());const scale=10.8/Math.max(size.x,size.y,size.z);
aircraft.scale.setScalar(scale);aircraft.updateMatrixWorld(true);bounds=new THREE.Box3().setFromObject(aircraft);
const center=bounds.getCenter(new THREE.Vector3());aircraft.position.set(-center.x,-.8-bounds.min.y,-center.z);
aircraft.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){m.side=THREE.DoubleSide;m.shininess=Math.min(m.shininess||30,60);}o.geometry.computeVertexNormals();}});
world.add(aircraft);$('#intro').textContent='Seu modelo 3D · arraste para observar cada detalhe.';renderWorld();
}catch(error){console.warn('Falha ao abrir aeronave',error);if(version===sceneVersion){$('#intro').textContent='Não foi possível abrir a aeronave.';notify('Use Visão geral para tentar carregar o modelo novamente.');}}
}
const titles={central:['O mundo espera.<br><em>Salvador também.</em>','Uma viagem em família. Um novo jeito de explorar.'],hangar:['Sua próxima<br><em>decolagem.</em>','Aeronave conceitual · dados de voo ainda não cadastrados.'],observatory:['Um novo ponto<br><em>no seu mundo.</em>','São Paulo → Salvador · rota ilustrativa, sem rastreamento ao vivo.'],salvador:['Entre cores,<br><em>mar e histórias.</em>','Escolha um lugar no cenário ou adicione pela lista.' ]};
function material(color){return new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.15});}
function box(w,h,d,color,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);world.add(m);return m;}
function sphere(r,color,x,y,z){const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,20),material(color));m.position.set(x,y,z);world.add(m);return m;}
function selectPlace(p){$('#panel-title').textContent=p.name;$('#detail').textContent=p.note+' Conteúdo conceitual; confirme horários e acesso antes de visitar.';if(controls&&sceneName==='salvador'){const anchor=cityAnchors[p.id];if(anchor){world.updateWorldMatrix(true,false);controls.target.copy(world.localToWorld(anchor.clone()));controls.update();}}}
function build(name){sceneName=name;document.body.dataset.scene=name;const version=++sceneVersion;$('#title').innerHTML=titles[name][0];$('#intro').textContent=titles[name][1];document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===name)));if(!renderer)return;const disposed=new Set();world.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!disposed.has(o.geometry)){o.geometry.dispose();disposed.add(o.geometry);}if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material])){if(disposed.has(m))continue;for(const value of Object.values(m)){if(value?.isTexture&&!disposed.has(value)){value.dispose();disposed.add(value);}}m.dispose();disposed.add(m);}}o.shadow?.dispose();});world.clear();scene.children.filter(o=>o.isLight).forEach(o=>o.visible=name!=='hangar');renderer.shadowMap.enabled=false;targets=[];controls.minDistance=7;controls.maxDistance=30;controls.target.set(0,0,0);camera.position.set(11,9,14);renderer.toneMapping=name==='hangar'?THREE.ACESFilmicToneMapping:THREE.NoToneMapping;renderer.toneMappingExposure=.8;scene.background=new THREE.Color(name==='salvador'?0x173c48:0x081822);scene.fog=new THREE.Fog(scene.background,25,65);
if(name==='central'){
scene.children.filter(o=>o.isLight).forEach(o=>o.visible=false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
createSalvadorCentral(world,renderer);camera.position.set(10,7,14);controls.target.set(0,1.4,0);scene.fog=new THREE.Fog(0xb4c5c2,35,110);
$('#intro').textContent='Sua viagem começa na orla de Salvador. Explore a cidade e prepare os próximos dias.';
}else if(name==='salvador'){
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
if(cityView==='district'){
scene.children.filter(o=>o.isLight).forEach(o=>o.visible=false);
const {anchors}=createSalvadorDistrict(world,renderer);cityAnchors=anchors;
for(const p of places){const a=anchors[p.id];const marker=sphere(.18,0xffe5a3,a.x,a.y+1,a.z);marker.userData.place=p;targets.push(marker);}
controls.maxDistance=65;controls.minDistance=5;controls.target.set(1,1,-2);camera.position.set(17,16,26);scene.fog=new THREE.Fog(0xd4cdb5,45,130);
$('#intro').textContent='Centro Histórico · cenário artístico inspirado em Salvador.';
}else{controls.target.set(2,.5,0);camera.position.set(17,17,22);loadCity(version);}
}else if(name==='hangar'){
createHangar(world,renderer);camera.position.set(11,5,17);controls.target.set(0,.6,0);scene.fog=new THREE.Fog(0x70848c,45,125);loadAircraft(version);
}else{
scene.children.filter(o=>o.isLight).forEach(o=>o.visible=false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
const observatory=createObservatory(world);targets=observatory.targets;targets.forEach(o=>o.userData.action='route');camera.position.set(4.5,1,17);controls.target.set(4.5,0,0);controls.minDistance=5;scene.fog=null;
$('#title').innerHTML='Uma rota.<br><em>Mil histórias.</em>';$('#intro').textContent='São Paulo → Salvador. Veja a jornada e prepare cada detalhe.';
}controls.update();renderWorld();}
try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;$('#world').append(renderer.domElement);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,150);world=new THREE.Group();world.position.x=2;scene.add(world);scene.add(new THREE.HemisphereLight(0xcce7e2,0x172b35,2.8));const sun=new THREE.DirectionalLight(0xffd5a1,3);sun.position.set(5,9,4);scene.add(sun);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=30;controls.maxPolarAngle=Math.PI*.48;controls.addEventListener('change',renderWorld);
let down;renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const rect=renderer.domElement.getBoundingClientRect();const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(targets)[0];if(hit){if(hit.object.userData.action==='route')focusRoute();else selectPlace(hit.object.userData.place);}});
const resize=()=>{const r=$('#world').getBoundingClientRect();camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height);renderWorld();};window.addEventListener('resize',resize);build('central');resize();
}catch(error){console.warn('Cenário 3D indisponível',error);notify('3D indisponível. Seu roteiro continua acessível pela lista.');}
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>build(b.dataset.scene));$('#explore').onclick=()=>build('salvador');$('#reset').onclick=()=>build(sceneName);
const planToggle=document.createElement('button');planToggle.id='toggle-plan';planToggle.textContent='Abrir roteiro';planToggle.setAttribute('aria-expanded','false');
planToggle.onclick=()=>{const open=document.body.dataset.planOpen!=='true';document.body.dataset.planOpen=String(open);planToggle.setAttribute('aria-expanded',String(open));planToggle.textContent=open?'Fechar roteiro':'Abrir roteiro';};
document.querySelector('header').insertBefore(planToggle,$('#reset'));
const cityToggle=document.createElement('button');cityToggle.id='toggle-city';cityToggle.textContent='Ver maquete original';
cityToggle.onclick=()=>{cityView=cityView==='district'?'overview':'district';cityToggle.textContent=cityView==='district'?'Ver maquete original':'Explorar Centro Histórico';build('salvador');};
document.querySelector('header').insertBefore(cityToggle,planToggle);
setupJourney(notify,focusRoute);












