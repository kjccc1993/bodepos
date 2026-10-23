import './load-env.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3610);
const app = createApp();

app.listen(port, '0.0.0.0', () => {
  console.log(`BodePOS API listening on http://0.0.0.0:${port}`);
});
