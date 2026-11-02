# Família a Bordo

Primeira versão local da experiência cinematográfica 3D de viagem. Salvador, 12 a 14 de março de 2027.

## Abrir

Com Node.js instalado, execute na pasta do projeto:

```
node server.mjs
```

Abra http://127.0.0.1:4173. Não é necessário instalar pacotes. Use servidor HTTP; abrir index.html diretamente não carrega módulos.

## Funciona nesta versão

- Quatro ambientes 3D procedurais: central, hangar, observatório e Salvador.
- Hangar com a aeronave 3DS fornecida pelo usuário: 104 geometrias reutilizadas em 148 peças, aproximadamente 33.258 triângulos, carregamento apenas ao entrar no ambiente. Sem texturas externas no arquivo recebido.
- Rotação e aproximação da câmera com mouse ou toque.
- Seleção de pontos no cenário e alternativa em lista.
- Roteiro por dia, remoção, persistência local e exportação JSON.
- Layout responsivo e mensagens acessíveis.
- Biblioteca Three.js 0.170.0 incluída localmente, licença MIT em vendor/THREE-LICENSE.txt.

## Limites

Protótipo inicial: cidade, aeronave e rota são ilustrativas. Não há IA conectada, informações de voo ao vivo, reservas, sincronização ou importação. Dados ficam somente neste navegador; exporte para guardar uma cópia. Sem dados pessoais, credenciais ou serviços pagos incluídos. Ainda requer validação visual e de desempenho em aparelhos reais.

## GitHub

Repositório público: https://github.com/Riquee05/triply-ai. Atualizações enviadas pelo navegador; autenticação direta do Git pendente. Site: https://riquee05.github.io/triply-ai/.

## Modelo de aeronave

`assets/aircraft/aircraft.3ds` foi extraído de `3d-model.3ds.zip`, fornecido pelo usuário. A licença MIT das bibliotecas não se aplica ao modelo. Não foi fornecido documento de licença do modelo; a origem visível informada no navegador era CGTrader, item 159817. O modelo não recebe uma nova licença neste projeto.


## Atualização local de cenários

Salvador utiliza o OBJ fornecido pelo usuário (58.504 triângulos), com cores aplicadas pelo aplicativo e roteiro recolhível. O hangar oculta automaticamente a parede ou o teto do lado da câmera para preservar a visão da aeronave. Cenários desenvolvidos e incluídos nesta atualização do repositório.


## Centro Histórico — estudo artístico

Nova cena 3D procedural inspirada na referência visual: praça, 43 casarões, igreja, árvores, barcos e baía com luz dourada. A maquete OBJ permanece disponível no botão Ver maquete original. Detalhes de fachadas e vegetação usam sete grupos de instâncias. Todas as casas foram verificadas dentro do terreno. Representação artística, sem correspondência geográfica precisa; não pretende reproduzir o realismo da imagem de referência nesta primeira etapa. Salva localmente para avaliação.


A Central agora apresenta uma composição 3D artística do Farol da Barra, com forte, orla, coqueiros e barcos. A contagem regressiva e o acesso ao roteiro foram mantidos.


## Observatório da Jornada

Globo 3D com continentes simplificados, rota ilustrativa São Paulo–Salvador, seleção da rota e foco no Brasil. Painel de ida e volta com aeroporto de origem, datas, horários de partida e números de voo opcionais. Preparação com quatro itens e indicação do próximo passo. Dados armazenados na chave local triply-journey-v1; sem rastreamento ou sincronização. Datas dos voos podem ser editadas independentemente das datas fixas do roteiro. Renderização sob demanda agrupada por quadro.

Verificação: edição e persistência após recarregamento, rejeição de volta anterior à ida, contagem da preparação e troca entre ambientes. Dados temporários de teste removidos. Esta versão faz parte desta atualização do repositório.


## Voos da viagem — consulta de 02/11/2026

LA3652 em 12/03/2027: GRU 11:00 → SSA 13:20, programação de terça/quinta/sexta de 02 a 12/03/2027 em https://www.flight.info/LA3652. LA3357 em 14/03/2027: SSA 20:45 → GRU 23:15, programação de domingo de 07 a 21/03/2027 em https://www.flight.info/LA3357. Horários programados de fonte secundária, a confirmar na LATAM, sem atualização automática.

Informações de aeroportos: endereço GRU no site oficial https://www.gru.com.br/pt/passageiro/como-chegar-sair/carro; Terminal 2 doméstico na orientação LATAM https://www.latamairlines.com/br/pt/experiencia/aeroporto/aeroportos-principais/sao-paulo; endereço SSA na ANAC https://www.anac.gov.br/assuntos/paginas-tematicas/concessoes/aeroportos-concedidos/salvador/aeroporto-internacional-de-salvador. Portões não informados. Dados editáveis; datas do roteiro preservadas.




Identidade Família a Bordo, com Belo Horizonte e Brasília marcadas por corações no Observatório e lista de viagens realizadas em família.
