import type { Prisma } from '@prisma/client';

export const productWithCategoryArgs = {
  include: { category: true },
} satisfies Prisma.ProductDefaultArgs;

export type ProductWithCategory = Prisma.ProductGetPayload<typeof productWithCategoryArgs>;
