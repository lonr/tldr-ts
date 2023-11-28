import { platform as localPlatform } from 'node:os';
import { fileURLToPath } from 'node:url';
import parseArgs from 'minimist';
import { resolve } from 'node:path';
import { normalize } from './platform.js';
import { resolveConfig, Tldr } from './tldr.js';
import pkg from '#package.json' assert { type: 'json' };
export { pkg };
export type PKG = typeof pkg;

// handwrite the version as `package.json` will be inlined by rollup
pkg.version = '1.1.6';
const SPEC_VERSION = '1.5';
const PAGES_REPO = 'https://github.com/tldr-pages/tldr';
const ROOT_DIR = fileURLToPath(new URL('../', import.meta.url));
const README_PATH = resolve(ROOT_DIR, 'README.md');

export type Args = {
  _: string[];
  platform: string;
  language: string;
  update: boolean;
  version: boolean;
};

const args: Args = parseArgs(process.argv.slice(2), {
  string: ['language', 'platform'],
  boolean: ['update', 'version'],
  alias: {
    L: 'language',
    p: 'platform',
    u: 'update',
    v: 'version',
  },
  default: {
    language: Intl.DateTimeFormat().resolvedOptions().locale,
    platform: localPlatform(),
  },
}) as Args;

const { _: commands, update, language, platform, version } = args;

if (version) {
  console.log(
    `${pkg.name} ${pkg.version} (tldr-pages client specification ${SPEC_VERSION})`,
  );
  process.exit();
}

const tldr = new Tldr(resolveConfig(pkg, PAGES_REPO, README_PATH));

if (update) {
  await tldr.update();
  process.exit();
}

await tldr.init();

if (commands.length === 0) {
  await tldr.renderReadme();
  process.exit();
}

const command = commands.join('-').toLowerCase();
const normalizedPlatform = normalize(platform);
await tldr.renderPage(command, language, normalizedPlatform);
