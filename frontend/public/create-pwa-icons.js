// create-pwa-icons.js - GENERAR ICONOS PWA PROGRAMÁTICAMENTE
const fs = require('fs');
const path = require('path');

// SVG base para Nordia (Neural Brain Icon)
const createNordiaSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2-4}" fill="url(#grad)" filter="url(#shadow)"/>

  <!-- Neural brain icon -->
  <g transform="translate(${size*0.2}, ${size*0.2})">
    <!-- Brain outline -->
    <path d="M${size*0.15} ${size*0.2}
             C ${size*0.1} ${size*0.1}, ${size*0.4} ${size*0.05}, ${size*0.5} ${size*0.15}
             C ${size*0.55} ${size*0.1}, ${size*0.7} ${size*0.15}, ${size*0.65} ${size*0.3}
             C ${size*0.7} ${size*0.4}, ${size*0.6} ${size*0.55}, ${size*0.5} ${size*0.5}
             C ${size*0.4} ${size*0.55}, ${size*0.25} ${size*0.5}, ${size*0.15} ${size*0.35}
             Z"
          fill="white" opacity="0.9" stroke="none"/>

    <!-- Neural connections -->
    <circle cx="${size*0.25}" cy="${size*0.25}" r="${size*0.02}" fill="white"/>
    <circle cx="${size*0.45}" cy="${size*0.2}" r="${size*0.02}" fill="white"/>
    <circle cx="${size*0.55}" cy="${size*0.35}" r="${size*0.02}" fill="white"/>
    <circle cx="${size*0.35}" cy="${size*0.4}" r="${size*0.02}" fill="white"/>

    <!-- Connection lines -->
    <line x1="${size*0.25}" y1="${size*0.25}" x2="${size*0.45}" y2="${size*0.2}" stroke="white" stroke-width="1" opacity="0.7"/>
    <line x1="${size*0.45}" y1="${size*0.2}" x2="${size*0.55}" y2="${size*0.35}" stroke="white" stroke-width="1" opacity="0.7"/>
    <line x1="${size*0.35}" y1="${size*0.4}" x2="${size*0.25}" y2="${size*0.25}" stroke="white" stroke-width="1" opacity="0.7"/>
  </g>

  <!-- Text "N" -->
  <text x="${size/2}" y="${size*0.75}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size*0.2}" font-weight="bold">N</text>
</svg>`;

// Crear manifest.json
const createManifest = () => ({
  "name": "Nordia POS Neural",
  "short_name": "Nordia POS",
  "description": "Sistema POS Neural Inteligente",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "pwa-64x64.png",
      "sizes": "64x64",
      "type": "image/png"
    },
    {
      "src": "pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
});

// Generar archivos
console.log('🎨 Generando iconos PWA para Nordia...');

// Crear SVGs para diferentes tamaños
const sizes = [64, 192, 512];
sizes.forEach(size => {
  const svg = createNordiaSVG(size);
  fs.writeFileSync(path.join(__dirname, \`nordia-icon-\${size}.svg\`), svg);
  console.log(\`✅ Icono SVG \${size}x\${size} creado\`);
});

// Crear manifest
const manifest = createManifest();
fs.writeFileSync(path.join(__dirname, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
console.log('✅ Manifest.webmanifest creado');

// Crear placeholder PNGs (como fallback)
const createPlaceholderSVG = (size) => \`
<svg width="\${size}" height="\${size}" viewBox="0 0 \${size} \${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="\${size}" height="\${size}" fill="#10b981"/>
  <circle cx="\${size/2}" cy="\${size/2}" r="\${size/3}" fill="white" opacity="0.9"/>
  <text x="\${size/2}" y="\${size/2 + size*0.1}" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="\${size*0.3}" font-weight="bold">N</text>
</svg>\`;

// Crear archivos SVG para conversión manual a PNG
sizes.concat([512]).forEach(size => {
  const svg = createPlaceholderSVG(size);
  fs.writeFileSync(path.join(__dirname, \`pwa-\${size}x\${size}.svg\`), svg);
});

// Crear maskable icon
const maskableSVG = \`
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#10b981"/>
  <circle cx="256" cy="256" r="180" fill="white" opacity="0.95"/>
  <circle cx="200" cy="220" r="8" fill="#10b981"/>
  <circle cx="280" cy="200" r="8" fill="#10b981"/>
  <circle cx="320" cy="260" r="8" fill="#10b981"/>
  <circle cx="240" cy="280" r="8" fill="#10b981"/>
  <path d="M200 220 L280 200 L320 260 L240 280 Z" stroke="#10b981" stroke-width="2" fill="none" opacity="0.6"/>
  <text x="256" y="350" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="80" font-weight="bold">N</text>
</svg>\`;

fs.writeFileSync(path.join(__dirname, 'maskable-icon-512x512.svg'), maskableSVG);

console.log('🚀 Todos los archivos PWA generados!');
console.log('📌 Nota: Los archivos .svg se han creado. Para producción, conviértelos a PNG usando un convertidor online o ImageMagick');
console.log('   Ejemplo: convert pwa-192x192.svg pwa-192x192.png');