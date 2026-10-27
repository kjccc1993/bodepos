import {
  dailyIncomeAmountMetrics,
  type DailyIncomeAmounts,
} from '@/components/daily-incomes/daily-income-metrics';
import { PaymentAmountsSection } from '@/components/payments/PaymentAmountsSection';

type Props = {
  amounts: DailyIncomeAmounts;
  /** Fondo gris + padding como en la tarjeta de facturas (listado). */
  section?: boolean;
};

export function DailyIncomeAmountsGrid({ amounts, section = true }: Props) {
  const metrics = dailyIncomeAmountMetrics(amounts);
  return <PaymentAmountsSection metrics={metrics} section={section} />;
}
