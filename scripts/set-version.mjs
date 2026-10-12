// Aplica la versión de release a todos los package.json del workspace y
// registra APP_VERSION en el código compartido.
// Uso: node scripts/set-version.mjs 1.2.3   (acepta "v1.2.3")
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const raw = (process.argv[2] ?? '').trim();
const version = raw.replace(/^v/, '');
if (!/^\d+\.\d+\.\d+([-.][0-9A-Za-z-]+)*$/.test(version)) {
  console.error(`Versión inválida: "${raw}". Usa semver, ej. 1.2.3 o v1.2.3`);
  process.exit(1);
}

const PKGS = [
  'package.json',
  'packages/mobile/package.json',
  'packages/web/package.json',
  'packages/shared/package.json',
  'packages/design-tokens/package.json',
];

for (const p of PKGS) {
  const json = JSON.parse(readFileSync(p, 'utf8'));
  json.version = version;
  writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`);
}

const CFG = 'packages/shared/src/constants/config.ts';
const cfg = readFileSync(CFG, 'utf8');
const hasVersion = cfg.includes('APP_VERSION');
const next = hasVersion
  ? cfg.replace(/export const APP_VERSION = '[^']*';/, `export const APP_VERSION = '${version}';`)
  : `${cfg}\nexport const APP_VERSION = '${version}';\n`;
writeFileSync(CFG, next);

const GRADLE = 'packages/mobile/android/app/build.gradle';
if (existsSync(GRADLE)) {
  const [major = 0, minor = 0, patch = 0] = version.split('-')[0].split('+')[0].split('.').map(Number);
  // ponytail: versionCode = major*10000 + minor*100 + patch; cambia a un esquema propio si superas major 99
  const versionCode = major * 10000 + minor * 100 + patch;
  const gradle = readFileSync(GRADLE, 'utf8')
    .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
    .replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
  writeFileSync(GRADLE, gradle);
  console.log(`Android build.gradle → versionName "${version}" (${versionCode})`);
}

console.log(`Versión ${version} aplicada a ${PKGS.length} package.json + APP_VERSION`);