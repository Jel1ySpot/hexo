import type Hexo from '../../hexo';

/**
* pullquote 标签
*
* 语法：
*   {% pullquote [class] %}
*   引用内容
*   {% endpullquote %}
*/
export = (ctx: Hexo) => function pullquoteTag(args: string[], content: string) {
  args.unshift('pullquote');

  const result = ctx.render.renderSync({text: content, engine: 'markdown'});

  return `<blockquote class="${args.join(' ')}">${result}</blockquote>`;
};
