BEGIN;
DELETE FROM bodepos.inventory_movements;
DELETE FROM bodepos.products;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Vela 80', 0.17, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Tostón Tom de 280', 3.2, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Tostón Tom de 140', 1.85, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Tostón Tom Pepito familiar', 0.98, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Torrejitas azucaradas', 0.61, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Tom de 80', 0.98, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Tom Pepito peq', 0.28, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Toddy de bolsa', 1.85, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Teragrip', 1.81, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Solera azul', 0.78, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Saltitacos detallada', 0.56, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Salti tacos', 3.9, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Salsa de tomate pequeña pampero', 1.61, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Salsa de tomate pampero grande', 2.29, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Sal cristal', 0.45, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Ruffles', 1.49, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Rikesa peq', 4.09, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Rikesa', 5.92, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Refresco fanta', 1.73, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Refresco 2 litros coca cola', 1.78, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Raquty', 0.62, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Queso duro llanero', 8.16, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Polar light', 0.78, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Piruetas', 0.35, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Pañal hugme xg', 2.81, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Pañal hugme gde', 3, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Patas de pollo', 2.61, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Pasta medio kilo', 1.39, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Para de pollo', 2.61, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Papel caricias', 0.99, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Papel Luciano', 0.8, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Papas rulas peq', 0.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Panqué 11 normal', 0.94, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Panque 11 normal', 0.94, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Pan mini sobaso', 1.22, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Pan de mantequilla', 2.04, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Palitos xl', 1.98, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Nucita crunch mini', 0.78, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Nucita crunch', 2.05, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Nevada pequeña saborizada', 0.83, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Muslo', 3.3, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Mortadela corral pimenton', 4.42, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Mortadela corral mormal', 4.42, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Mortadela ahumada', 8.52, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Mini piruetas', 2.88, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Mayonesa mavesa gde', 4.21, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Max coco', 0.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Malvaviscos de tira', 0.72, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Maizoritos natural', 3.08, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Loratadina', 0.17, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Loperam', 0.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Leche pastoreña', 2.67, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Leche campestre sobre', 2.41, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Krakeñas', 1.3, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Katy', 0.75, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Justy mini bomba', 0.44, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Justy', 1.11, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Jamón de pierna prado', 9.38, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Jamón de pierna economico', 6.52, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Jabón Alive dekilo', 3.04, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Jabón Alive de medio', 1.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Hyevos', 3.12, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Harina pan', 1.3, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Golpe ranchero peq', 0.7, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Glup negro de 2 litros', 1.23, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Glup de litro', 0.83, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Glup de 2 litros sabores', 1.01, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Glup bombita', 0.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Fruty aros de lonchera', 0.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Flips mediano 120 gms', 2.07, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Flips lonchera', 0.72, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Diablito peq', 1.79, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Diablito gde', 3.25, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Compota Osole', 0.67, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Club social detallada', 0.36, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Club social', 2.04, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Cigarro universal', 2, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Chupi', 0.08, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Chocolate milka', 2.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Chocolate estadium', 0.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Chimo tigrito', 0.67, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Chimo apuereñito', 0.61, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Chicle agogo', 0.22, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Cheeskesitos', 0.8, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Chees tres gde', 2.21, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Chao pastilla', 0.28, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Cerveza polarcita', 0.78, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Cerveza de lata', 1.3, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Caramelos bianchi', 0.06, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Café flor de Arauca', 1.49, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Boka', 0.33, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Bocadillos', 0.11, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Azúcar montalban', 1.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Arroz Mary premium', 1.55, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Aros de cebolla peq', 0.34, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Aros de cebolla gde', 0.73, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Alas de pollo', 4.38, 'KG', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Agua litro y medio eleal', 0.61, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Agua de 5 litros', 2.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Agua cool bombita', 0.49, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Afeitadora max', 0.5, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Aceite cosmo 900', 3.42, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
INSERT INTO bodepos.products (store_id, name, price_usd, unit, stock, barcode, is_active, created_at, updated_at)
SELECT id, 'Aceite Vatel', 3, 'UNIT', 0, NULL, true, NOW(), NOW() FROM bodepos.stores;
COMMIT;