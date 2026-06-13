# agendamento-video-conferencia

Sistema web para solicitar, aprovar e acompanhar agendamentos de videoconferencias.

O projeto usa React, Vite, Vercel Functions e Neon Postgres. Nao usa Firebase.

## Status atual

- Aplicacao em producao: https://videos-conferencias.vercel.app
- Banco de dados: Neon Postgres via `DATABASE_URL`
- Deploy: Vercel
- Repositorio conectado ao deploy automatico: `LuanValle/agendamento-video-conferencia`
- Regiao: Vercel `gru1` e Neon `sa-east-1`, ambos em Sao Paulo

Sempre que houver push no GitHub, a Vercel dispara um novo deploy do projeto.

## Funcionalidades

- Tela inicial com divisao entre solicitacao publica e login administrativo.
- Formulario publico para solicitar videoconferencias.
- Login administrativo com sessao HTTP-only.
- Painel administrativo com indicadores gerais.
- Lista de solicitacoes pendentes, aprovadas, rejeitadas e historico completo.
- Aprovacao e rejeicao de solicitacoes.
- Agenda de videoconferencias aprovadas.
- Cadastro, edicao, exclusao, conclusao e reabertura de videoconferencias.
- Videoconferencias concluidas destacadas e enviadas para o fim da agenda.
- Atualizacao automatica das telas administrativas por polling inteligente.
- Busca, filtros, exportacao CSV, backup JSON e impressao.

## Rotas do app

- `/`: tela inicial com as opcoes **Solicitar videoconferencia** e **Login**.
- `/solicitar`: formulario publico para enviar uma solicitacao.
- `/admin/login`: login administrativo.
- `/admin`: painel administrativo protegido.
- `/admin/solicitacoes`: solicitacoes pendentes.
- `/admin/agenda`: agenda aprovada.
- `/admin/rejeitadas`: solicitacoes rejeitadas.
- `/admin/todas`: historico completo de solicitacoes.

## Rotas da API

- `/api/status`: verifica se a API esta respondendo.
- `/api/db-test`: testa a conexao com o banco.
- `/api/setup-db`: prepara as tabelas do banco.
- `/api/admin-login`: autentica o administrador.
- `/api/admin-logout`: encerra a sessao administrativa.
- `/api/solicitacoes`: cria e lista solicitacoes. Aceita `status`, `limit` e `offset` para filtros e paginacao.
- `/api/solicitacoes/:id/aprovar`: aprova uma solicitacao.
- `/api/solicitacoes/:id/rejeitar`: rejeita uma solicitacao.
- `/api/videoconferencias`: cria e lista videoconferencias.
- `/api/videoconferencias/:id`: edita, conclui, reabre ou remove uma videoconferencia.

## Variaveis de ambiente

Crie um arquivo `.env.local` a partir de `.env.example`:

```bash
cp .env.example .env.local
```

Preencha os valores reais:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
ADMIN_USER=admin
ADMIN_PASSWORD=troque-esta-senha
ADMIN_SESSION_SECRET=troque-este-segredo
```

Descricao:

- `DATABASE_URL`: string de conexao do Neon Postgres.
- `ADMIN_USER`: usuario administrativo. Se omitido, usa `admin`.
- `ADMIN_PASSWORD`: senha administrativa obrigatoria.
- `ADMIN_SESSION_SECRET`: segredo usado para assinar a sessao HTTP-only. Se omitido, usa `ADMIN_PASSWORD`.

Nunca coloque senhas, tokens ou strings de conexao reais no GitHub. Depois de qualquer exposicao publica, gere novas credenciais no provedor e atualize as variaveis no ambiente local e na Vercel.

## Como rodar localmente

Instale as dependencias:

```bash
npm install
```

Inicie o Vite:

```bash
npm run dev
```

Para testar com as Vercel Functions localmente, use a Vercel CLI:

```bash
npx vercel dev
```

## Como fazer build

```bash
npm run build
```

O build final e gerado na pasta `dist/`.

## Testes e verificacoes

Verifique acentuacao quebrada e build de producao:

```bash
npm test
```

Rode um smoke test contra a producao ou contra um ambiente local:

```bash
npm run test:smoke
npm run test:smoke -- --base-url=http://127.0.0.1:3001
```

Se `ADMIN_USER` e `ADMIN_PASSWORD` estiverem no ambiente, o smoke test tambem valida rotas administrativas protegidas.

## Deploy na Vercel

O projeto esta conectado ao GitHub na Vercel. O fluxo esperado e:

1. Fazer alteracoes localmente.
2. Criar commit.
3. Fazer push para o GitHub.
4. A Vercel detectar o push e publicar automaticamente.

Configure estas variaveis no painel da Vercel:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_USER`, se quiser usar outro usuario alem de `admin`

Configuracoes de build:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

O arquivo `vercel.json` preserva as rotas `/api/*` e redireciona as demais rotas do app para `index.html`.

## Estrutura principal

```text
api/
  _auth.js
  _db.js
  _request.js
  _validators.js
  admin-login.js
  admin-logout.js
  db-test.js
  setup-db.js
  solicitacoes.js
  status.js
  videoconferencias.js

src/
  assets/
  components/
  pages/
  styles/
  utils/
  App.jsx
  main.jsx
```
