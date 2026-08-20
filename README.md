<div align="center">

# LAN Drop

**Transferência direta de arquivos entre dispositivos na mesma rede local — sem nuvem, sem cabos, sem mensageiros.**

Projeto 01 de uma jornada para construir **o maior número possível de projetos em 6 meses**.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js\&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express\&logoColor=white)](https://expressjs.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socketdotio\&logoColor=white)](https://socket.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#licença)

</div>

---

## Sobre o projeto

Duas pessoas com celular e computador na mesma rede Wi-Fi ainda hoje mandam arquivo um para o outro via WhatsApp, e-mail ou upload para a nuvem — mesmo estando a poucos metros de distância, na mesma rede. O **LAN Drop** existe para eliminar essa fricção: ele transforma qualquer computador da rede em um ponto de despacho local, descoberto automaticamente pelos outros dispositivos, para onde arquivos são enviados diretamente, sem passar pela internet.

Não existe conta, login, upload para servidor externo ou app para instalar no celular — só um navegador e a mesma rede local.

## Índice

* [Funcionalidades](#funcionalidades)
* [Como funciona](#como-funciona)
* [Como rodar](#como-rodar)
* [Estrutura do projeto](#estrutura-do-projeto)
* [Identidade visual](#identidade-visual--manifesto-postal)
* [Decisões técnicas e limitações](#decisões-técnicas-e-limitações)
* [Roadmap](#roadmap)
* [Licença](#licença)

## Funcionalidades

* **Descoberta automática de dispositivos** — cada instância se anuncia na rede via broadcast UDP; nenhum IP precisa ser digitado.
* **Envio direto entre dispositivos** — o arquivo vai do dispositivo de origem para o de destino, sem passar por um servidor externo.
* **Progresso em tempo real** — barra de progresso cobrindo as duas etapas da transferência (upload local → retransmissão para o destino).
* **Verificação de integridade ponta a ponta** — checksum SHA-256 calculado no remetente e conferido no destinatário; a confirmação de entrega só aparece depois que a integridade é validada.
* **Múltiplos destinatários simultâneos** — qualquer dispositivo com o LAN Drop rodando na mesma rede aparece automaticamente na lista de destino.
* **Nome de dispositivo personalizável** — editável direto na interface, persistido localmente.
* **Sem nuvem, sem conta, sem instalação em celular** — o celular só precisa de um navegador.

## Como funciona

1. Ao rodar `npm start` em um computador, o LAN Drop sobe um servidor HTTP local (Express) com comunicação em tempo real via Socket.IO, na porta `4000`.
2. Essa instância começa a anunciar sua presença na rede via **broadcast UDP** (porta `41234`) a cada poucos segundos, e também escuta anúncios de outras instâncias — é assim que os dispositivos se descobrem automaticamente, sem configuração manual.
3. Qualquer navegador na mesma rede (o próprio computador, um celular, outro notebook) acessa o endereço mostrado no terminal e enxerga a interface do LAN Drop.
4. Para enviar um arquivo, o envio acontece em duas etapas encadeadas, com barra de progresso cobrindo as duas:

   1. o navegador envia o arquivo para o servidor local (upload comum via `XMLHttpRequest`, com progresso nativo do navegador);
   2. o servidor local retransmite o arquivo diretamente para o servidor do dispositivo de destino, via HTTP, reportando o progresso ao navegador de origem em tempo real via Socket.IO.
5. Antes de enviar, o remetente calcula o hash **SHA-256** do arquivo. O destinatário recalcula o hash do que recebeu e compara. **A confirmação de "entregue" só é exibida depois que essa verificação passa** — se o arquivo chegar corrompido, o remetente é avisado, não apenas informado que "terminou".
6. O arquivo recebido fica salvo localmente no dispositivo de destino e disponível para download direto pela interface.

Nenhuma etapa depende de internet: tudo acontece dentro da rede local, mesmo sem acesso externo.

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior, instalado em pelo menos um computador da rede.

```bash
cd "LAN Drop"
npm install
npm start
```

O terminal mostra algo como:

```text
LAN Drop rodando em http://192.168.0.12:4000
Dispositivo: meu-pc (a1b2c3d4-...)
```

Abra esse endereço no navegador do próprio computador **e** de qualquer outro dispositivo conectado à mesma rede Wi-Fi/LAN (celular, notebook, etc.). Assim que duas ou mais instâncias estiverem rodando na mesma rede, elas aparecem automaticamente uma na lista da outra — normalmente em menos de 5 segundos.

Para rodar em mais de um computador ao mesmo tempo, repita os mesmos três comandos em cada um deles.

> **Sobre celulares:** o LAN Drop precisa de um processo Node.js rodando para se anunciar via UDP e para atuar como destino de envios. Por isso, o app roda em pelo menos um computador da rede; um celular participa acessando a interface desse computador pelo navegador — ele pode tanto enviar quanto receber arquivos por ali, sem instalar nada.

### Variáveis de ambiente

| Variável | Padrão | Descrição                    |
| -------- | ------ | ---------------------------- |
| `PORT`   | `4000` | Porta HTTP do servidor local |

## Estrutura do projeto

```text
LAN Drop/
├── server.js               # servidor HTTP + Socket.IO + rotas de envio/recebimento
├── src/
│   ├── deviceIdentity.js   # identidade persistente do dispositivo (id, nome, IP)
│   ├── discovery.js        # broadcast/escuta UDP para descoberta automática de peers
│   └── transfer.js         # checksum SHA-256 e retransmissão do arquivo ao destino
├── public/                 # interface web (HTML/CSS/JS puro, sem build step)
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── fonts/               # fonte de exibição auto-hospedada (sem CDN externo)
├── received/                # arquivos recebidos por esta instância
├── PRODUCT.md               # contexto de produto: usuários, propósito, posicionamento
├── DESIGN.md                # sistema de design: cores, tipografia, componentes, regras
└── README.md
```

## Identidade visual — "Manifesto Postal"

A interface trata cada arquivo como uma remessa: uma mesa de despacho escura segurando três documentos de papel kraft com formas diferentes — um clipboard de destinatários, uma etiqueta de envio perfurada e um manifesto de entregas — em vez do painel escuro genérico com gradiente azul-roxo que qualquer ferramenta desse tipo tende a receber por padrão. A confirmação de integridade é um carimbo de tinta real que bate na tela só depois que o checksum é validado.

Decisões completas de cor, tipografia, componentes e regras de uso estão documentadas em [DESIGN.md](DESIGN.md).

A fonte de destaque, [Special Elite](https://fonts.google.com/specimen/Special+Elite) (Astigmatic, licença SIL Open Font License), está hospedada localmente em `public/fonts/` — sem dependência de CDN externo, consistente com a proposta "sem nuvem" do projeto.

## Decisões técnicas e limitações

* **Sem banco de dados** — a identidade do dispositivo (`config.json`) e os arquivos recebidos (`received/`) são o único estado persistido, em disco.
* **Descoberta expira sozinha** — um dispositivo que sai da rede (ou fecha o processo) desaparece da lista de destinatários dos outros após ~12 segundos sem anúncio.
* **Retransmissão em duas etapas** — como o destino é outro processo Node.js na rede (e não um par direto de navegadores), o arquivo passa pelo servidor de origem antes de seguir para o servidor de destino; por isso o progresso é reportado em dois trechos.
* **Celular não roda uma instância própria** — ele participa como cliente de navegador de uma instância rodando num computador; enviar/receber pelo celular depende de pelo menos um computador com o LAN Drop ativo na mesma rede.
* **Rede local confiável** — o LAN Drop não foi desenhado para redes públicas não confiáveis (ex: Wi-Fi de aeroporto); qualquer dispositivo na mesma rede pode ver e selecionar os destinatários anunciados.

## Roadmap

* [ ] Fila de múltiplos arquivos numa única remessa
* [ ] Suporte a pastas inteiras (zipadas no cliente antes do envio)
* [ ] Histórico de remessas entre sessões
* [ ] Modo "instância única" com IP fixo, sem depender de descoberta UDP, para redes que bloqueiam broadcast

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` (ou o texto da licença MIT) para mais detalhes.

---

<div align="center">

Feito como parte de uma jornada para construir **o maior número possível de projetos em 6 meses**.

</div>
