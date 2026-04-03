import { prisma } from "../../config/db.js";

const NOT_DELETED = { isDeleted: false } as const;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export async function getSummary() {
  const [incomeAgg, expenseAgg, totalTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...NOT_DELETED, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...NOT_DELETED, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: NOT_DELETED,
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalTransactions,
  };
}

export async function getCategoryBreakdown() {
  const groups = await prisma.transaction.groupBy({
    by: ["category"],
    where: NOT_DELETED,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  return groups.map((group) => ({
    category: group.category,
    totalAmount: group._sum.amount ?? 0,
    count: group._count.id,
  }));
}

interface MonthlyRaw {
  month: number;
  type: string;
  total: number;
}

export async function getMonthlyTrends(year: number) {
  const data = await prisma.$queryRaw<MonthlyRaw[]>`
    SELECT 
      EXTRACT(MONTH FROM "date")::int AS month,
      "type"::text AS type,
      COALESCE(SUM("amount"), 0)::float AS total
    FROM "transactions"
    WHERE "isDeleted" = false 
      AND EXTRACT(YEAR FROM "date") = ${year}
    GROUP BY EXTRACT(MONTH FROM "date"), "type"
    ORDER BY month
  `;

  const monthlyMap = new Map<number, { income: number; expenses: number }>();

  for (const row of data) {
    const existing = monthlyMap.get(row.month) ?? {
      income: 0,
      expenses: 0,
    };

    if (row.type === "INCOME") {
      existing.income = row.total;
    } else {
      existing.expenses = row.total;
    }

    monthlyMap.set(row.month, existing);
  }

  return MONTH_NAMES.map((name, index) => {
    const monthData = monthlyMap.get(index + 1) ?? {
      income: 0,
      expenses: 0,
    };

    return {
      month: name,
      income: monthData.income,
      expenses: monthData.expenses,
      net: monthData.income - monthData.expenses,
    };
  });
}

export async function getRecentActivity(limit: number) {
  const transactions = await prisma.transaction.findMany({
    where: NOT_DELETED,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
    },
  });

  return transactions;
}
