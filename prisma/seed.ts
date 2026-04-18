import { Prisma, CategoryType, TransactionMethod, TransactionType } from '@prisma/client';
import { hash } from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? 'demo@finanas.com';
  const password = process.env.SEED_USER_PASSWORD ?? '12345678';
  const name = process.env.SEED_USER_NAME ?? 'Achilles Oliveira Souza';

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      passwordHash: await hash(password, 10),
    },
  });

  const categoriesSeed: Array<{ name: string; type: CategoryType }> = [
    { name: 'Recebimentos', type: CategoryType.INCOME },
    { name: 'Transferência para pessoa', type: CategoryType.TRANSFER },
    { name: 'Transferência interna', type: CategoryType.TRANSFER },
    { name: 'Carteira digital', type: CategoryType.EXPENSE },
    { name: 'Compras online', type: CategoryType.EXPENSE },
    { name: 'Alimentação', type: CategoryType.EXPENSE },
    { name: 'Transporte', type: CategoryType.EXPENSE },
    { name: 'Telecom', type: CategoryType.EXPENSE },
    { name: 'Viagem', type: CategoryType.EXPENSE },
    { name: 'Assinaturas', type: CategoryType.EXPENSE },
    { name: 'Moradia', type: CategoryType.EXPENSE },
    { name: 'Saúde', type: CategoryType.EXPENSE },
    { name: 'Lazer', type: CategoryType.EXPENSE },
    { name: 'Outros', type: CategoryType.EXPENSE },
    { name: 'Estorno / devolução', type: CategoryType.REFUND },
  ];

  for (const category of categoriesSeed) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: category.name } },
      update: { type: category.type },
      create: { userId: user.id, ...category },
    });
  }

  const account = await prisma.account.upsert({
    where: { id: 'conta-principal-seed' },
    update: {},
    create: {
      id: 'conta-principal-seed',
      userId: user.id,
      name: 'Conta principal',
      type: 'Banco',
      initialBalance: new Prisma.Decimal(2000),
    },
  });

  const categoryMap = new Map((await prisma.category.findMany({ where: { userId: user.id } })).map((c) => [c.name, c.id]));

  const samples = [
    { description: 'PIX RECEBIDO ITMOUT SERVICOS EMPRESARIAIS LTDA', amount: 3200, type: TransactionType.INCOME, method: TransactionMethod.PIX, categoryName: 'Recebimentos', isInternalTransfer: false },
    { description: 'PICPAY INSTITUICAO DE PAGAMENTO S/A', amount: 180, type: TransactionType.EXPENSE, method: TransactionMethod.PIX, categoryName: 'Carteira digital', isInternalTransfer: false },
    { description: 'MERCADO PAGO INSTITUICAO DE PAGAMENTO LTDA', amount: 220, type: TransactionType.EXPENSE, method: TransactionMethod.PIX, categoryName: 'Carteira digital', isInternalTransfer: false },
    { description: 'CLARO S A', amount: 119.9, type: TransactionType.EXPENSE, method: TransactionMethod.OTHER, categoryName: 'Telecom', isInternalTransfer: false },
    { description: 'UBER DO BRASIL TECNOLOGIA LTDA.', amount: 43.5, type: TransactionType.EXPENSE, method: TransactionMethod.OTHER, categoryName: 'Transporte', isInternalTransfer: false },
    { description: 'IFOOD.COM AGENCIA DE RESTAURANTE', amount: 72.8, type: TransactionType.EXPENSE, method: TransactionMethod.OTHER, categoryName: 'Alimentação', isInternalTransfer: false },
    { description: 'DANIELE LOPES DOS SANTOS', amount: 300, type: TransactionType.TRANSFER, method: TransactionMethod.TRANSFER, categoryName: 'Transferência para pessoa', isInternalTransfer: false },
    { description: 'DEVOLUCAO PIX RECEBIDA', amount: 55, type: TransactionType.REFUND, method: TransactionMethod.PIX, categoryName: 'Estorno / devolução', isInternalTransfer: false },
  ];

  for (const [index, item] of samples.entries()) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        categoryId: categoryMap.get(item.categoryName)!,
        type: item.type,
        method: item.method,
        description: item.description,
        amount: new Prisma.Decimal(item.amount),
        transactionDate: new Date(Date.now() - index * 86400000),
        isInternalTransfer: item.isInternalTransfer,
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
