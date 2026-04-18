import { CategoryType, TransactionMethod, TransactionType } from '@prisma/client';

const PERSON_REGEX = /^[A-ZÀ-Ú]{2,}(\s+[A-ZÀ-Ú]{2,}){1,}$/;
const SELF_NAME = 'ACHILLES OLIVEIRA SOUZA';

function normalize(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

export function inferFromDescription(rawDescription: string, rawType?: string) {
  const description = normalize(rawDescription);
  const typeHint = normalize(rawType ?? '');

  if (description.includes('DEVOLU') || description.includes('ESTORNO') || typeHint.includes('DEVOLU')) {
    return {
      type: TransactionType.REFUND,
      method: TransactionMethod.PIX,
      categoryName: 'Estorno / devolução',
      categoryType: CategoryType.REFUND,
      isInternalTransfer: false,
    };
  }

  if (description.includes(SELF_NAME)) {
    return {
      type: TransactionType.TRANSFER,
      method: TransactionMethod.TRANSFER,
      categoryName: 'Transferência interna',
      categoryType: CategoryType.TRANSFER,
      isInternalTransfer: true,
    };
  }

  const rules: Array<{ keys: string[]; categoryName: string; method?: TransactionMethod; type?: TransactionType; categoryType: CategoryType }> = [
    { keys: ['PICPAY', 'MERCADO PAGO'], categoryName: 'Carteira digital', method: TransactionMethod.PIX, categoryType: CategoryType.EXPENSE },
    { keys: ['MERCADO LIVRE'], categoryName: 'Compras online', categoryType: CategoryType.EXPENSE },
    { keys: ['CLARO'], categoryName: 'Telecom', categoryType: CategoryType.EXPENSE },
    { keys: ['UBER'], categoryName: 'Transporte', categoryType: CategoryType.EXPENSE },
    { keys: ['IFOOD'], categoryName: 'Alimentação', categoryType: CategoryType.EXPENSE },
    { keys: ['LATAM'], categoryName: 'Viagem', categoryType: CategoryType.EXPENSE },
    { keys: ['ITAU'], categoryName: 'Transferência para pessoa', method: TransactionMethod.TRANSFER, type: TransactionType.TRANSFER, categoryType: CategoryType.TRANSFER },
  ];

  for (const rule of rules) {
    if (rule.keys.some((key) => description.includes(key))) {
      const isIncome = typeHint.includes('RECEB') || typeHint.includes('CREDITO');
      return {
        type: rule.type ?? (isIncome ? TransactionType.INCOME : TransactionType.EXPENSE),
        method: rule.method ?? (description.includes('PIX') ? TransactionMethod.PIX : TransactionMethod.OTHER),
        categoryName: rule.categoryName,
        categoryType: rule.categoryType,
        isInternalTransfer: false,
      };
    }
  }

  if (description.includes('PIX')) {
    const isIncome = typeHint.includes('RECEB') || description.includes('PIX RECEBIDO');
    return {
      type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
      method: description.includes('QR') ? TransactionMethod.QR_CODE : TransactionMethod.PIX,
      categoryName: isIncome ? 'Recebimentos' : 'Transferência para pessoa',
      categoryType: isIncome ? CategoryType.INCOME : CategoryType.TRANSFER,
      isInternalTransfer: false,
    };
  }

  if (PERSON_REGEX.test(description)) {
    return {
      type: TransactionType.TRANSFER,
      method: TransactionMethod.TRANSFER,
      categoryName: 'Transferência para pessoa',
      categoryType: CategoryType.TRANSFER,
      isInternalTransfer: false,
    };
  }

  return {
    type: TransactionType.EXPENSE,
    method: TransactionMethod.OTHER,
    categoryName: 'Outros',
    categoryType: CategoryType.EXPENSE,
    isInternalTransfer: false,
  };
}
