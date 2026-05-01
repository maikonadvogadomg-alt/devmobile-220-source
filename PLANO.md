# PLANO DO PROJETO: DevMobile-2.2.0-source

> Gerado automaticamente pelo SK Code Editor em 30/04/2026, 22:35:23
> **55 arquivo(s)** | **~26.409 linhas de codigo**

---

## RESUMO EXECUTIVO

- **Tipo de aplicacao:** Aplicacao Web Frontend (React)
- **Frontend / Stack principal:** React, TypeScript

**Para rodar o projeto:**
```bash
# Abra index.html no Preview (botao Play)
```

---

## ESTRUTURA DE ARQUIVOS

```
DevMobile-2.2.0-source/
└── mobile/
    ├── .replit-artifact/
    │   └── artifact.toml
    ├── app/
    │   ├── (tabs)/
    │   │   ├── _layout.tsx
    │   │   ├── ai.tsx
    │   │   ├── editor.tsx
    │   │   ├── index.tsx
    │   │   ├── plugins.tsx
    │   │   ├── settings.tsx
    │   │   ├── tasks.tsx
    │   │   └── terminal.tsx
    │   ├── _layout.tsx
    │   └── +not-found.tsx
    ├── assets/
    │   └── images/
    │       └── icon.png
    ├── components/
    │   ├── AIChat.tsx
    │   ├── AIMemoryModal.tsx
    │   ├── CampoLivreModal.tsx
    │   ├── CheckpointsModal.tsx
    │   ├── CodeEditor.tsx
    │   ├── CombinarAppsModal.tsx
    │   ├── ErrorBoundary.tsx
    │   ├── ErrorFallback.tsx
    │   ├── FileSidebar.tsx
    │   ├── FloatingAI.tsx
    │   ├── GitHubModal.tsx
    │   ├── HtmlPlayground.tsx
    │   ├── KeyboardAwareScrollViewCompat.tsx
    │   ├── LibrarySearch.tsx
    │   ├── ManualModal.tsx
    │   ├── MessageRenderer.tsx
    │   ├── MonacoEditor.tsx
    │   ├── PreviewPanel.tsx
    │   ├── ProjectOverviewModal.tsx
    │   ├── ProjectPlanModal.tsx
    │   ├── SystemStatus.tsx
    │   ├── Terminal.tsx
    │   ├── VoiceAssistant.tsx
    │   └── VSCodeView.tsx
    ├── constants/
    │   └── colors.ts
    ├── context/
    │   └── AppContext.tsx
    ├── hooks/
    │   ├── useApiBase.ts
    │   └── useColors.ts
    ├── plugins/
    │   └── withTermuxIntent.js
    ├── scripts/
    │   └── build.js
    ├── server/
    │   ├── templates/
    │   │   └── landing-page.html
    │   └── serve.js
    ├── utils/
    │   ├── projectPlan.ts
    │   └── zipUtils.ts
    ├── .env
    ├── .gitignore
    ├── app.json
    ├── babel.config.js
    ├── eas.json
    ├── expo-env.d.ts
    ├── metro.config.js
    ├── package.json
    └── tsconfig.json
```

---

## STACK TECNOLOGICO DETECTADO

- **Frontend:** React, TypeScript

---

## VARIAVEIS DE AMBIENTE NECESSARIAS

Crie um arquivo `.env` na raiz com estas variaveis:

```env
EXPO_PUBLIC_DOMAIN=seu_valor_aqui
BASE_PATH=seu_valor_aqui
REPLIT_INTERNAL_APP_DOMAIN=seu_valor_aqui
REPLIT_DEV_DOMAIN=seu_valor_aqui
REPL_ID=seu_valor_aqui
EXPO_PUBLIC_REPL_ID=seu_valor_aqui
PORT=seu_valor_aqui
```

---

## ARQUIVOS PRINCIPAIS

- `mobile/app/(tabs)/index.tsx` — Arquivo principal

---

## GUIA COMPLETO — O QUE CADA PARTE DO PROJETO FAZ

