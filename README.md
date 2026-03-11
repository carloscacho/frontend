# Eventos IFMS - Frontend

Interface web para o sistema de gerenciamento de eventos do Instituto Federal de Mato Grosso do Sul (IFMS). Desenvolvido com [Next.js](https://nextjs.org/) utilizando App Router, este projeto oferece desde um painel administrativo completo para a gestão de eventos, atividades e usuários, até a visão pública e área do participante.

## 🚀 Tecnologias Utilizadas

- **[Next.js 15](https://nextjs.org/)**: Framework React com renderização híbrida e App Router.
- **[React 19](https://react.dev/)**: Biblioteca para construção de interfaces de usuário.
- **[Tailwind CSS 3](https://tailwindcss.com/)**: Framework CSS utilitário.
- **[DaisyUI 5](https://daisyui.com/)**: Biblioteca de componentes com design system baseado no Tailwind CSS.
- **[Zustand / Context API]**: Gerenciamentos de estado globais (alertas, navegação).
- **[Html5-Qrcode](https://github.com/mebjas/html5-qrcode)**: Leitura de QR Codes (credenciamento e check-in em atividades).

## ✨ Funcionalidades

- **Múltiplos Eventos (Multi-tenant)**: Acesso às páginas dos eventos dinamicamente pelas URLs baseadas no slug (ex: `/sct2023`).
- **Autenticação e Autorização**: Login de usuários (Participantes, Auxiliares, Admin) com controle de acesso e recuperação de senhas.
- **Gestão de Eventos e Programação**: Criação de trilhas, horários, vinculação com palestrantes e certificados.
- **Credenciamento via QR Code**: Leitura de ingressos do participante diretamente do navegador em dispositivos móveis e desktops.
- **Componentização Avançada**: Componentes unificados e modulares distribuídos através de Feature Slices (Modules) e UI compartilhada (Shared components).

## 📦 Instalação e Execução

Pré-requisitos: Node.js (recomendado LTS) e NPM.

1.  **Instale as dependências**:
    ```bash
    npm install
    ```

2.  **Configure as variáveis de ambiente**:
    Crie um arquivo `.env.local` na raiz do diretório frontend e defina a URL da sua API:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:4455
    ```

3.  **Execute o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```

4.  **Acesse a aplicação**:
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador. Os eventos serão acessados por paths dinâmicos baseados no slug (ex: `http://localhost:3000/meu-evento`).

## 📂 Estrutura de Pastas

O projeto utiliza uma arquitetura baseada em recursos (Feature Sliced/Modules Style) integrada ao App Router do Next.js:

- `src/app/`: Páginas e layouts roteáveis do Next.js (App Router). Contém rotas dinâmicas como `[slug]` e `admin`.
- `src/modules/`: Regras de negócio, telas e hooks divididos por domínios da aplicação (ex: `eventos`, `atividades`, `admin`, `usuarios`).
- `src/shared/`: Código compartilhado em todo o sistema.
  - `components/`: UI genérica como botões, inputs, painéis, modais e layouts.
  - `contexts/`: Provedores de estado e serviços transversais (Alertas, Loader, Autenticação).
  - `hooks/`: Hooks globais utilitários.
  - `styles/`: Arquivos CSS globais.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.
