# Guia do codigo

Este arquivo explica a organizacao do sistema para facilitar manutencao e futuras mudancas.

## Visao geral

O projeto tem duas partes:

- `src/`: frontend React que aparece para o usuario.
- `api/`: Vercel Functions que validam login, recebem solicitacoes e gravam dados no Neon Postgres.

O frontend consome as rotas `/api/*`. As credenciais administrativas e a conexao do banco ficam em variaveis de ambiente, nunca no codigo versionado.

## Fluxo principal

1. O usuario acessa `/solicitar` e envia uma solicitacao.
2. A solicitacao entra como `pendente`.
3. O administrador acessa `/admin/solicitacoes`.
4. Ao aprovar, a solicitacao vira uma videoconferencia na agenda.
5. A agenda aprovada aparece em `/admin/agenda`.

## Pastas do frontend

### `src/pages/`

Telas completas do sistema.

- `HomePage.jsx`: tela inicial.
- `SolicitationPage.jsx`: formulario publico de solicitacao.
- `AdminLogin.jsx`: login administrativo via API.
- `AdminLayout.jsx`: estrutura das paginas administrativas.
- `AdminDashboard.jsx`: resumo geral do admin.
- `PendingRequests.jsx`: analise de solicitacoes pendentes.
- `ApprovedAgenda.jsx`: agenda aprovada, cadastro, filtros e exportacao.
- `RejectedRequests.jsx`: solicitacoes rejeitadas.
- `AllRequests.jsx`: historico de solicitacoes.
- `NotFound.jsx`: pagina para rotas inexistentes.

### `src/components/`

Pecas reutilizaveis usadas pelas telas.

- `ConferenceForm.jsx`: formulario de cadastro/edicao da agenda.
- `ConferenceCard.jsx`: card de uma videoconferencia aprovada.
- `ConferenceList.jsx`: lista de cards da agenda.
- `RequestCard.jsx`: card de uma solicitacao publica.
- `Dashboard.jsx`: numeros resumidos.
- `Filters.jsx`: botoes de filtro.
- `SearchBar.jsx`: campo de busca.
- `ExportActions.jsx`: botoes de exportar/importar/imprimir.
- `RejectModal.jsx`: modal para informar motivo de rejeicao.
- `ProtectedRoute.jsx`: bloqueia rotas admin sem login.

### `src/utils/`

Regras e funcoes auxiliares.

- `apiMappers.js`: converte nomes do banco/API para o formato usado pela tela.
- `formatters.js`: padroniza exibicao de datas, horarios e textos.
- `useSmartPolling.js`: atualiza listas periodicamente sem excesso de requisicoes.
- `requestUtils.js`: resumo do dashboard e conversao de solicitacao para agenda.
- `dateUtils.js`: regras de data, vencimento, filtros e ordenacao.
- `validationUtils.js`: validacao de formulario e backup.
- `exportUtils.js`: backup JSON, importacao JSON e CSV.

## API

### `api/admin-login.js`

Valida `ADMIN_USER` e `ADMIN_PASSWORD` no servidor e cria um cookie HttpOnly para as areas administrativas.

### `api/_auth.js`

Centraliza a leitura do cookie administrativo e protege rotas que exigem login.

### `api/_db.js`

Cria o cliente Neon usando `DATABASE_URL`.

### Rotas principais

- `GET /api/status`: verifica se a API esta online.
- `POST /api/solicitacoes`: cria solicitacao publica.
- `GET /api/solicitacoes`: lista solicitacoes para o admin.
- `PATCH /api/solicitacoes/:id/aprovar`: aprova solicitacao.
- `PATCH /api/solicitacoes/:id/rejeitar`: rejeita solicitacao.
- `GET /api/videoconferencias`: lista videoconferencias aprovadas.
- `POST /api/videoconferencias`: cria videoconferencia manualmente.
- `PATCH /api/videoconferencias/:id`: atualiza uma videoconferencia.
- `DELETE /api/videoconferencias/:id`: exclui uma videoconferencia.

## Onde mexer no futuro

- Para mudar o contrato com o banco: comece por `api/` e `src/utils/apiMappers.js`.
- Para mudar campos do formulario publico: mexa em `src/pages/SolicitationPage.jsx`.
- Para mudar campos da agenda aprovada: mexa em `src/components/ConferenceForm.jsx` e `src/pages/ApprovedAgenda.jsx`.
- Para mudar regras de vencimento e filtros de data: mexa em `src/utils/dateUtils.js`.
- Para mudar exportacao CSV/backup: mexa em `src/utils/exportUtils.js`.
