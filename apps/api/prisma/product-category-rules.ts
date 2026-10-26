/** Rubros acordados para la bodega (orden en UI). */
export const STORE_CATEGORY_DEFS = [
  { name: 'Chucherías', sortOrder: 1 },
  { name: 'Despensa', sortOrder: 2 },
  { name: 'Bebidas', sortOrder: 3 },
  { name: 'Bebidas alcohólicas', sortOrder: 4 },
  { name: 'Charcutería', sortOrder: 5 },
  { name: 'Farmacia e higiene personal', sortOrder: 6 },
  { name: 'Panadería', sortOrder: 7 },
  { name: 'Carnicería', sortOrder: 8 },
  { name: 'Limpieza del hogar', sortOrder: 9 },
  { name: 'Tabaco', sortOrder: 10 },
  { name: 'Otros', sortOrder: 11 },
] as const;

export type StoreCategoryName = (typeof STORE_CATEGORY_DEFS)[number]['name'];

const NAME_OVERRIDES: Record<string, StoreCategoryName> = {
  Panelada: 'Despensa',
  'Nucita crunch': 'Chucherías',
  'Nucita crunch mini': 'Chucherías',
  Katy: 'Chucherías',
  'Chees tres gde': 'Chucherías',
  Cheeskesitos: 'Chucherías',
  Huevis: 'Despensa',
  Hyevos: 'Despensa',
  'Polar light': 'Bebidas alcohólicas',
  'Panque 11 normal': 'Chucherías',
  Bocadillos: 'Chucherías',
  'Fruty aros de lonchera': 'Despensa',
  Boka: 'Despensa',
  Raquty: 'Chucherías',
  'Coco ranch': 'Chucherías',
  Samba: 'Chucherías',
  'Pigsi  gde': 'Chucherías',
};

const RULES: { pattern: RegExp; category: StoreCategoryName }[] = [
  { pattern: /^Vela\b/, category: 'Otros' },
  {
    pattern: /Teragrip|Loratadina|Loperam|Pañal|Afeitadora|Papel caricias|Papel Luciano/,
    category: 'Farmacia e higiene personal',
  },
  { pattern: /Suavizante|Jabón Alive/, category: 'Limpieza del hogar' },
  { pattern: /Solera|Samba|Cerveza|polarcita|Raquty|Boka|Pigsi|Coco ranch/, category: 'Bebidas alcohólicas' },
  { pattern: /Refresco|Glup|Agua |Nevada|Max coco|Fruty/, category: 'Bebidas' },
  { pattern: /Leche |Queso |Jamón|Mortadela/, category: 'Charcutería' },
  { pattern: /Muslo|Alas de|Para de pollo|Patas de pollo/, category: 'Carnicería' },
  { pattern: /Pan blanco|Pan de mantequilla|Pan mini sobaso|Panque|Panqué/, category: 'Panadería' },
  {
    pattern:
      /Arroz|Harina pan|Azúcar|Sal cristal|Pasta |Papelón|Aceite |Café |Salsa de tomate|Mayonesa|Compota|Bocadillos|Toddy/,
    category: 'Despensa',
  },
  { pattern: /Cigarro|Chimo/, category: 'Tabaco' },
  {
    pattern:
      /Twinkie|Tostón|Tom de|Tom Pepito|Torrejitas|Flaquitos|Palitos xl|Galleta|Deleitinas|Club social|Piruetas|Mini piruetas|Malvaviscos|Chocolate |Caramelo|Chupi|Chicle|Doritos|Ruffles|Flips|Salti|Maizoritos|Aros de cebolla|Golpe ranchero|Krakeñas|Rikesa|Justy|Diablito|Chao pastilla|Papas rulas/,
    category: 'Chucherías',
  },
];

function nameOverrideFor(productName: string): StoreCategoryName | undefined {
  const lower = productName.toLowerCase();
  for (const [key, category] of Object.entries(NAME_OVERRIDES)) {
    if (key.toLowerCase() === lower) return category;
  }
  return undefined;
}

export function categoryNameForProduct(productName: string): StoreCategoryName {
  const n = productName.trim();
  const override = nameOverrideFor(n);
  if (override) return override;
  for (const { pattern, category } of RULES) {
    if (pattern.test(n)) return category;
  }
  return 'Otros';
}
