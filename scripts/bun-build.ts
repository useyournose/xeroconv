import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const srcDir = join(root, 'src');
const outDir = join(root, 'out');
const assetDir = join(srcDir, 'assets');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, 'assets'), { recursive: true });

cpSync(assetDir, join(outDir, 'assets'), { recursive: true });
cpSync(join(srcDir, 'robots.txt'), join(outDir, 'robots.txt'));
cpSync(join(srcDir, 'sitemap.txt'), join(outDir, 'sitemap.txt'));
cpSync(join(srcDir, 'manifest.json'), join(outDir, 'manifest.json'));

const htmlPath = join(srcDir, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const transformedHtml = html
  .replace(/href="\.\.\/node_modules\/@fortawesome\/fontawesome-free\/css\/all\.css"/g, '')
  .replace(/href="assets\/favicon\.ico"/g, 'href="./assets/favicon.ico"')
  .replace(/href="assets\/apple-touch-icon\.png"/g, 'href="./assets/apple-touch-icon.png"')
  .replace(/href="assets\/android-chrome-192x192\.png"/g, 'href="./assets/android-chrome-192x192.png"')
  .replace(/href="assets\/android-chrome-512x512\.png"/g, 'href="./assets/android-chrome-512x512.png"')
  .replace(/href="manifest\.json"/g, 'href="./manifest.json"')
  .replace(/href="style\.css"/g, 'href="./index.css"')
  .replace(/src="index\.ts" type="module"/g, 'src="./index.js" type="module"')
  .replace(/src="js\/service-worker-reg\.ts" type="module"/g, 'src="./service-worker-reg.js" type="module"');

writeFileSync(join(outDir, 'index.html'), transformedHtml);

const commands = [
  ['bun', 'build', './src/index.ts', '--outdir', './out', '--target', 'browser'],
  ['bun', 'build', './src/js/service-worker-reg.ts', '--outfile', './out/service-worker-reg.js', '--target', 'browser'],
  ['bun', 'build', './src/service-worker.ts', '--outfile', './out/service-worker.js', '--target', 'browser'],
];

for (const command of commands) {
  const result = Bun.spawnSync(command, {
    cwd: root,
    stdio: ['inherit', 'inherit', 'inherit'],
  });

  if (!result.success) {
    throw new Error(`Build command failed: ${command.join(' ')}`);
  }
}

const swRegPath = join(outDir, 'service-worker-reg.js');
const swReg = readFileSync(swRegPath, 'utf8').replace(/\.\.\/service-worker/g, './service-worker.js');
writeFileSync(swRegPath, swReg);

const rootIndex = join(outDir, 'index.html');
const indexHtml = readFileSync(rootIndex, 'utf8');
const finalHtml = indexHtml
  .replace(/src="\.\/index\.js"/g, 'src="./index.js"')
  .replace(/href="\.\/index\.css"/g, 'href="./index.css"');

writeFileSync(rootIndex, finalHtml);

console.log('Bun build written to ./out');
