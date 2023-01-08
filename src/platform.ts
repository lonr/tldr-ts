// https://github.com/tldr-pages/tldr-node-client/blob/master/lib/platform.js
export const knownPlatforms = [
  'osx',
  'macos',
  'darwin',
  'linux',
  'sunos',
  'win32',
  'windows',
  'android',
  'common',
] as const;
export const canonicalPlatforms = [
  'osx',
  'linux',
  'sunos',
  'windows',
  'android',
  'common',
] as const;
export type knownPlatform = typeof knownPlatforms[number];
export type CanonicalPlatform = typeof canonicalPlatforms[number];

const platformMap = {
  osx: 'osx',
  macos: 'osx',
  darwin: 'osx',
  linux: 'linux',
  sunos: 'sunos',
  windows: 'windows',
  win32: 'windows',
  android: 'android',
  common: 'common',
} as const satisfies Record<knownPlatform, CanonicalPlatform>;

function isKnown(platform: string): platform is knownPlatform {
  return Object.hasOwn(platformMap, platform);
}

export function normalize(platform: string): CanonicalPlatform | string {
  return isKnown(platform) ? platformMap[platform] : platform;
}
