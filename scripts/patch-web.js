// Run after `npx expo export --platform web`: makes the site installable on an iPhone home screen
// (full screen, own icon, dark status bar). Usage: node scripts/patch-web.js
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', 'dist');
const indexPath = path.join(dist, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run: npx expo export --platform web');
  process.exit(1);
}
const icon = path.join(__dirname, '..', 'assets', 'icon.png');
if (fs.existsSync(icon)) fs.copyFileSync(icon, path.join(dist, 'icon.png'));
fs.writeFileSync(
  path.join(dist, 'manifest.json'),
  JSON.stringify(
    {
      name: 'Fitness',
      short_name: 'Fitness',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#0b0c10',
      theme_color: '#0b0c10',
      icons: [{ src: '/icon.png', sizes: '1024x1024', type: 'image/png' }],
    },
    null,
    2,
  ),
);
// Netlify drops any folder named node_modules, and deep "@scope" paths proved unreliable too.
// Move every asset that Expo placed under assets/node_modules into ONE flat folder (dist/assets/flat) and
// rewrite all references. File names are content-hashed, so they stay unique.
const ASSET_EXT = '(?:ttf|otf|woff2?|png|jpe?g|gif|webp|svg|json|mp3|mp4)';
const nm = path.join(dist, 'assets', 'node_modules');
const flatDir = path.join(dist, 'assets', 'flat');
let moved = 0;
if (fs.existsSync(nm)) {
  fs.mkdirSync(flatDir, { recursive: true });
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) walk(full);
      else {
        fs.copyFileSync(full, path.join(flatDir, f.name));
        moved++;
      }
    }
  };
  walk(nm);
  fs.rmSync(nm, { recursive: true, force: true });
  const re = new RegExp('assets/node_modules/(?:[^"\'`)\\s\\\\]*/)?([^/"\'`)\\s\\\\]+\\.' + ASSET_EXT + ')', 'g');
  const fix = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) fix(full);
      else if (/\.(js|html|json|css|map)$/.test(f.name)) {
        const t = fs.readFileSync(full, 'utf8');
        if (t.includes('assets/node_modules')) fs.writeFileSync(full, t.replace(re, 'assets/flat/$1'));
      }
    }
  };
  fix(dist);
  console.log('Moved ' + moved + ' asset files to dist/assets/flat');
}
let html = fs.readFileSync(indexPath, 'utf8');
const tags = [
  '<link rel="manifest" href="/manifest.json">',
  '<link rel="apple-touch-icon" href="/icon.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="Fitness">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="theme-color" content="#0b0c10">',
];
const missing = tags.filter((t) => !html.includes(t.slice(0, 30)));
html = html.replace('</head>', missing.join('\n') + '\n</head>');
// no zoom/overscroll surprises on a phone
html = html.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">');
fs.writeFileSync(indexPath, html);
console.log('dist/ is ready. Upload the whole dist folder (e.g. drag it onto app.netlify.com/drop).');
