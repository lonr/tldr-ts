import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// https://stackoverflow.com/a/72892148/5783347
import pkg from '#package.json' assert { type: 'json' };
export { pkg };
export type PKG = typeof pkg;
import {
  knownPlatforms,
  getLocalPlatform,
  normalize as normalizePlatform,
} from './platform.js';
import { Tldr, SPEC_VERSION } from './tldr.js';

export type Argv = {
  _: string[];
  $0: string;
  platform: string;
  language: string;
  update: boolean;
};
const parser = yargs(hideBin(process.argv));

await parser
  .scriptName('tldr')
  .usage('$0 [OPTIONS] [COMMAND]...')
  .command(
    '$0',
    'the default command',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
    // needs investigation
    // async (argv: Argv) => {
    async (argv) => {
      const { _: commands, update } = argv as Argv;
      if (!update && commands.length === 0) {
        parser.showHelp();
        return;
      }
      const tldr = await Tldr.default(pkg);
      if (update) {
        await tldr.update();
      }
      if (commands.length >= 0) {
        await tldr.print(argv as Argv);
      }
    }
  )
  .example([
    ['$0', 'ls'],
    ['$0', 'git clone'],
  ])
  .options('language', {
    alias: 'L',
    describe: 'Specifies the preferred language',
    default: () => parser.locale(),
    defaultDescription: 'os language',
  })
  .options('platform', {
    alias: 'p',
    describe: `Specifies the platform [supported: ${knownPlatforms.join(
      ', '
    )}]`,
    coerce: normalizePlatform,
    default: getLocalPlatform,
    defaultDescription: 'os platform',
  })
  .options('update', {
    alias: 'u',
    type: 'boolean',
    describe: 'Update pages data',
  })
  .help()
  .alias('h', 'help')
  .version(
    'version',
    `${pkg.name} ${pkg.version} (tldr-pages client specification ${SPEC_VERSION})`
  )
  .alias('v', 'version')
  .parse();
