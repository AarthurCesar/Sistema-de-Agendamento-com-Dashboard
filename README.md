# 🗓️ Sistema de Agendamento com Dashboard

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)

Uma plataforma completa e intuitiva desenvolvida para gerenciar agendamentos de serviços, com um painel administrativo (Dashboard) em tempo real que exibe métricas e relatórios essenciais para o negócio.

---

## 📑 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Roadmap](#-roadmap)
- [Contribuição](#-contribuição)
- [Autor](#-autor)
- [Licença](#-licença)

---

## 🚀 Funcionalidades

### 🔹 Área do Cliente (Agendamento)
* **Escolha de Serviços e Profissionais:** Interface amigável para selecionar o que deseja e com quem realizar.
* **Calendário Dinâmico:** Bloqueio automático de dias/horários indisponíveis ou já preenchidos.
* **Confirmação e Histórico:** Visualização de agendamentos pendentes, realizados e cancelados.

### 📊 Painel Administrativo (Dashboard)
* **Visão Geral:** Gráficos com faturamento mensal, total de agendamentos e taxa de cancelamento.
* **Gestão de Horários:** Painel para profissionais visualizarem sua agenda diária/semanal.
* **Controle de Clientes:** Listagem e histórico de pontualidade de cada cliente.
* **Relatórios:** Exportação de dados e análise de serviços mais procurados.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:

* **Frontend:** [React.js](https://react.dev/) (ES6+), [Tailwind CSS](https://tailwindcss.com/)
* **Gráficos:** [Recharts](https://recharts.org/)
* **Backend:** [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/)
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
* **Autenticação:** JWT (JSON Web Token)

---

## 📦 Como Executar o Projeto

### Pré-requisitos
Antes de começar, você vai precisar ter instalado em sua máquina o [Git](https://git-scm.com), o [Node.js](https://nodejs.org/en/) (versão 18 ou superior) e o [PostgreSQL](https://www.postgresql.org/).

### 🔧 Instalação e Execução

```bash
# 1. Clone este repositório
git clone https://github.com/seu-usuario/nome-do-repositorio.git

# 2. Acesse a pasta do projeto
cd nome-do-repositorio

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
# Copie o arquivo de exemplo e preencha com seus dados
cp .env.example .env

# 5. Execute as migrações do banco de dados
npm run migrate

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Após iniciar, a aplicação estará disponível em `http://localhost:3000`.

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto seguindo o modelo do `.env.example`:

```env
# Servidor
PORT=3000

# Banco de Dados (PostgreSQL)
DATABASE_URL=postgresql://usuario:senha@localhost:5432/agendamento

# Autenticação
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
```

---

## 📁 Estrutura de Pastas

```
.
├── src/
│   ├── client/          # Aplicação React (frontend)
│   ├── server/          # API Express (backend)
│   ├── database/        # Migrações e modelos
│   └── shared/          # Tipos e utilitários compartilhados
├── .env.example
├── package.json
└── README.md
```

---

## 🗺️ Roadmap

- [ ] Cadastro e login de clientes e profissionais
- [ ] Fluxo de agendamento com calendário dinâmico
- [ ] Dashboard com gráficos de faturamento e métricas
- [ ] Notificações por e-mail/SMS de confirmação
- [ ] Exportação de relatórios (PDF/CSV)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um *fork* deste repositório
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Faça commit das suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Faça push para a branch (`git push origin feature/minha-feature`)
5. Abra um *Pull Request*

---

## 👤 Autor

Desenvolvido por **Arthur C - Dev**.

[![GitHub](https://img.shields.io/badge/GitHub-AarthurCesar-181717?logo=github)](https://github.com/AarthurCesar)

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
