# agendamento-video-conferencia

## Rotas principais

- `/`: tela inicial com as op??es **Solicitar videoconfer?ncia** e **Login**.
- `/solicitar`: formul?rio p?blico para enviar uma solicita??o.
- `/admin/login`: login administrativo tempor?rio.
- `/admin`: painel administrativo protegido.
- `/admin/solicitacoes`: solicita??es pendentes.
- `/admin/agenda`: agenda aprovada.
- `/admin/rejeitadas`: solicita??es rejeitadas.
- `/admin/todas`: hist?rico completo de solicita??es.

## Login administrativo tempor?rio

```text
Usu?rio: admin
Senha: Luk35kyw@1k3r
```

Esse login ? tempor?rio e serve apenas como barreira visual. A senha est? no frontend e n?o representa seguran?a real. Para produ??o real, use Firebase Authentication e configure regras de seguran?a adequadas no Firestore para proteger leitura e escrita.

Sistema simples de agendamento de videoconferências criado com React e Vite, sem backend e com persistência local no navegador.

## Descrição

O **Agendador de Videoconferências** organiza reuniões de trabalho por data, horário, prioridade, responsável, setor e urgência visual. A interface foi pensada para uso em ambiente corporativo, com dashboard, filtros, busca, cards responsivos e recursos de backup.

## Objetivo

Centralizar uma agenda local de videoconferências, destacando reuniões próximas, vencidas, concluídas e prioridades altas ou críticas.

## Funcionalidades

- Modo telão para exibir somente a agenda de videoconferências em tela grande.

- Cadastro de videoconferências com validação de campos obrigatórios.
- Edição, exclusão com confirmação, conclusão e reabertura de reuniões.
- Ordenação automática por data e horário.
- Status textual: faltam dias, é hoje, vencida ou concluída.
- Cores por proximidade da data e prioridade visual em badges.
- Busca por nome, plataforma, responsável, setor e observações.
- Filtros por situação, prioridade e períodos.
- Dashboard com total, pendentes, concluídas, vencidas, reuniões de hoje e prioridades Alta/Crítica.
- Persistência em `localStorage`.
- Dados iniciais apenas na primeira execução.
- Exportação e importação de backup em JSON.
- Exportação em CSV compatível com Excel/LibreOffice.
- Modo de impressão com agenda limpa.
- Layout responsivo para desktop, notebook, tablet e celular.

## Tecnologias usadas

- React
- Vite
- JavaScript
- CSS puro
- localStorage
- lucide-react para ícones leves

## Estrutura de pastas

```text
src/
  pages/
    HomePage.jsx
    SolicitationPage.jsx
    AdminLogin.jsx
    AdminDashboard.jsx
    PendingRequests.jsx
    ApprovedAgenda.jsx
    RejectedRequests.jsx
    AllRequests.jsx
    NotFound.jsx

  components/
    ProtectedRoute.jsx
    Header.jsx
    Dashboard.jsx
    ConferenceForm.jsx
    ConferenceList.jsx
    ConferenceCard.jsx
    Filters.jsx
    SearchBar.jsx
    BackupActions.jsx
    EmptyState.jsx

  utils/
    dateUtils.js
    storage.js
    exportUtils.js
    validationUtils.js

  data/
    initialConferences.js

  styles/
    global.css

  App.jsx
  main.jsx
```

## Como rodar localmente

```bash
npm install
npm run dev
```

Depois acesse a URL exibida pelo Vite, normalmente `http://localhost:5173`.

## Como fazer build

```bash
npm run build
```

O build final será gerado na pasta `dist/`.

## Como rodar os testes

```bash
npm test
```

Os testes cobrem regras de data, status, ordenação, validação do formulário, validação do backup JSON e geração do CSV.

## Como subir na Vercel

1. Envie o projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Use as configurações padrão de Vite:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Faça o deploy.

## Uso do localStorage

As videoconferências são salvas no navegador usando `localStorage`. Isso permite que os dados continuem disponíveis após atualizar a página, sem necessidade de backend. Os dados ficam restritos ao navegador e ao dispositivo usado.

## Backup JSON

O botão **Exportar backup** gera um arquivo `backup-videoconferencias.json` com todas as reuniões cadastradas. O botão **Importar backup** permite restaurar um arquivo JSON válido e substituir os dados atuais após confirmação.

## Exportação CSV

O botão **Exportar CSV** gera uma planilha em formato `.csv` com as colunas:

- Nome
- Local/Plataforma
- Data
- Horário
- Prioridade
- Responsável
- Setor
- Link
- Status
- Situação
- Observações

O arquivo usa separador `;` e BOM UTF-8 para melhor compatibilidade com Excel e LibreOffice.

## Limitações da versão sem backend

- Os dados não são sincronizados entre dispositivos.
- Não há controle de usuários ou autenticação.
- A perda dos dados do navegador pode remover a agenda local.
- Backups precisam ser exportados manualmente para restauração futura.

## Possíveis melhorias futuras

- Sincronização com backend próprio.
- Controle de usuários e permissões.
- Notificações antes das reuniões.
- Integração com calendários externos.
- Importação de CSV.
- Histórico de alterações.
- Campos personalizados por setor.
