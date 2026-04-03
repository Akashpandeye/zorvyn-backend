import { prisma, TransactionType } from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  notes?: string;
}

interface UpdateTransactionInput {
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: string;
  notes?: string;
}

interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

const NOT_DELETED = { isDeleted: false } as const;

export async function create(input: CreateTransactionInput, userId: string) {
  const transaction = await prisma.transaction.create({
    data: {
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      notes: input.notes,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return transaction;
}

export async function getAll(filters: TransactionFilters) {
  const skip = (filters.page - 1) * filters.limit;

  const where: Record<string, unknown> = { ...NOT_DELETED };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.category) {
    where.category = {
      contains: filters.category,
      mode: "insensitive",
    };
  }

  if (filters.startDate || filters.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.lte = new Date(filters.endDate);
    where.date = dateFilter;
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: filters.limit,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getById(id: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, ...NOT_DELETED },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return transaction;
}

export async function update(id: string, input: UpdateTransactionInput) {
  const existing = await prisma.transaction.findFirst({
    where: { id, ...NOT_DELETED },
  });

  if (!existing) {
    throw new ApiError(404, "Transaction not found");
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.date !== undefined && { date: new Date(input.date) }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return transaction;
}

export async function softDelete(id: string) {
  const existing = await prisma.transaction.findFirst({
    where: { id, ...NOT_DELETED },
  });

  if (!existing) {
    throw new ApiError(404, "Transaction not found");
  }

  await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true },
  });
}
