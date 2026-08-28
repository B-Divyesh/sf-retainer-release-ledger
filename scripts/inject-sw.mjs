import { readdir, readFile, writeFile } from 'node:fs/promises';

const assets = await readdir(new URL('../dist/assets/', import.meta.url));
const precache = [
  '/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png',
  '/assets/threshold-garden-720.webp', '/assets/threshold-garden-1200.webp',
  ...assets.map((name) => `/assets/${name}`),
];
const swUrl = new URL('../dist/sw.js', import.meta.url);
const source = await readFile(swUrl, 'utf8');
await writeFile(swUrl, source.replace('__PRECACHE_URLS__', JSON.stringify(precache)));
