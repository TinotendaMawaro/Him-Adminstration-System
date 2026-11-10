// Generates qr.js: sets the flier's QR image to a code for the live site.   node marketing/make_qr.mjs
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const qrcode = require('qrcode-generator');
const here = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'https://him-administration-system.vercel.app';

const qr = qrcode(0, 'M');
qr.addData(url);
qr.make();
const svg = qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
const uri = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
writeFileSync(path.join(here, 'qr.js'), `window.QR_URI = ${JSON.stringify(uri)};\nvar el = document.getElementById('qr'); if (el) el.src = window.QR_URI;\n`);
console.log('qr.js for', url);
