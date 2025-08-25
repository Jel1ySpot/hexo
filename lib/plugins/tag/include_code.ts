import { basename, extname, join } from 'path';
import { url_for } from 'hexo-util';
import type Hexo from '../../hexo';

const rCaptionTitleFile = /(.*)?(?:\s+|^)(\/*\S+)/;
const rLang = /\s*lang:(\w+)/i;
const rFrom = /\s*from:(\d+)/i;
const rTo = /\s*to:(\d+)/i;

/**
* 引入代码标签
*
* 语法：
*   {% include_code [title] [lang:language] path/to/file %}
*/

export = (ctx: Hexo) => function includeCodeTag(args: string[]) {
  let codeDir = ctx.config.code_dir;
  let arg = args.join(' ');

  // 给 codeDir 添加末尾斜杠
  if (!codeDir.endsWith('/')) codeDir += '/';

  let lang = '';
  arg = arg.replace(rLang, (match, _lang) => {
    lang = _lang;
    return '';
  });
  let from = 0;
  arg = arg.replace(rFrom, (match, _from) => {
    from = _from - 1;
    return '';
  });
  let to = Number.MAX_VALUE;
  arg = arg.replace(rTo, (match, _to) => {
    to = _to;
    return '';
  });

  const match = arg.match(rCaptionTitleFile);

  // 如果未定义路径则退出
  if (!match) return;

  const path = match[2];

  // 如果未定义语言，则使用文件扩展名
  lang = lang || extname(path).substring(1);

  const source = join(codeDir, path).replace(/\\/g, '/');

  // 防止路径遍历：https://github.com/hexojs/hexo/issues/5250
  const Page = ctx.model('Page');
  const doc = Page.findOne({ source });
  if (!doc) return;

  let code = doc.content;
  const lines = code.split('\n');
  code = lines.slice(from, to).join('\n').trim();

  // 如果未定义标题，则使用文件名
  const title = match[1] || basename(path);
  const caption = `<span>${title}</span><a href="${url_for.call(ctx, doc.path)}">view raw</a>`;

  if (ctx.extend.highlight.query(ctx.config.syntax_highlighter)) {
    const options = {
      lang,
      caption,
      lines_length: lines.length
    };
    return ctx.extend.highlight.exec(ctx.config.syntax_highlighter, {
      context: ctx,
      args: [code, options]
    });
  }
  return `<pre><code>${code}</code></pre>`;
};
