import { PrismaClient } from '@prisma/client';
import { toNumber } from '../src/shared/money.js';
import { createOpeningBalanceInvoice } from '../src/modules/opening-balance-invoice.js';
import { resolveEffectiveRateForStore } from '../src/modules/exchange-rates/service.js';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    where: { debtUsd: { gt: 0 } },
    include: { _count: { select: { invoices: true } } },
  });

  const needsInvoice = customers.filter(c => c._count.invoices === 0);
  if (needsInvoice.length === 0) {
    console.log('No hay clientes con deuda sin factura.');
    return;
  }

  for (const customer of needsInvoice) {
    const rate = await resolveEffectiveRateForStore(customer.storeId);
    const debtUsd = toNumber(customer.debtUsd);
    await prisma.$transaction(async tx => {
      const invoice = await createOpeningBalanceInvoice(tx, {
        storeId: customer.storeId,
        customerId: customer.id,
        debtUsd,
        rateApplied: rate,
      });
      console.log(
        `Cliente "${customer.name}" (${customer.id}): factura #${invoice?.number.toString() ?? 'existente'} por $${debtUsd}`,
      );
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
