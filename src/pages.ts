import path from 'node:path';
// node:fs/promises won't work
import fs from 'node:fs';
import { ensureDir, pathExists } from 'fs-extra';
import { clone, pull } from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.js';
import { Config } from './tldr.js';
import { Page } from './page.js';

export class Pages {
  public dir: string;
  public url: string;

  constructor(config: Config) {
    this.dir = path.join(config.dataDir, 'tldr-pages');
    this.url = config.pageRepo;
  }

  async hasCloned() {
    return await pathExists(this.dir);
  }

  async clone() {
    console.log('Downloading pages...');
    await ensureDir(this.dir);
    await clone({
      fs,
      http,
      dir: this.dir,
      url: this.url,
      depth: 1,
    });
    console.log('Pages downloaded');
  }

  async pull() {
    console.log('Updating pages...');
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

  // async log() {
  //   return await log({
  //     fs,
  //     dir: this.dir,
  //     depth: 1,
  //   });
  // }

  async update() {
    if (await this.hasCloned()) {
      await this.pull();
    } else {
      await this.clone();
    }
  }

  getPagePath(command: string, language: string, platform: string) {
    return path.join(
      this.dir,
      `pages${language === 'en' ? '' : '.' + language}`,
      platform,
      `${command}.md`
    );
  }

  async locatePage(
    command: string,
    language: string,
    platform: string
  ): Promise<string | null> {
    const languages = new Set<string>();
    languages.add(language);
    languages.add(language.split('_')[0]);
    languages.add('en');

    const candidates = [...languages].flatMap((language) => [
      this.getPagePath(command, language, platform),
      this.getPagePath(command, language, 'common'),
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
}
