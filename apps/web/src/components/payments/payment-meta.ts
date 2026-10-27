import {
  faCoins,
  faCreditCard,
  faDollarSign,
  faFingerprint,
  faHandHoldingDollar,
  faMobileScreenButton,
  faMoneyBillWave,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export type PaymentColorPalette =
  | 'green'
  | 'brand'
  | 'purple'
  | 'blue'
  | 'cyan'
  | 'orange';

export type PaymentMetaEntry = {
  icon: IconDefinition;
  colorPalette: PaymentColorPalette;
};

export const PAYMENT_META: Record<string, PaymentMetaEntry> = {
  usd: { icon: faDollarSign, colorPalette: 'green' },
  cashBs: { icon: faMoneyBillWave, colorPalette: 'brand' },
  biopago: { icon: faFingerprint, colorPalette: 'purple' },
  pos: { icon: faCreditCard, colorPalette: 'blue' },
  pos2: { icon: faCreditCard, colorPalette: 'blue' },
  mobile: { icon: faMobileScreenButton, colorPalette: 'cyan' },
  credit: { icon: faHandHoldingDollar, colorPalette: 'orange' },
  totalBs: { icon: faCoins, colorPalette: 'green' },
};

export function getPaymentMeta(id: string): PaymentMetaEntry {
  return PAYMENT_META[id] ?? PAYMENT_META.usd;
}
