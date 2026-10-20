import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
await build({ entryPoints: ['multiplayer.js'], bundle: true, format: 'iife', outfile: 'generated/multiplayer.js' });
const drinkPage = (await readFile('drink-maker-preview.html','utf8')).replace('</body>', '<script src="drink-maker-online.js"></script></body>');
await mkdir('generated',{recursive:true});
await writeFile('generated/drink-maker.html',drinkPage);
const sources = ['style.css', 'firebase-config.js', 'generated/multiplayer.js', 'sketch.js', 'chat.js', 'wishing-tree.js', 'wishing-tree-board.html', 'wishing-tree.png', 'drink-shop.js', 'drink-shop.png', 'generated/drink-maker.html', 'drink-maker-online.js'];
const contents = await Promise.all(sources.map(file => readFile(file)));
const original = await readFile('index.html', 'utf8');
const hash = createHash('sha256').update(original);
contents.forEach(content => hash.update(content));
const release = hash.digest('hex').slice(0, 16);
const directory = `generated/site/releases/${release}`;
await mkdir(directory, { recursive: true });
let html = original;
for (let index = 0; index < sources.length; index++) {
  const source = sources[index];
  const name = source.split('/').at(-1);
  await writeFile(`${directory}/${name}`, contents[index]);
  html = html.replace(new RegExp(`${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\?[^"\\s]*)?`), `releases/${release}/${name}`);
}
html = html.replace('<head>', `<head>\n    <script>window.PUBLIC_MAP_RELEASE="${release}";</script>`);
// A release-specific entry bypasses cached older homepages. Its QR keeps
// phones on the same confirmed release and the selected room.
const entryName = `campus-${release}.html`;
const configTag = `<script src="releases/${release}/firebase-config.js"></script>`;
if (!html.includes(configTag)) throw new Error('Missing versioned Firebase configuration script');
html = html.replace(configTag, configTag + `<script>window.PUBLIC_MAP_CONFIG.publicBaseUrl=new URL("${entryName}",document.baseURI).href;</script>`);
await writeFile('generated/site/index.html', html);
await writeFile(`generated/site/${entryName}`, html);
await writeFile('generated/site/.nojekyll', '');
for (const file of ['p5.js', 'map draft.png', '男角色.png', '女角色.png', '购物袋.png', 'light icon.png']) {
  await copyFile(file, `generated/site/${file}`);
}
console.log(`Built immutable release ${release}`);