> Esta secao explica, em linguagem simples, o que e para que serve cada pasta e cada arquivo.

### 📁 `mobile/`
> Pasta 'mobile' — agrupamento de arquivos relacionados.

**`.env`** _(2 linhas)_
Arquivo de variaveis secretas (senhas, chaves de API). NUNCA suba este arquivo para o GitHub.

**`.gitignore`** _(42 linhas)_
Lista de arquivos/pastas que o Git deve IGNORAR (nao versionar). Ex: node_modules, .env

**`app.json`** _(56 linhas)_
Arquivo de dados ou configuracao no formato JSON (chave: valor).

**`babel.config.js`** _(7 linhas)_
Arquivo de CONSTANTES/CONFIGURACAO — valores fixos usados em varios lugares do projeto.

**`eas.json`** _(50 linhas)_
Arquivo de dados ou configuracao no formato JSON (chave: valor).

**`expo-env.d.ts`** _(3 linhas)_
Arquivo TypeScript/JavaScript — logica, funcoes ou modulo do projeto.

**`metro.config.js`** _(4 linhas)_
Arquivo de CONSTANTES/CONFIGURACAO — valores fixos usados em varios lugares do projeto.

**`package.json`** _(71 linhas)_
Registro de dependencias e scripts do projeto. Aqui ficam os comandos (npm run dev, npm start) e os pacotes instalados.

**`tsconfig.json`** _(24 linhas)_
Configuracao do TypeScript. Diz para o computador como interpretar o codigo .ts e .tsx.

---

### 📁 `mobile/.replit-artifact/`
> Pasta '.replit-artifact' — agrupamento de arquivos relacionados.

**`artifact.toml`** _(23 linhas)_
Arquivo TOML — parte do projeto.

---

### 📁 `mobile/app/`
> Pasta 'app' — agrupamento de arquivos relacionados.

