export const CABINS = {A320: {rows: 30, exits: [12,13], wing: [11,19]}, A321: {rows: 36, exits: [11,23], wing: [13,24]}, B737: {rows: 31, exits: [14,15], wing: [12,20]}};
export const PHASES = ['Portão','Pushback','Partida dos motores','Táxi e flaps','Decolagem','Cruzeiro','Descida','Pouso','Desembarque'];
export const KEY = 'triply-air-v1';
export function flights(from, to, date) {
  if (!['GRU','SSA','BSB','CNF'].includes(from) || !['GRU','SSA','BSB','CNF'].includes(to) || from===to || !validDate(date)) throw Error('Escolha aeroportos diferentes e uma data válida.');
  return Object.keys(CABINS).map((aircraft,i)=>({id:`DEMO-TA${101+i}`,from,to,date,aircraft,time:['08:10','11:00','17:35'][i],arrival:['10:30','13:20','19:55'][i],price:[429,549,479][i],miles:[18000,22000,20000][i]}));
}
export function validDate(s) { return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s; }
export function seatValid(flight, seat) {const m=/^(\d{1,2})([ABCDEF])$/.exec(seat||'');return !!m && +m[1]>=1 && +m[1]<=CABINS[flight.aircraft]?.rows;}
export function occupied(flight, seat) {return seatValid(flight,seat) && ((+seat.slice(0,-1)*7+seat.charCodeAt(seat.length-1))%19===0);}
export function assignSeat(booking,index,seat) {
  if (!Number.isInteger(index)||!booking.passengers[index]||booking.passengers.some(p=>p.checked)) throw Error('Assentos bloqueados após check-in.');
  if (!seatValid(booking.flight,seat)||occupied(booking.flight,seat)||booking.passengers.some((p,i)=>i!==index&&p.seat===seat)) throw Error('Assento indisponível.');
  booking.passengers[index].seat=seat;
}
export function checkIn(booking) {
  const seats=booking.passengers.map(p=>p.seat);
  if (seats.some(s=>!seatValid(booking.flight,s)||occupied(booking.flight,s))||new Set(seats).size!==seats.length) throw Error('Escolha um assento diferente para cada passageiro.');
  booking.passengers.forEach(p=>p.checked=true);
}
export function payload(booking,p) {if(!p.checked)throw Error('Faça o check-in primeiro.');return JSON.stringify({type:'TRIPLY_AIR_SIMULATION',v:1,session:booking.id,passenger:p.id,flight:booking.flight.id,route:booking.flight.from+'-'+booking.flight.to,date:booking.flight.date,aircraft:booking.flight.aircraft,seat:p.seat,fictional:true});}
export function validate(raw,gate) {
  let p;try{p=JSON.parse(raw);}catch{throw Error('QR não pertence ao Triply Air.');}
  if(p?.type!=='TRIPLY_AIR_SIMULATION'||p.v!==1||p.fictional!==true||!/^SIM-[a-f0-9-]{36}$/.test(p.session)||!/^P[1-4]$/.test(p.passenger)||!/^DEMO-TA10[1-3]$/.test(p.flight)||!Object.hasOwn(CABINS,p.aircraft)||!seatValid({aircraft:p.aircraft},p.seat)||!validDate(p.date)||! /^(GRU|SSA|BSB|CNF)-(GRU|SSA|BSB|CNF)$/.test(p.route)) throw Error('Código fictício inválido.');
  if(!gate)throw Error('Abra uma sessão de portão antes da leitura.');
  if(p.session!==gate.session||p.flight!==gate.flight||p.route!==gate.route||p.date!==gate.date||p.aircraft!==gate.aircraft)throw Error('Cartão de outra sessão ou voo.');
  const expected=gate.manifest.find(x=>x.id===p.passenger);if(!expected||expected.seat!==p.seat)throw Error('Passageiro ou assento não corresponde à sessão.');
  if(gate.boarded.includes(p.passenger))throw Error('Passageiro já embarcou neste portão.');
  gate.boarded.push(p.passenger);return p;
}
export function gateFor(b){if(!b.passengers.every(p=>p.checked))throw Error('Faça check-in de todos primeiro.');return {session:b.id,flight:b.flight.id,route:b.flight.from+'-'+b.flight.to,date:b.flight.date,aircraft:b.flight.aircraft,manifest:b.passengers.map(p=>({id:p.id,seat:p.seat})),boarded:[]};}
export function parseGate(raw){let g;try{g=JSON.parse(raw);}catch{throw Error('Sessão inválida.');}if(!g||!Array.isArray(g.manifest)||g.manifest.length<1||g.manifest.length>4||!Array.isArray(g.boarded)||g.boarded.length||new Set(g.manifest.map(p=>p.id)).size!==g.manifest.length||new Set(g.manifest.map(p=>p.seat)).size!==g.manifest.length)throw Error('Sessão inválida.');for(const p of g.manifest)validate(JSON.stringify({type:'TRIPLY_AIR_SIMULATION',v:1,session:g.session,passenger:p.id,flight:g.flight,route:g.route,date:g.date,aircraft:g.aircraft,seat:p.seat,fictional:true}),{...g,boarded:[]});return g;}
