import { access, mkdir } from 'fs/promises';

// https://github.com/jprichardson/node-fs-extra/blob/master/lib/path-exists/index.js
export async function pathExists(path: string) {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

// https://github.com/jprichardson/node-fs-extra/blob/master/lib/mkdirs/make-dir.js
export async function ensureDir(dir: string) {
  return mkdir(dir, { recursive: true });
}
