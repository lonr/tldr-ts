import { readFile } from 'node:fs/promises';
import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Root, Content } from 'mdast';

// refer to https://github.com/danielpza/markdown-to-bbcode/blob/master/index.js
function render(node: Root | Content): string {
  switch (node.type) {
    case 'root':
      return node.children.map(render).join('\n') + '\n';
    case 'heading':
      // ignore the heading (the name of the command)
      return '';
    case 'text':
      return node.value;
    case 'inlineCode':
    case 'code':
      return '  ' + node.value;
    case 'link':
      // add `<` and `>` back
      return '<' + node.children.map(render).join('') + '>';
    // inline
    case 'paragraph': {
      return node.children.map(render).join('');
    }
    // add more line breaks
    case 'list': {
      // kind of hacky
      return '\n' + node.children.map(render).join('') + '\n';
    }
    // case 'blockquote':
    // case 'listItem':
    default: {
      if ('children' in node) {
        return node.children.map(render).join('\n');
      } else {
        return '';
      }
    }
  }
}

export class Page {
  constructor(private path: string) {}

  async render() {
    console.log(render(fromMarkdown(await readFile(this.path))));
  }
}