**`+not-found.tsx`** _(46 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

**`_layout.tsx`** _(70 linhas)_
Componente de LAYOUT — define a estrutura visual da pagina (cabecalho, sidebar, rodape). Envolve outros componentes.

---

### 📁 `mobile/components/`
> Pecas visuais reutilizaveis da interface (botoes, cards, formularios...).

**`AIChat.tsx`** _(972 linhas)_
Componente de CHAT/MENSAGENS — interface de conversa em tempo real.

**`AIMemoryModal.tsx`** _(203 linhas)_
Componente MODAL — janela/popup que aparece sobre a tela pedindo uma acao ou mostrando uma informacao importante.

**`CampoLivreModal.tsx`** _(989 linhas)_
Componente MODAL — janela/popup que aparece sobre a tela pedindo uma acao ou mostrando uma informacao importante.

**`CheckpointsModal.tsx`** _(173 linhas)_
Componente MODAL — janela/popup que aparece sobre a tela pedindo uma acao ou mostrando uma informacao importante.

**`CodeEditor.tsx`** _(337 linhas)_
Componente EDITOR — area de edicao de texto, codigo ou conteudo rico.

**`CombinarAppsModal.tsx`** _(352 linhas)_
Componente MODAL — janela/popup que aparece sobre a tela pedindo uma acao ou mostrando uma informacao importante.

**`ErrorBoundary.tsx`** _(55 linhas)_
Componente de ERRO — exibido quando algo da errado, com mensagem explicativa.

**`ErrorFallback.tsx`** _(279 linhas)_
Componente de ERRO — exibido quando algo da errado, com mensagem explicativa.

**`FileSidebar.tsx`** _(672 linhas)_
Componente de BARRA LATERAL — menu ou painel que aparece na lateral da tela.

**`FloatingAI.tsx`** _(897 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

**`GitHubModal.tsx`** _(975 linhas)_
Componente MODAL — janela/popup que aparece sobre a tela pedindo uma acao ou mostrando uma informacao importante.

**`HtmlPlayground.tsx`** _(706 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

**`KeyboardAwareScrollViewCompat.tsx`** _(30 linhas)_
Componente de PAGINA/TELA — representa uma tela completa navegavel no app.

**`LibrarySearch.tsx`** _(327 linhas)_
Componente de BUSCA — campo e logica para filtrar/encontrar conteudo.

**`ManualModal.tsx`** _(723 linhas)_
Componente MODAL — janela/popup que aparece sobre a tela pedindo uma acao ou mostrando uma informacao importante.

**`MessageRenderer.tsx`** _(265 linhas)_
Componente de CHAT/MENSAGENS — interface de conversa em tempo real.

**`MonacoEditor.tsx`** _(163 linhas)_
Componente EDITOR — area de edicao de texto, codigo ou conteudo rico.

**`PreviewPanel.tsx`** _(493 linhas)_
Componente de PAGINA/TELA — representa uma tela completa navegavel no app.

**`ProjectOverviewModal.tsx`** _(504 linhas)_
Componente MODAL — janela/popup que aparece sobre a tela pedindo uma acao ou mostrando uma informacao importante.

**`ProjectPlanModal.tsx`** _(369 linhas)_
Componente MODAL — janela/popup que aparece sobre a tela pedindo uma acao ou mostrando uma informacao importante.

**`SystemStatus.tsx`** _(480 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

**`Terminal.tsx`** _(824 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

**`VSCodeView.tsx`** _(616 linhas)_
Componente de PAGINA/TELA — representa uma tela completa navegavel no app.

**`VoiceAssistant.tsx`** _(954 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

---

### 📁 `mobile/constants/`
> Pasta 'constants' — agrupamento de arquivos relacionados.

**`colors.ts`** _(98 linhas)_
Arquivo TypeScript/JavaScript — logica, funcoes ou modulo do projeto.

---

### 📁 `mobile/context/`
> Gerenciamento de estado global — dados compartilhados entre telas.

**`AppContext.tsx`** _(1150 linhas)_
CONTEXT do React — mecanismo para compartilhar dados entre componentes sem passar por props.

---

### 📁 `mobile/hooks/`
> Hooks React customizados — logica reutilizavel de estado e efeitos.

**`useApiBase.ts`** _(62 linhas)_
HOOK de dados — busca informacoes da API e gerencia estado de carregamento e erro.

**`useColors.ts`** _(25 linhas)_
HOOK React personalizado para gerenciar estado/comportamento de 'colors'.

---

### 📁 `mobile/plugins/`
> Pasta 'plugins' — agrupamento de arquivos relacionados.

**`withTermuxIntent.js`** _(26 linhas)_
Arquivo TypeScript/JavaScript — logica, funcoes ou modulo do projeto.

---

### 📁 `mobile/scripts/`
> Pasta 'scripts' — agrupamento de arquivos relacionados.

**`build.js`** _(574 linhas)_
Arquivo TypeScript/JavaScript — logica, funcoes ou modulo do projeto.

---

### 📁 `mobile/server/`
> Pasta 'server' — agrupamento de arquivos relacionados.

**`serve.js`** _(136 linhas)_
Arquivo TypeScript/JavaScript — logica, funcoes ou modulo do projeto.

---

### 📁 `mobile/utils/`
> Funcoes auxiliares reutilizaveis em varios lugares do projeto.

**`projectPlan.ts`** _(208 linhas)_
Arquivo TypeScript/JavaScript — logica, funcoes ou modulo do projeto.

**`zipUtils.ts`** _(403 linhas)_
Funcoes UTILITARIAS — ferramentas reutilizaveis de uso geral no projeto.

---

### 📁 `mobile/app/(tabs)/`
> Pasta '(tabs)' — agrupamento de arquivos relacionados.

**`_layout.tsx`** _(152 linhas)_
Componente de LAYOUT — define a estrutura visual da pagina (cabecalho, sidebar, rodape). Envolve outros componentes.

**`ai.tsx`** _(81 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

**`editor.tsx`** _(1567 linhas)_
Componente EDITOR — area de edicao de texto, codigo ou conteudo rico.

**`index.tsx`** _(3209 linhas)_
Ponto de entrada do React — monta o componente App na pagina HTML.

**`plugins.tsx`** _(1234 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

**`settings.tsx`** _(1527 linhas)_
Componente de CONFIGURACOES — tela onde o usuario ajusta preferencias do app.

**`tasks.tsx`** _(522 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

**`terminal.tsx`** _(81 linhas)_
Componente React — parte visual reutilizavel da interface do usuario.

---

### 📁 `mobile/assets/images/`
> Pasta 'images' — agrupamento de arquivos relacionados.

**`icon.png`** _(2137 linhas)_
Arquivo de imagem.

---

### 📁 `mobile/server/templates/`
> Pasta 'templates' — agrupamento de arquivos relacionados.

**`landing-page.html`** _(461 linhas)_
Arquivo HTML — parte do projeto.

---

## CONTEXTO PARA IA (copie e cole para continuar o projeto)

> Use este bloco para explicar o projeto para qualquer IA ou desenvolvedor:

```
Projeto: DevMobile-2.2.0-source
Tipo: Aplicacao Web Frontend (React)
Stack: React, TypeScript
Arquivos: 55 | Linhas: ~26.409
Variaveis de ambiente necessarias: EXPO_PUBLIC_DOMAIN, BASE_PATH, REPLIT_INTERNAL_APP_DOMAIN, REPLIT_DEV_DOMAIN, REPL_ID, EXPO_PUBLIC_REPL_ID, PORT

Estrutura principal:
  mobile/.env
  mobile/.gitignore
  mobile/.replit-artifact/artifact.toml
  mobile/app.json
  mobile/app/(tabs)/_layout.tsx
  mobile/app/(tabs)/ai.tsx
  mobile/app/(tabs)/editor.tsx
  mobile/app/(tabs)/index.tsx
  mobile/app/(tabs)/plugins.tsx
  mobile/app/(tabs)/settings.tsx
  mobile/app/(tabs)/tasks.tsx
  mobile/app/(tabs)/terminal.tsx
  mobile/app/+not-found.tsx
  mobile/app/_layout.tsx
  mobile/assets/images/icon.png
  mobile/babel.config.js
  mobile/components/AIChat.tsx
  mobile/components/AIMemoryModal.tsx
  mobile/components/CampoLivreModal.tsx
  mobile/components/CheckpointsModal.tsx
  mobile/components/CodeEditor.tsx
  mobile/components/CombinarAppsModal.tsx
  mobile/components/ErrorBoundary.tsx
  mobile/components/ErrorFallback.tsx
  mobile/components/FileSidebar.tsx
  mobile/components/FloatingAI.tsx
  mobile/components/GitHubModal.tsx
  mobile/components/HtmlPlayground.tsx
  mobile/components/KeyboardAwareScrollViewCompat.tsx
  mobile/components/LibrarySearch.tsx
  mobile/components/ManualModal.tsx
  mobile/components/MessageRenderer.tsx
  mobile/components/MonacoEditor.tsx
  mobile/components/PreviewPanel.tsx
  mobile/components/ProjectOverviewModal.tsx
  mobile/components/ProjectPlanModal.tsx
  mobile/components/SystemStatus.tsx
  mobile/components/Terminal.tsx
  mobile/components/VSCodeView.tsx
  mobile/components/VoiceAssistant.tsx
  mobile/constants/colors.ts
  mobile/context/AppContext.tsx
  mobile/eas.json
  mobile/expo-env.d.ts
  mobile/hooks/useApiBase.ts
  mobile/hooks/useColors.ts
  mobile/metro.config.js
  mobile/package.json
  mobile/plugins/withTermuxIntent.js
  mobile/scripts/build.js
  mobile/server/serve.js
  mobile/server/templates/landing-page.html
  mobile/tsconfig.json
  mobile/utils/projectPlan.ts
  mobile/utils/zipUtils.ts
```

---

*Plano gerado pelo SK Code Editor — 30/04/2026, 22:35:23*