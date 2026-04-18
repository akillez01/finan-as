# Finan.as — Finanças pessoais com extrato bancário brasileiro

MVP funcional com Next.js 14 + Prisma + PostgreSQL para controle de finanças pessoais com foco em importação real de extratos CSV brasileiros (Pix, QR Code, devolução, transferências para pessoas, contas fixas e carteiras digitais).

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **UI:** Tailwind CSS + base compatível com shadcn/ui (`components.json`)
- **Backend:** Route Handlers do Next.js (`app/api/*`)
- **Banco:** PostgreSQL (Docker)
- **ORM:** Prisma
- **Validação:** Zod
- **Gráficos:** Recharts
- **Auth:** NextAuth (Credentials)
- **CSV:** PapaParse

## Estrutura

```txt
app/
components/
hooks/
lib/
prisma/
services/
types/
```

## Executando localmente

1. Copie o ambiente:

```bash
cp .env.example .env
```

2. Suba o banco:

```bash
docker compose up -d db
```

3. Instale dependências e prepare DB:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

4. Rode a aplicação:

```bash
npm run dev
```

Acesse em `http://localhost:3000`.

## Credenciais seed

- Email: `demo@finanas.com`
- Senha: `12345678`

## Telas implementadas

- `/login`
- `/dashboard`
- `/transactions`
- `/import`
- `/categories`
- `/accounts`
- `/bills`
- `/goals`
- `/reports`

## Importação CSV (preview + deduplicação)

Fluxo:

1. Upload do CSV na tela `/import`
2. Preview em `POST /api/import/preview`
   - detecta colunas (`Data`, `Descricao|Descrição`, `Tipo`, `Valor`, `Saldo` opcional)
   - infere tipo/método/categoria
   - calcula hash de deduplicação por linha
   - marca duplicados já importados
3. Confirmação em `POST /api/import/confirm`
   - grava `ImportBatch`
   - grava `ImportItem`
   - importa apenas novos lançamentos

## Regras de categorização automática

Regras prioritárias:

- `DEVOLUCAO`, `ESTORNO` => **Estorno / devolução** (REFUND)
- descrição contendo `ACHILLES OLIVEIRA SOUZA` => **Transferência interna** (TRANSFER + `isInternalTransfer=true`)
- `PICPAY`, `MERCADO PAGO` => **Carteira digital**
- `MERCADO LIVRE` => **Compras online**
- `CLARO` => **Telecom**
- `UBER` => **Transporte**
- `IFOOD` => **Alimentação**
- `LATAM` => **Viagem**
- `ITAU` => **Transferência para pessoa**
- textos que parecem nome de pessoa (`NOME SOBRENOME`) => **Transferência para pessoa**
- fallback => **Outros**

## Modelo de dados

Entidades:

- `User`
- `Account`
- `Category`
- `Transaction`
- `Bill`
- `Goal`
- `ImportBatch`
- `ImportItem`

Com suporte a:

- múltiplas contas/carteiras
- transação vinculada a conta e categoria
- `importHash` único por usuário
- exclusão de transferência interna dos gastos reais no dashboard/relatórios

## Entregáveis

- [x] Estrutura completa do projeto
- [x] Código funcional (front + APIs)
- [x] Schema Prisma
- [x] Migration inicial
- [x] Seed inicial
- [x] Docker + docker-compose
- [x] README
- [x] CSV de exemplo (`examples.extrato.csv`)
- [x] Regras de categorização automática
- [x] Checklist final

## Fases (status)

- [x] **Fase 1**: bootstrap Next + Tailwind + shadcn + Prisma + PostgreSQL + docs/env
- [x] **Fase 2**: modelagem + migration + seed + autenticação + rotas protegidas
- [x] **Fase 3**: dashboard + CRUD básico de transações + categorias + contas
- [x] **Fase 4**: importação CSV com preview + mapeamento + deduplicação
- [x] **Fase 5**: contas a pagar/receber + metas + relatórios + exportação CSV
- [x] **Fase 6**: revisão de UX mínima, validações base e próximos passos

## Próximos passos recomendados

1. Adicionar toasts e feedback global (ex.: sonner)
2. Adicionar paginação server-side na UI de transações
3. Adicionar testes automatizados (unitários e integração)
4. Melhorar mapeamento de layout de CSV por banco (Itaú, Nubank, Inter, C6)
5. Implementar edição/exclusão visual em todas as telas administrativas
