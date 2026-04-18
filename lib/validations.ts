import { BillKind, BillStatus, CategoryType, TransactionMethod, TransactionType } from '@prisma/client';
import { z } from 'zod';

export const transactionSchema = z.object({
  accountId: z.string().cuid(),
  categoryId: z.string().cuid(),
  type: z.nativeEnum(TransactionType),
  method: z.nativeEnum(TransactionMethod),
  description: z.string().min(2),
  amount: z.number().positive(),
  transactionDate: z.string().datetime(),
  notes: z.string().optional(),
  isInternalTransfer: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(CategoryType),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const accountSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  initialBalance: z.number().default(0),
});

export const billSchema = z.object({
  title: z.string().min(2),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  status: z.nativeEnum(BillStatus).default(BillStatus.PENDING),
  kind: z.nativeEnum(BillKind),
  recurrence: z.string().optional(),
});

export const goalSchema = z.object({
  name: z.string().min(2),
  targetAmount: z.number().positive(),
  monthRef: z.string().regex(/^\d{4}-\d{2}$/),
});
