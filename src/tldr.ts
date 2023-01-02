import type { PKG } from './cli.js';
import directories from './directories.js';
import { Pages } from './pages.js';
import type { Argv } from './cli.js';

export const SPEC_VERSION = '1.5';
const PAGES_REPO = 'https://github.com/tldr-pages/tldr';

export interface Config {
  dataDir: string;
  pageRepo: string;
}

export class Tldr {
  public config: Config;
  public pages: Pages;

  constructor(config: Config) {
    this.config = config;
    this.pages = new Pages(config);
  }

  static getDefaultConfig(pkg: PKG): Config {
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
      pageRepo: PAGES_REPO,
    };
  }

  static async default(pkg: PKG) {
    const tldr = new Tldr(this.getDefaultConfig(pkg));
    await tldr.init();
    return tldr;
  }

  async init() {
    if (!(await this.pages.hasCloned())) {
      await this.pages.clone();
    }
  }

  async update() {
    await this.pages.update();
  }

  async print(argv: Argv) {
    const { _: commands, language, platform } = argv;
    await this.pages.renderPage(
      commands.join('-').toLowerCase(),
      language,
      platform
    );
  }
}
