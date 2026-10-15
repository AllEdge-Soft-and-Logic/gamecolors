// tools/generate-images.mjs
import fs from 'node:fs';
import path from 'node:path';

const IMG_DIR = path.resolve('img');
const OUT_FILE = path.join(IMG_DIR, 'images.json');
const ALLOWED = /\.(png|svg|jpe?g|webp|gif|avif)$/i;

if (!fs.existsSync(IMG_DIR)) {
    console.error(`❌ Folder not found: ${IMG_DIR}`);
    process.exit(1);
}

const files = fs.readdirSync(IMG_DIR)
    .filter((f) => ALLOWED.test(f))
    .filter((f) => f.toLowerCase() !== 'images.json')
    .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

fs.writeFileSync(OUT_FILE, JSON.stringify(files, null, 2));

console.log(`✅ Wrote ${files.length} image(s) → ${path.relative(process.cwd(), OUT_FILE)}`);
files.forEach((f) => console.log('   •', f));

// node tools/generate-images.mjs