import { readFile } from 'node:fs/promises';
import chalk from 'chalk';

const exampleText = chalk.green;
const exampleCode = chalk.cyan;
const exampleCodeHighted = chalk.underline;

const spaces = '  ';

function render(mkd: string): string {
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
            res += spaces + buffer.slice(2) + '\n';
            break;
          case '-':
            res += spaces + exampleText(buffer.slice(2)) + '\n';
            break;
          case '`':
            res +=
              spaces.repeat(2) +
              exampleCode(
                buffer
                  .slice(1, buffer.length - 1)
                  .replaceAll(/{{([^}]*)}}/g, exampleCodeHighted('$1'))
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
  return res;
}

export class Page {
  constructor(private path: string) {}

  async render() {
    console.log(render(await readFile(this.path, 'utf8')));
  }
}
