// Las propuestas descartadas quedan solo en local (npm run dev): se borran del build publicado.
import { rmSync } from 'node:fs';
for (const p of ['propuestas', 'editorial', 'revista', 'indice']) rmSync(`dist/${p}`, { recursive: true, force: true });
