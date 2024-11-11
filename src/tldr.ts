import path, { resolve } from 'node:path';
import util from 'node:util';
import child_process from 'node:child_process';
import envPaths from 'env-paths';
import pico from 'picocolors';
import { access, mkdir } from 'fs/promises';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const exec = util.promisify(child_process.exec);

// handwrite the version as `package.json` will be inlined by rollup
const APP_NAME = 'tldr-ts';
const SPEC_VERSION = '2.2';
const PAGES_REPO = 'https://github.com/tldr-pages/tldr';
const ROOT_DIR = fileURLToPath(new URL('../', import.meta.url));
const README_PATH = resolve(ROOT_DIR, 'README.md');

const SPACES = '  ';

const exampleText = pico.green;
const exampleCode = pico.cyan;
const exampleCodeHighlighted = pico.underline;

// (The MIT License)
// Copyright (c) 2011-2024 JP Richardson
// https://github.com/jprichardson/node-fs-extra/blob/master/lib/path-exists/index.js
async function pathExists(path: string) {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

class TLDR {
  public pagesDir: string;
  public pagesRepo: string;
  public localReadmePath: string;

  constructor() {
    const { data } = envPaths(APP_NAME, { suffix: '' });
    if (data === null) {
      throw new Error('failed to get data dir');
    }
    this.pagesDir = path.join(data, 'tldr-pages');
    this.pagesRepo = PAGES_REPO;
    this.localReadmePath = README_PATH;
  }

  async havePagesDownloaded() {
    return await pathExists(path.join(this.pagesDir, '.git'));
  }

  private async downloadPages() {
    console.log('Downloading pages...');
    await mkdir(this.pagesDir, { recursive: true });
    await exec(`git clone ${this.pagesRepo} ${this.pagesDir} --depth 1`);
    console.log('Pages downloaded');
  }

  private async updatePages() {
    console.log('Updating pages...');
    await exec('git fetch', { cwd: this.pagesDir });
    await exec('git reset --hard origin/main', { cwd: this.pagesDir });
    console.log('Pages updated');
  }

  async ensurePagesDownloaded() {
    if (!(await this.havePagesDownloaded())) {
      await this.downloadPages();
    }
  }

  async update() {
    if (!(await this.havePagesDownloaded())) {
      await this.downloadPages();
    } else {
      await this.updatePages();
    }
  }

  async printVersion() {
    const {
      default: { version },
    } = (await import('#package.json', {
      with: { type: 'json' },
    })) as { default: { version: string } };
    console.log(
      `${APP_NAME} ${version} (tldr-pages client specification ${SPEC_VERSION})`,
    );
    if (await this.havePagesDownloaded()) {
      const lastCommitTime = (
        await exec('git log -1 --format=%cd', { cwd: this.pagesDir })
      ).stdout.trim();
      console.log(`local pages last commit time: ${lastCommitTime}`);
    }
  }

  private generatePagePath(
    command: string,
    language: string,
    platform: string,
  ) {
    return path.join(
      this.pagesDir,
      `pages${language === 'en' ? '' : '.' + language}`,
      platform,
      `${command}.md`,
    );
  }

  private async locatePage(
    command: string,
    language: string,
    platform: string,
  ): Promise<string | null> {
    const languages = new Set<string>();
    languages.add(language);
    languages.add(language.split('_')[0]);
    languages.add('en');

    const candidates = [...languages].flatMap((language) => [
      this.generatePagePath(command, language, platform),
      this.generatePagePath(command, language, 'common'),
    ]);

    const exist = await Promise.all(candidates.map(pathExists));
    const index = exist.indexOf(true);

    if (index === -1) {
      return null;
    } else {
      return candidates[index];
    }
  }

  async renderPage(command: string, language: string, platform: string) {
    const page = await this.locatePage(command, language, platform);
    if (page === null) {
      console.log('Page not found. Please try tldr --update');
      return;
    }

    await this.render(page);
  }

  async renderLocalReadme() {
    await this.render(this.localReadmePath);
  }

  async render(page: string) {
    const mkd = await readFile(page, 'utf8');

    let res = '';
    let buffer = '';
    let i = 0;
    while (i < mkd.length) {
      const c = mkd[i];
      if (c === '\n') {
        if (buffer === '') {
          res += '\n';
        } else {
          switch (buffer[0]) {
            case '#':
              break;
            case '>':
              res += SPACES + buffer.slice(2) + '\n';
              break;
            case '-':
              res += SPACES + exampleText(buffer.slice(2)) + '\n';
              break;
            case '`':
              res +=
                SPACES.repeat(2) +
                exampleCode(
                  buffer
                    .slice(1, buffer.length - 1)
                    .replaceAll(/{{([^}]*)}}/g, exampleCodeHighlighted('$1')),
                ) +
                '\n';
              break;
          }
          buffer = '';
        }
      } else {
        buffer += c;
      }
      i += 1;
    }

    console.log(res);
  }
}

export const tldr = new TLDR();
