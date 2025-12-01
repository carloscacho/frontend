# Eventos IFMS - Frontend

Interface web para o sistema de gerenciamento de eventos do Instituto Federal de Mato Grosso do Sul (IFMS). Desenvolvido com [Next.js](https://nextjs.org/), este projeto oferece um painel administrativo completo para gestão de eventos, atividades, palestrantes e usuários.

## 🚀 Tecnologias Utilizadas

- **[Next.js](https://nextjs.org/)**: Framework React para produção.
- **[React](https://reactjs.org/)**: Biblioteca para construção de interfaces de usuário.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utilitário para estilização rápida e responsiva.
- **[Axios](https://axios-http.com/)**: Cliente HTTP para comunicação com a API.
- **[React Icons](https://react-icons.github.io/react-icons/)**: Biblioteca de ícones.

## ✨ Funcionalidades

- **Autenticação e Autorização**: Login de usuários e controle de acesso baseado em níveis (Admin, Comum, Auxiliar).
- **Gestão de Eventos**: Cadastro, edição e exclusão de eventos.
- **Gestão de Atividades**: Controle detalhado de atividades, incluindo horários, locais e palestrantes vinculados.
- **Gestão de Palestrantes**: Cadastro de palestrantes e associação com eventos e atividades.
- **Gestão de Salas e Turnos**: Administração de recursos físicos e temporais.
- **Gestão de Usuários**: Controle de usuários do sistema e atribuição de cargos.
- **Feedback Visual**: Sistema de alertas e modais para confirmação de ações e feedback de erros.

## 📦 Instalação e Execução

1.  **Clone o repositório** (se ainda não o fez):
    ```bash
    git clone <url-do-repositorio>
    cd eventosIFMS/frontend
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Execute o servidor de desenvolvimento**:
    ```bash
    npm run dev
    # ou
    yarn dev
    ```

4.  **Acesse a aplicação**:
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📂 Estrutura de Pastas

- `src/app`: Páginas e rotas da aplicação (App Router).
- `src/app/_components`: Componentes reutilizáveis (Botões, Inputs, Modais, etc.).
- `src/context`: Contextos do React (Auth, Alert, Modal, etc.).
- `src/utils`: Funções utilitárias e configurações (CRUD, formatação de datas).

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.
