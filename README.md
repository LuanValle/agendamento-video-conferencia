# agendamento-video-conferencia

Sistema de agendamento de videoconferencias criado com React, Vite, Vercel Functions e banco Neon Postgres.

## Rotas principais

- `/`: tela inicial com as opcoes **Solicitar videoconferencia** e **Login**.
- `/solicitar`: formulario publico para enviar uma solicitacao.
- `/admin/login`: login administrativo.
- `/admin`: painel administrativo protegido.
- `/admin/solicitacoes`: solicitacoes pendentes.
- `/admin/agenda`: agenda aprovada.
- `/admin/rejeitadas`: solicitacoes rejeitadas.
- `/admin/todas`: historico completo de solicitacoes.

## Login administrativo

O login administrativo e validado pela API em `/api/admin-login`.

Configure as credenciais somente por variaveis de ambiente:

- `ADMIN_USER`: usuario administrativo. Se omitido, usa `admin`.
- `ADMIN_PASSWORD`: senha administrativa obrigatoria.
- `ADMIN_SESSION_SECRET`: segredo usado para assinar a sessao HTTP-only. Se omitido, usa `ADMIN_PASSWORD`.
- `DATABASE_URL`: conexao Postgres do Neon.

Nao coloque senhas, tokens ou strings de conexao reais no GitHub. Depois de qualquer exposicao publica, gere novas credenciais no provedor e atualize as variaveis no ambiente local e na Vercel.

## Funcionalidades

- Formulario publico para solicitar videoconferencias.
- Painel administrativo para aprovar ou rejeitar solicitacoes.
- Agenda de videoconferencias aprovadas.
- Cadastro, edicao, exclusao, conclusao e reabertura de videoconferencias.
- Busca, filtros, dashboard, exportacao CSV, backup JSON e impressao.
- Persistencia em Postgres via Neon.

## Estrutura principal

```text
src/
  pages/
  components/
  utils/
  styles/
api/
  admin-login.js
  solicitacoes.js
  videoconferencias.js
  App.jsx
  main.jsx
```

## Configuracao local

Crie um arquivo `.env.local` a partir de `.env.example` e preencha os valores reais:

```bash
cp .env.example .env.local
```

## Como fazer build

```bash
npm install
npm run build
```

O build final sera gerado na pasta `dist/`.

## Deploy na Vercel

Configure as variaveis `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` e, se necessario, `ADMIN_USER` no projeto da Vercel.

Use as configuracoes padrao:

- Build Command: `npm run build`
- Output Directory: `dist`

O arquivo `vercel.json` preserva as rotas `/api/*` e redireciona as demais rotas do app para `index.html`.
