export type ProductUnit = 'UNIT' | 'GRAM' | 'KG';

export type Product = {
  id: string;
  name: string;
  priceUsd: number;
  priceBs: number;
  unit: ProductUnit;
  stock: number;
  barcode: string | null;
  isActive: boolean;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  debtUsd: number;
  debtBs: number;
  colorTag: string | null;
};

export type RateSource = 'manual' | 'bcv';

export type StoreSettings = {
  id: string;
  name: string;
  customRate: number;
  /** Legacy; la tasa manual ya no es permanente. */
  useFixedRate: boolean;
  bcvRate: number | null;
  bcvRateFetchedAt: string | null;
  manualRateSetAt: string | null;
  effectiveRate: number;
  rateSource: RateSource;
};

export type ExchangeRateRefreshResult = {
  rate: number;
  source: RateSource;
  fetchedAt: string | null;
  refreshed: boolean;
  store: StoreSettings;
};

export type CartLine = {
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  unitPriceUsd: number;
};

export type Invoice = {
  id: string;
  number: string;
  status: 'PAID' | 'PENDING';
  customerName: string | null;
  totalUsd: number;
  totalBs: number;
  lineCount: number;
  createdAt: string;
  payments: Record<string, number>;
};
