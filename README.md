BiblioTech
Bem-vindo à BiblioTech, a solução completa para gerenciar reservas e disponibilizar livros físicos e digitais. Este projeto foi desenvolvido para oferecer uma interface moderna, responsiva e funcional, atendendo tanto administradores quanto usuários comuns.

Funcionalidades
1. Login e Cadastro
Login:
Autenticação de usuários baseada em email e senha.
Mensagens de erro amigáveis em caso de credenciais inválidas.
Cadastro:
Registro de novos usuários com informações básicas: nome, email e senha.
Papel padrão do usuário: user.
Confirmação visual de sucesso no cadastro.
2. Gerenciamento de Livros
Visualização de Livros:
Lista completa de livros disponíveis com opções de busca por título ou autor.
Adicionar Livros:
Usuários administradores podem cadastrar novos livros, especificando:
Título, Autor, Tipo (Físico ou Ebook).
Quantidade disponível e local de retirada (para físicos).
Link de acesso (para ebooks).
Editar e Remover Livros:
Administradores podem atualizar informações ou remover livros do catálogo.
3. Reservas de Livros
Reserva por Usuários:
Usuários comuns podem reservar livros físicos ou acessar ebooks diretamente.
Controle automático de disponibilidade para livros físicos.
Ver Minhas Reservas:
Visualização de todos os livros reservados por um usuário, com informações detalhadas:
Data de reserva.
Local de retirada (para físicos).
Link de acesso (para ebooks).
Relatórios:
Administradores podem acessar relatórios completos, incluindo:
Total de livros no catálogo.
Total de reservas realizadas.
Livros mais reservados.
4. Estilo e Design
Interface moderna e responsiva baseada em CSS Modules.
Gradientes e sombras sutis para um design profissional.
Botões e links com transições suaves, melhorando a experiência do usuário.

Tecnologias Utilizadas --->

Frontend
React:
Componentização para facilitar manutenção e reuso de código.
CSS Modules:
Estilização modular para evitar conflitos de estilo.
React Router Dom:
Navegação entre páginas de forma dinâmica.

Backend Simulado
JSON Server:
API REST simulada para gerenciar dados de usuários, livros e reservas.
Rápida configuração e suporte a operações CRUD.

Setup do Projeto -->
Requisitos:
    Node.js (>=14)
    NPM ou Yarn

Instalação -->
Clone o repositório:
    git clone https://github.com/seu-repositorio/bibliotech.git
    cd bibliotech
    npm install react react-dom react-router-dom axios react-icons react-scripts json-server @testing-library/react @testing-library/jest-dom @testing-library/user-event web-vitals

URLs -->
    Frontend: http://localhost:3000
    JSON Server: http://localhost:5501
    APIs do JSON Server

Como rodar? -->
    Inicialize o servidor ---> npm run server
    Inicialize o projeto ---> npm start
    E prontinho! agora o projeto deve abrir no seu navegador!
    
Usuários
    GET /usuarios: Retorna todos os usuários.
    POST /usuarios: Adiciona um novo usuário.

Livros
    GET /livros: Retorna todos os livros.
    POST /livros: Adiciona um novo livro.
    PATCH /livros/:id: Atualiza informações de um livro.
    DELETE /livros/:id: Remove um livro.

Reservas
    GET /reservas: Retorna todas as reservas.
    POST /reservas: Adiciona uma nova reserva.
    PATCH /reservas/:id: Atualiza uma reserva existente.

Testando Funcionalidades 

Cadastro e Login:
Crie um novo usuário pela página de Cadastro.
Faça login com o email e senha registrados.

Gerenciamento de Livros:
Acesse a página de Adicionar Livro como administrador.
Edite ou remova livros existentes no catálogo.

Reservas:
Faça login como usuário comum e reserve livros disponíveis.
Visualize suas reservas na seção "Minhas Reservas".

Relatórios:
Faça login como administrador e navegue até "Relatórios" para visualizar estatísticas.
Futuras Melhorias
Autenticação JWT:
Substituir a autenticação local por tokens JWT.
Suporte para imagens de capa:
Permitir upload de imagens para os livros.
Paginação:
Melhorar o carregamento de grandes volumes de dados.


