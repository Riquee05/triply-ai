# Triply Air — integração em etapas

## Inspeção e estratégia

Base inspecionada: commit a6c0ca6. Site estático de módulos JavaScript, Three.js local, GitHub Pages; não existe backend de reservas ou sincronização. Roteiro, hotel e jornada possuem armazenamento local próprio. O módulo Air fica em air.html, com acesso pela Central. Não altera os dados existentes, a navegação entre cenários ou o carregamento do Hangar. Usa somente as chaves triply-air-v1 e triply-air-v1-gate.

## Etapas implementadas

1. Pesquisa determinística de voos fictícios entre GRU, SSA, BSB e CNF, tarifas e milhas virtuais. Reserva para uma a quatro pessoas. Demonstração GRU–SSA, 12/03/2027, A321, família de quatro, voo DEMO-TA102. Não consulta horários reais nem cobra valores.
2. Mapas conceituais de cabine 3–3 (A320: 30 filas; A321: 36; B737: 31), ocupação demonstrativa, asas e saídas ilustrativas. Uma pessoa por assento. Assentos bloqueados após check-in. Não reproduzem a configuração de uma operadora.
3. Check-in da reserva, quatro cartões separados, QR SVG com margem branca, impressão e download. Payload JSON versionado TRIPLY_AIR_SIMULATION, session SIM-UUID, passageiro P1–P4, voo DEMO, rota, data e assento fictícios. Não usa formato BCBP/IATA, localizadores, nomes ou códigos reais. Apelidos ficam apenas na apresentação e no armazenamento do navegador.
4. Link de pareamento com manifesto fictício no fragmento da URL (não enviado ao servidor HTTP). No outro celular, o manifesto define o portão e a câmera lê os cartões. Validação de versão, sessão, voo, rota, data, aeronave, passageiro e assento. Bloqueio de leitura duplicada no mesmo portão, persistente após recarregar. Registro exportável em JSON. Câmera desligada ao sair, ocultar a página ou pressionar Parar. jsQR carregado somente ao abrir a câmera.
5. Sequência Portão → Pushback → Motores → Táxi/flaps → Decolagem → Cruzeiro → Descida → Pouso → Desembarque. O mesmo arquivo assets/aircraft/aircraft.3ds do Hangar usa o adaptador aircraft-loader.js existente. Cena carrega sob demanda; proporção de pixels limitada a 1,5; renderização pausada fora de vista ou com página oculta; movimento reduzido respeitado; som sintético opcional. Animação simplificada alternativa se WebGL/modelo falhar.

## Como testar em dois celulares

1. Servir o projeto em HTTPS (GitHub Pages) e abrir air.html no celular A.
2. Criar demonstração, escolher quatro assentos diferentes e fazer check-in.
3. Preparar sessão do portão. Copiar o link para o celular B ou escanear o QR de sessão com sua câmera comum. O endereço precisa ser acessível pelo segundo aparelho; localhost serve somente ao próprio computador.
4. No celular B, tocar em Ler com câmera e permitir acesso. No A, mostrar um cartão por vez. A confirmação e a lista de embarque aparecem no B.
5. Repetir o cartão: deve exibir “Passageiro já embarcou”. Recarregar B e repetir: o bloqueio permanece. Cartões de outra reserva são recusados. Sem câmera, copiar o JSON em “Ver payload fictício” para o campo manual.

## Limites e próximos passos

- Não existe sincronização remota: o celular A não recebe automaticamente o status do B; dois leitores diferentes têm registros independentes. Usar um único leitor por sessão. A validação é demonstrativa, sem assinatura/autenticação e sem valor de segurança. Não promete detectar falsificação deliberada do manifesto.
- O arquivo 3DS tem peças com nomes genéricos e é montado no quadro estático 0. Movimentos aplicam-se à aeronave inteira. Estado de motores e flaps é ilustrado pelo painel; animação física das peças exige identificar, separar e articular as geometrias. A aeronave visual do Hangar não troca de modelo ao selecionar um mapa de cabine diferente.
- Mapas de cabine e fases são artísticos, sem finalidade de treinamento aeronáutico.
- Sem serviço pago, pacote de instalação, API de companhia ou nova dependência externa em tempo de uso. QR Generator (MIT, aviso no código) e jsQR (Apache-2.0, licença em vendor) incluídos localmente. Licença do modelo original preservada conforme assets/aircraft/README.md.
- Para sincronização entre leitores, próxima etapa requer escolher um backend compartilhado com controle de sessão e atualização atômica; para evitar custo inicial, esta versão usa portão local.
- Roteiro de regressão: Central, Hangar, Observatório, Salvador, roteiro, exportação e persistência devem continuar funcionando. Não realizar migração das chaves existentes.

## Verificação realizada

Executar `node --test air.test.mjs`. Testes cobrem limites de cabine, datas, assentos duplicados, check-in incompleto, bloqueio pós-check-in, geração e decodificação das quatro imagens QR, manifesto e rejeição de cartão alterado/estrangeiro/repetido. Testes de sintaxe em air.js e air-flight.js. Interface verificada no navegador, largura de celular sem transbordamento, quatro cartões, check-in, validação manual e bloqueio repetido, persistência após recarga e cena 3D com aeronave do Hangar sem erros no console. Hangar e Observatório abertos na verificação de regressão.

Ainda necessário: teste físico de câmera entre dois celulares e desempenho em aparelhos modestos. Nenhuma publicação de produção deve ser presumida apenas pela presença destes arquivos.

## Reversão

Restaurar o commit anterior remove o link e o módulo. Dados do roteiro e jornada não são tocados. As chaves locais Air podem permanecer sem afetar o site anterior.


## Aeroporto 3D estilizado

O cenário inclui terminal envidraçado, sinalização G11/G12/G13, ponte retrátil do G12, pátio demarcado, ônibus, rebocador, bagagens, cones, torre de controle, árvores, cidade instanciada, colinas, horizonte marítimo, céu em gradiente e nuvens. Iluminação de fim de tarde, sombras arquitetônicas de 1024 px e sombra suave da aeronave. Texturas de fachadas, placas e concreto são geradas localmente; sem novos recursos externos. A pista tem eixo próprio: a reserva começa no pátio, e as etapas de táxi/decolagem/pouso usam a pista. O cenário é artístico e não replica GRU ou SSA.

A ponte se recolhe no pushback. Elementos repetidos usam instâncias e geometria/material compartilhados. Renderização sob demanda e pausa fora de vista mantidas; céu e edifícios não adicionam serviços ou dependências pagas. O avião original do Hangar e sua orientação para +X foram preservados. Verificação: seis testes (`node --test air.test.mjs air-model.test.mjs`), conferência visual em tela de celular sem transbordamento e fases de voo no navegador. Desempenho físico em celulares modestos continua pendente.
