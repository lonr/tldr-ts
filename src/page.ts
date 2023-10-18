import { readFile } from 'node:fs/promises';
import pico from 'picocolors';

const exampleText = pico.green;
const exampleCode = pico.cyan;
const exampleCodeHighlighted = pico.underline;

const spaces = '  ';

export class Page {
  constructor(private path: string) {}
  async render() {
    const mkd = await readFile(this.path, 'utf8');

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
