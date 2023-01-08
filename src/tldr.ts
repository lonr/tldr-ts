import path from 'node:path';
// node:fs/promises won't work
import fs from 'node:fs';
import { Page } from './page.js';
import { ensureDir, pathExists } from './utils.js';
import { PKG } from './cli.js';
import directories from './directories.js';

export interface Config {
  dataDir: string;
  pageRepo: string;
  readmePath: string;
}

export function resolveConfig(
  pkg: PKG,
  pageRepo: string,
  readmePath: string
): Config {
  const dirs = directories({
    qualifier: 'org',
    organization: pkg.author,
    application: pkg.name,
  });
  const dataDir = dirs.data();
  if (dataDir === null) {
    throw new Error('failed to get data dir');
  }
  return {
    dataDir,
    pageRepo,
    readmePath,
  };
}

export class Tldr {
  public dir: string;
  public url: string;
  public readmePath: string;

  constructor(config: Config) {
    this.dir = path.join(config.dataDir, 'tldr-pages');
    this.url = config.pageRepo;
    this.readmePath = config.readmePath;
  }

  async hasCloned() {
    return await pathExists(this.dir);
  }

  private async clone() {
    console.log('Downloading pages...');
    await ensureDir(this.dir);
    const { clone } = await import('isomorphic-git');
    const http = await import('isomorphic-git/http/node/index.js');
    await clone({
      fs,
      http,
      dir: this.dir,
      url: this.url,
      depth: 1,
    });
    console.log('Pages downloaded');
  }

  private async pull() {
    console.log('Updating pages...');
    const { pull } = await import('isomorphic-git');
    const http = await import('isomorphic-git/http/node/index.js');
    await pull({
      fs,
      http,
      dir: this.dir,
      url: this.url,
      // https://github.com/isomorphic-git/isomorphic-git/issues/107
      author: {
        name: 'tldr-ts',
      },
    });
    console.log('Pages updated');
  }

  async init() {
    if (!(await this.hasCloned())) {
      await this.clone();
    }
  }

  async update() {
    if (await this.hasCloned()) {
      await this.pull();
    } else {
      await this.clone();
    }
  }

  private mkdPath(command: string, language: string, platform: string) {
    return path.join(
      this.dir,
      `pages${language === 'en' ? '' : '.' + language}`,
      platform,
      `${command}.md`
    );
  }

  private async locatePage(
    command: string,
    language: string,
    platform: string
  ): Promise<string | null> {
    const languages = new Set<string>();
    languages.add(language);
    languages.add(language.split('_')[0]);
    languages.add('en');

    const candidates = [...languages].flatMap((language) => [
      this.mkdPath(command, language, platform),
      this.mkdPath(command, language, 'common'),
    ]);

    const exist = await Promise.all(candidates.map((path) => pathExists(path)));
    const index = exist.indexOf(true);

    if (index === -1) {
      return null;
    } else {
      return candidates[index];
    }
  }

  async renderPage(command: string, language: string, platform: string) {
    const path = await this.locatePage(command, language, platform);
    if (path === null) {
      console.log('Page not found. Please try tldr --update');
      return;
    }

    await new Page(path).render();
  }

  async renderReadme() {
    await new Page(this.readmePath).render();
  }
}
