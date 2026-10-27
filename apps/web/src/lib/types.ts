export type ProductUnit = 'UNIT' | 'GRAM';

export type ProductCategory = {
  id: string;
  name: string;
  sortOrder: number;
  productCount?: number;
};

export type Product = {
  id: string;
  name: string;
  priceUsd: number;
  priceBs: number;
  costUsd: number;
  unit: ProductUnit;
  stock: number;
  barcode: string | null;
  isActive: boolean;
  categoryId: string | null;
  category: Pick<ProductCategory, 'id' | 'name' | 'sortOrder'> | null;
};

export type ProductsListPage = {
  items: Product[];
  total: number;
  hasMore: boolean;
};

export type DailyIncome = {
  id: string;
  date: string;
  usdCash: number;
  cashBs: number;
  posBs: number;
  pos2Bs: number;
  mobileBs: number;
  biopagoBs: number;
  totalUsd: number;
  totalBs: number;
};

export type DailyIncomesListPage = {
  items: DailyIncome[];
  total: number;
  hasMore: boolean;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  debtUsd: number;
  debtBs: number;
  colorTag: string | null;
  createdAt: string;
};

export type CustomerDetail = Customer & {
  invoices: Invoice[];
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

export type InvoiceLine = {
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  unitPriceUsd: number;
  lineTotalUsd: number;
};

export type InvoicePayments = {
  usdCash: number;
  posBs: number;
  pos2Bs: number;
  mobileBs: number;
  cashBs: number;
  biopagoBs: number;
};

export type Invoice = {
  id: string;
  number: string;
  status: 'PAID' | 'PENDING';
  customerId?: string | null;
  customerName: string | null;
  rateApplied: number;
  totalUsd: number;
  totalBs: number;
  lineCount: number;
  lines: InvoiceLine[];
  createdAt: string;
  payments: InvoicePayments;
  change?: {
    usd: number;
    bs: number;
    mobileBs: number;
  };
  creditUsd?: number;
};

export type InvoiceSummary = {
  date: string;
  count: number;
  totalUsd: number;
  totalBs: number;
  usdCash: number;
  cashBs: number;
  posBs: number;
  pos2Bs: number;
  mobileBs: number;
  biopagoBs: number;
};
