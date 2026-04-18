export type CsvBankRow = {
  Data?: string;
  Descricao?: string;
  Descrição?: string;
  Tipo?: string;
  Valor?: string;
  Saldo?: string;
  [key: string]: string | undefined;
};

export type PreviewTransaction = {
  lineNumber: number;
  description: string;
  amount: number;
  transactionDate: string;
  detectedType: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'REFUND';
  method: 'PIX' | 'QR_CODE' | 'MANUAL' | 'TRANSFER' | 'OTHER';
  categoryName: string;
  isInternalTransfer: boolean;
  importHash: string;
  duplicate: boolean;
};
