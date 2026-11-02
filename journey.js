const defaults={origin:'GRU',outDate:'2027-03-12',outTime:'11:00',outArrival:'13:20',outFlight:'LA3652',backDate:'2027-03-14',backTime:'20:45',backArrival:'23:15',backFlight:'LA3357',passages:false,hotel:false,documents:false,baggage:false};
const key='triply-journey-v1';
export function setupJourney(notify,focusRoute){
  let state={...defaults},stored={};
  try{const data=JSON.parse(localStorage.getItem(key)||'null');if(data&&typeof data==='object'){stored=data;for(const k of Object.keys(defaults))if(typeof data[k]===typeof defaults[k])state[k]=data[k];}}catch{}
  if(!state.origin)state.origin='GRU';
  for(const leg of ['out','back']){
    const flight=state[leg+'Flight'].replace(/\s/g,'').toUpperCase();
    if(state.origin==='GRU'&&state[leg+'Date']===defaults[leg+'Date']&&(!flight||flight===defaults[leg+'Flight'])){
      for(const field of ['Flight','Time','Arrival'])if(!state[leg+field])state[leg+field]=defaults[leg+field];
    }else if(!Object.hasOwn(stored,leg+'Arrival'))state[leg+'Arrival']='';
  }
  try{localStorage.setItem(key,JSON.stringify(state));}catch{}
  const panel=document.createElement('section');panel.id='journey-panel';panel.setAttribute('aria-label','Detalhes da jornada');
  panel.innerHTML=`<div class="eyebrow">OBSERVATÓRIO DA JORNADA</div><h2>São Paulo <span>→</span> Salvador</h2><p class="journey-note">Rota ilustrativa · sem rastreamento ao vivo</p><button id="focus-route">◎ Focar rota no Brasil</button><section class="family-memories" aria-label="Viagens em família"><h3>♥ Já fomos juntos</h3><p>♥ Belo Horizonte · MG</p><p>♥ Brasília · DF</p><small>Memórias da nossa família</small></section><div class="flight-summary"><div><small>IDA · SÃO PAULO → SSA</small><strong id="out-summary"></strong><span id="out-extra"></span></div><div><small>VOLTA · SSA → SÃO PAULO</small><strong id="back-summary"></strong><span id="back-extra"></span></div></div><p id="journey-next" role="status"></p><button id="edit-flights" aria-expanded="false">Editar dados dos voos</button><form id="flights-form" hidden><label for="flight-origin">Aeroporto em São Paulo</label><select id="flight-origin"><option value="">Selecionar aeroporto</option><option value="GRU">Guarulhos · GRU</option><option value="CGH">Congonhas · CGH</option><option value="VCP">Viracopos · VCP</option></select><p class="journey-note">Destino: Salvador · SSA. Horários locais.</p><fieldset><legend>Voo de ida</legend><label for="out-date">Data</label><input id="out-date" type="date" required><label for="out-time">Horário de partida</label><input id="out-time" type="time"><label for="out-flight">Número do voo (opcional)</label><input id="out-flight" maxlength="20" placeholder="Ex.: AB 1234"></fieldset><fieldset><legend>Voo de volta</legend><label for="back-date">Data</label><input id="back-date" type="date" required><label for="back-time">Horário de partida</label><input id="back-time" type="time"><label for="back-flight">Número do voo (opcional)</label><input id="back-flight" maxlength="20" placeholder="Ex.: AB 4321"></fieldset><p class="journey-note">As datas dos voos não alteram o roteiro de passeios.</p><button type="submit" class="primary">Salvar voos</button><button type="button" id="cancel-flights">Cancelar</button></form><details id="journey-preparation"><summary>Preparação <span id="preparation-count"></span></summary><label><input type="checkbox" data-prep="passages"> Passagens conferidas</label><label><input type="checkbox" data-prep="hotel"> Hospedagem organizada</label><label><input type="checkbox" data-prep="documents"> Documentos separados</label><label><input type="checkbox" data-prep="baggage"> Bagagem preparada</label></details><p class="journey-note">Dados salvos apenas neste navegador. Sem atualização automática.</p>`;
  if(!state.origin){state.origin='GRU';try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
  document.body.append(panel);const $=s=>panel.querySelector(s);
  // Arrival fields and source notes augment the existing flight editor.
  for(const [leg,label]of [['out','ida'],['back','volta']]){
    const input=document.createElement('input');input.id=leg+'-arrival';input.type='time';
    const labelElement=document.createElement('label');labelElement.htmlFor=input.id;labelElement.textContent='Horário de chegada (mesmo dia)';
    $( '#'+leg+'-flight').previousElementSibling.before(labelElement,input);
    const note=document.createElement('p');note.id=leg+'-source';note.className='journey-note flight-source';$('#'+leg+'-extra').after(note);
  }
  const airports=document.createElement('details');airports.id='airport-info';airports.innerHTML=`<summary>Informações dos aeroportos</summary><article id="gru-info"><h3>GRU · Guarulhos</h3><p>Aeroporto Internacional de São Paulo/Guarulhos — Governador André Franco Montoro.</p><p>Rodovia Hélio Smidt, s/n · Cumbica · Guarulhos/SP.</p><p>LATAM doméstico: Terminal 2 como referência. Confirme o terminal no cartão de embarque; portão a definir.</p><a href="https://www.gru.com.br/pt/passageiro/como-chegar-sair/carro" target="_blank" rel="noopener noreferrer">Acesso oficial ao GRU ↗</a><a href="https://www.latamairlines.com/br/pt/experiencia/aeroporto/aeroportos-principais/sao-paulo" target="_blank" rel="noopener noreferrer">Terminais LATAM em GRU ↗</a></article><article><h3>SSA · Salvador</h3><p>Aeroporto Internacional de Salvador — Deputado Luís Eduardo Magalhães.</p><p>Praça Gago Coutinho, s/n · São Cristóvão · Salvador/BA.</p><p>Terminal e portão: confirmar no cartão de embarque.</p><a href="https://www.salvador-airport.com.br/" target="_blank" rel="noopener noreferrer">Salvador Bahia Airport ↗</a><a href="https://www.anac.gov.br/assuntos/paginas-tematicas/concessoes/aeroportos-concedidos/salvador/aeroporto-internacional-de-salvador" target="_blank" rel="noopener noreferrer">Dados do aeroporto · ANAC ↗</a></article><p class="journey-note">Ambos usam horário de Brasília (UTC−3). Informações consultadas em 02/11/2026.</p></details>`;
  $('#journey-preparation').before(airports);
  const fields={origin:'#flight-origin',outDate:'#out-date',outTime:'#out-time',outArrival:'#out-arrival',outFlight:'#out-flight',backDate:'#back-date',backTime:'#back-time',backArrival:'#back-arrival',backFlight:'#back-flight'};
  function fill(){for(const [key,selector]of Object.entries(fields))$(selector).value=state[key];}
  function date(value){const d=new Date(value+'T12:00:00');return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).format(d):'Data a definir';}
  function render(){
    $('#out-summary').textContent=date(state.outDate)+(state.outTime?' · '+state.outTime:' · horário a definir')+(state.outArrival?' → '+state.outArrival:'');
    $('#back-summary').textContent=date(state.backDate)+(state.backTime?' · '+state.backTime:' · horário a definir')+(state.backArrival?' → '+state.backArrival:'');
    $('#out-extra').textContent=(state.origin||'Aeroporto a definir')+' → SSA'+(state.outFlight?' · '+state.outFlight:'');
    $('#back-extra').textContent='SSA → '+(state.origin||'aeroporto a definir')+(state.backFlight?' · '+state.backFlight:'');
    $('#gru-info').hidden=state.origin!=='GRU';
    for(const leg of ['out','back']){
      const matches=state.origin==='GRU'&&['Date','Time','Arrival','Flight'].every(field=>state[leg+field]===defaults[leg+field]);
      const note=$('#'+leg+'-source');note.replaceChildren();
      if(matches){note.append('LATAM · fonte: Flight.info, consultada em 02/11/2026. Confirmar na companhia. ');const link=document.createElement('a');link.href='https://www.flight.info/'+defaults[leg+'Flight'];link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ver fonte ↗';note.append(link);}
      else note.textContent='Dados editados manualmente; confira com a companhia.';
    }
    const checkboxes=[...panel.querySelectorAll('[data-prep]')];checkboxes.forEach(c=>c.checked=state[c.dataset.prep]);$('#preparation-count').textContent=checkboxes.filter(c=>c.checked).length+'/4';
    $('#journey-next').textContent=!state.origin?'Próximo passo: informar o aeroporto de origem.':!state.outTime||!state.backTime?'Próximo passo: conferir os horários dos voos.':!state.passages?'Próximo passo: conferir suas passagens.':'Dados dos voos preenchidos. Revise a preparação da viagem.';
  }
  function save(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch{notify('Não foi possível salvar. Os dados permanecem somente nesta sessão.');return false;}}
  function close(){ $('#flights-form').hidden=true;$('#edit-flights').setAttribute('aria-expanded','false');$('#edit-flights').textContent='Editar dados dos voos';$('#edit-flights').focus();}
  $('#focus-route').onclick=focusRoute;
  $('#edit-flights').onclick=()=>{const open=$('#flights-form').hidden;if(open){fill();$('#flights-form').hidden=false;$('#edit-flights').setAttribute('aria-expanded','true');$('#edit-flights').textContent='Fechar edição';$('#flight-origin').focus();}else close();};
  $('#cancel-flights').onclick=close;
  $('#flights-form').onsubmit=e=>{e.preventDefault();$('#back-date').setCustomValidity('');if($('#back-date').value<$('#out-date').value){$('#back-date').setCustomValidity('A volta deve acontecer na mesma data ou depois da ida.');$('#back-date').reportValidity();return;}for(const [key,selector]of Object.entries(fields))state[key]=$(selector).value.trim();const saved=save();render();close();if(saved)notify('Dados dos voos salvos neste navegador.');};
  $('#back-date').oninput=()=>$('#back-date').setCustomValidity('');$('#out-date').oninput=()=>$('#back-date').setCustomValidity('');
  panel.querySelectorAll('[data-prep]').forEach(c=>c.onchange=()=>{state[c.dataset.prep]=c.checked;save();render();});
  render();return panel;
}



