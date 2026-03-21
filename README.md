# Red & Green Cassino - API Backend

Responsável por gerenciar toda a inteligência e segurança do cassino, garantindo que a lógica dos jogos, a geração de números aleatórios (RNG) e as transações de fichas ocorram em um ambiente seguro e isolado.

---

## Funcionalidades
- **Autenticação:** Gerenciamento de sessão de jogadores utilizando JWT.
- **Carteira:** Controle transacional e seguro das fichas dos usuários.
- **Motor de Regras:** Funcionamento dos jogos e cálculo de prêmios isolados do frontend.
- **Histórico:** Registro de apostas, login diário e outras informações relevantes.

---

## Principais Tecnologias Utilizadas

* **Framework Core:** NestJS 11
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL
* **ORM:** TypeORM
* **Infraestrutura Local:** Docker
* **Documentação:** Swagger
* **Qualidade e Padronização:** ESLint, Prettier, Husky, Commitlint e lint-staged.

---

## Executando o Projeto

#### 1. Pré-requisitos Certifique-se de ter instalado em sua máquina:

* **Node.js**
* **Docker**

#### 2. Copie o arquivo .env

```bash
cp .env.example .env
```

#### 3. Instale as dependências do projeto

```bash
npm install
```

#### 4. Subindo o container (Docker)

```bash
docker-compose up -d
```

#### 5. Iniciando o servidor do NestJS

```bash
npm run start:dev
```

#### 6. Documentação (Swagger)

Acesse a URL da documentação: http://localhost:3000/api

---

## Comandos Importantes (Scripts)

**Compila o projeto.**

```bash
npm run build
```
<br>

**Roda o Prettier para formatar o código automaticamente.**

```bash
npm run format
```
<br>

**Verifica erros de padronização com o ESLint.**

```bash
npm run lint
```

---

## Estrutura do Projeto

```text
RedGreen-Back/
├── src/
│   ├── core/                   # Código global (Filtros, Guards, Decorators)
│   │
│   └── modules/                # Domínios da Aplicação
│       ├── auth/               # Módulo de Autenticação (Exemplo)
│           │
│           ├── domain/         # Entidades (Tabelas), DTOs e Interfaces
│           ├── application/    # Regras de negócio (Services) e Lógicas
│           ├── infrastructure/ # Repositórios (TypeORM) e integrações externas
│           └── presentation/   # Controladores HTTP (Rotas) e Swagger
│
├── test/                       # Testes
├── docker-compose.yml          # Container do Projeto
└── nest-cli.json               # Configurações do Compilador