#!/usr/bin/env node
import parseArgs from 'minimist';
import { tldr } from './tldr.js';

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
    // https://nodejs.org/api/process.html#processplatform
    platform: process.platform,
  },
}) as Args;

const { _: commands, update, language, platform, version } = args;

if (version) {
  await tldr.printVersion();
  process.exit();
}

if (update) {
  await tldr.update();
  process.exit();
}

if (commands.length === 0) {
  await tldr.renderLocalReadme();
  process.exit();
}

// https://github.com/tldr-pages/tldr-node-client/blob/master/lib/platforms.js
const folders = {
  osx: 'osx',
  macos: 'osx',
  darwin: 'osx',
  linux: 'linux',
  sunos: 'sunos',
  freebsd: 'freebsd',
  openbsd: 'openbsd',
  netbsd: 'netbsd',
  windows: 'windows',
  win32: 'windows',
  android: 'android',
  common: 'common',
} as const;

function isSupported(platform: string): platform is keyof typeof folders {
  return Object.keys(folders).includes(platform);
}

export function normalize(platform: string): string {
  return isSupported(platform) ? folders[platform] : platform;
}

const command = commands.join('-').toLowerCase();

await tldr.ensurePagesDownloaded();
await tldr.renderPage(command, language, normalize(platform));
