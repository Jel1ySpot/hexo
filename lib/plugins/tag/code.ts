// 基于：https://raw.github.com/imathis/octopress/master/plugins/code_block.rb

import { escapeHTML } from 'hexo-util';
import type Hexo from '../../hexo';
import type { HighlightOptions } from '../../extend/syntax_highlight';

const rCaptionUrlTitle = /(\S[\S\s]*)\s+(https?:\/\/\S+)\s+(.+)/i;
const rCaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/\S+)/i;
const rCaption = /\S[\S\s]*/;

/**
 * 代码块标签
 * 语法：
 * {% codeblock [options] %}
 * 代码片段
 * {% endcodeblock %}
 * @param {String} title 说明文字
 * @param {Object} lang 指定语言
 * @param {String} url 源链接
 * @param {String} link_text 链接文字
 * @param {Object} line_number 显示行号，值必须为布尔值
 * @param {Object} highlight 启用代码高亮，值必须为布尔值
 * @param {Object} first_line 指定首行行号，值必须为数字
 * @param {Object} mark 高亮指定行，多个值用逗号分隔，可用连字符指定范围
 * 示例：`mark:1,4-7,10` 将高亮第 1 行、第 4 至 7 行以及第 10 行。
 * @param {Object} wrap 使用 <table> 包裹代码块，值必须为布尔值
 * @returns {String} 带有代码高亮的代码片段
*/

function parseArgs(args: string[]): HighlightOptions {
  const _else = [];
  const len = args.length;
  let lang: string, language_attr: boolean,
    line_number: boolean, line_threshold: number, wrap: boolean;
  let firstLine = 1;
  const mark = [];
  for (let i = 0; i < len; i++) {
    const colon = args[i].indexOf(':');

    if (colon === -1) {
      _else.push(args[i]);
      continue;
    }

    const key = args[i].slice(0, colon);
    const value = args[i].slice(colon + 1);

    switch (key) {
      case 'lang':
        lang = value;
        break;
      case 'line_number':
        line_number = value === 'true';
        break;
      case 'line_threshold':
        if (!isNaN(Number(value))) line_threshold = +value;
        break;
      case 'first_line':
        if (!isNaN(Number(value))) firstLine = +value;
        break;
      case 'wrap':
        wrap = value === 'true';
        break;
      case 'mark': {
        for (const cur of value.split(',')) {
          const hyphen = cur.indexOf('-');
          if (hyphen !== -1) {
            let a = +cur.slice(0, hyphen);
            let b = +cur.slice(hyphen + 1);
            if (Number.isNaN(a) || Number.isNaN(b)) continue;
            if (b < a) { // 交换 a 与 b
              [a, b] = [b, a];
            }

            for (; a <= b; a++) {
              mark.push(a);
            }
          }
          if (!isNaN(Number(cur))) mark.push(+cur);
        }
        break;
      }
      case 'language_attr': {
        language_attr = value === 'true';
        break;
      }
      default: {
        _else.push(args[i]);
      }
    }
  }

  const arg = _else.join(' ');
  // eslint-disable-next-line one-var
  let match, caption = '';

  if ((match = arg.match(rCaptionUrlTitle)) != null) {
    caption = `<span>${match[1]}</span><a href="${match[2]}">${match[3]}</a>`;
  } else if ((match = arg.match(rCaptionUrl)) != null) {
    caption = `<span>${match[1]}</span><a href="${match[2]}">link</a>`;
  } else if ((match = arg.match(rCaption)) != null) {
    caption = `<span>${match[0]}</span>`;
  }

  return {
    lang,
    language_attr,
    firstLine,
    caption,
    line_number,
    line_threshold,
    mark,
    wrap
  };
}

export = (ctx: Hexo) => function codeTag(args: string[], content: string) {

  // 如果既未启用 highlight.js 也未启用 prism.js，则直接返回转义后的代码
  if (!ctx.extend.highlight.query(ctx.config.syntax_highlighter)) {
    return `<pre><code>${escapeHTML(content)}</code></pre>`;
  }

  let index: number;
  let enableHighlight = true;

  if ((index = args.findIndex(item => item.startsWith('highlight:'))) !== -1) {
    const arg = args[index];
    const highlightStr = arg.slice(10);
    enableHighlight = highlightStr === 'true';
    args.splice(index, 1);
  }

  // 如果设置了 'highlight: false'，则直接返回转义后的代码
  if (!enableHighlight) {
    return `<pre><code>${escapeHTML(content)}</code></pre>`;
  }

  const options = parseArgs(args);
  options.lines_length = content.split('\n').length;
  content = ctx.extend.highlight.exec(ctx.config.syntax_highlighter, {
    context: ctx,
    args: [content, options]
  });

  return content.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
};
