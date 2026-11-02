# Triply AI

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

Protótipo inicial: cidade, aeronave e rota são ilustrativas. Não há IA conectada, informações de voo ao vivo, reservas, sincronização, importação ou edição de voos. Dados ficam somente neste navegador; exporte para guardar uma cópia. Sem dados pessoais, credenciais ou serviços pagos incluídos. Ainda requer validação visual e de desempenho em aparelhos reais.

## GitHub

Repositório privado: https://github.com/Riquee05/triply-ai. Atualizações enviadas pelo navegador; autenticação direta do Git pendente. Hospedagem não configurada.

## Modelo de aeronave

`assets/aircraft/aircraft.3ds` foi extraído de `3d-model.3ds.zip`, fornecido pelo usuário. A licença MIT das bibliotecas não se aplica ao modelo. Não foi fornecido documento de licença do modelo; a origem visível informada no navegador era CGTrader, item 159817. O modelo não recebe uma nova licença neste projeto.

