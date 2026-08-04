# LojaVendas

Site de e-commerce com:
- Tabela de **usuários** (com papéis `USER` e `ADMIN`)
- Tabela de **produtos** vinculada ao usuário vendedor
- Usuário logado cadastra produtos com **nome, descrição, valor e imagem (arrastar e soltar)**
- Usuário não-administrador acessa a **tela de compras** com filtros (busca, vendedor, faixa de preço e ordenação)
- **Carrinho de compras** e **checkout com PayPal** (integração real via Orders API v2)

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- MySQL 8 (Docker)
- Prisma ORM
- NextAuth v5 (credenciais + bcrypt)
- PayPal REST API (sandbox por padrão)

## Pré-requisitos

- Node.js 20+
- Docker (para o banco MySQL)

## Configuração

### 1. Suba o banco de dados

```bash
docker run -d --name ps_vendas_db \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=vendas \
  -e MYSQL_USER=vendas -e MYSQL_PASSWORD=vendas \
  -p 3306:3306 -v mysqldata:/var/lib/mysql \
  mysql:8.0
```

(Se `docker compose` estiver disponível, o `docker-compose.yml` também funciona.)

### 2. Configure o ambiente

Copie as variáveis de `/.env` e ajuste:

```env
DATABASE_URL="mysql://vendas:vendas@localhost:3306/vendas"
AUTH_SECRET="gere-um-segredo-longo"           # ex: openssl rand -base64 32
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Credenciais PayPal (sandbox em https://developer.paypal.com)
PAYPAL_CLIENT_ID="seu-client-id"
PAYPAL_CLIENT_SECRET="seu-client-secret"
PAYPAL_API_BASE="https://api-m.sandbox.paypal.com"
PAYPAL_WEB_URL="https://www.sandbox.paypal.com"
```

### 3. Migre o banco e crie o admin

```bash
npm install
npm run db:migrate
npm run db:seed
```

O seed cria o administrador padrão: `admin@loja.com` / `admin123`
(configure via `ADMIN_EMAIL`/`ADMIN_PASSWORD` no `.env`).

### 4. Rode o projeto

```bash
npm run dev
```

Acesse http://localhost:3000

## Como usar

| Rota       | Função |
| ---------- | ------ |
| `/`        | Página inicial |
| `/register` | Criar conta (papel `USER`) |
| `/login`   | Entrar |
| `/dashboard` | Cadastrar/editar/excluir produtos com imagem (arrastar e soltar) |
| `/store`   | Loja com filtros (busca, vendedor, preço min/máx, ordenação) |
| `/cart`    | Carrinho + pagamento com PayPal |
| `/cart/success` | Retorno do PayPal (captura do pagamento) |
| `/admin`   | Painel administrativo (produtos, usuários, receita) |

## PayPal

A integração usa a **Orders API v2** (`/v2/checkout/orders`):

1. `POST /api/paypal/create-order` — valida o carrinho, cria a ordem no PayPal e registra o pedido como `PENDING` no banco.
2. O usuário é redirecionado ao PayPal.
3. `POST /api/paypal/capture-order` — ao voltar, captura o pagamento e marca o pedido como `COMPLETED`.

Use credenciais **sandbox** para testes. Para produção, troque `PAYPAL_API_BASE`/`PAYPAL_WEB_URL` para `https://api-m.paypal.com` e `https://www.paypal.com`.

## Scripts

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm start            # servidor de produção
npm run lint         # eslint
npm run db:migrate   # aplicar migrações
npm run db:seed      # criar usuário admin
```

## Segurança

- Senhas com hash `bcrypt`.
- Sessões JWT via NextAuth.
- Rotas de API verificam autenticação e propriedade do recurso.
- Upload de imagem validado (tipo e limite de 5MB).
- Preço do produto revalidado no servidor no momento do checkout.
