import fs from 'fs';
import path from 'path';

const root = process.cwd();
const webNext = path.join(root, 'apps', 'web', '.next');
const rootNext = path.join(root, '.next');

if (!fs.existsSync(webNext)) {
  console.error(`Expected Next output at ${webNext} but it does not exist.`);
  process.exit(1);
}

fs.rmSync(rootNext, { recursive: true, force: true });
fs.cpSync(webNext, rootNext, { recursive: true });
console.log(`Copied ${webNext} -> ${rootNext}`);

