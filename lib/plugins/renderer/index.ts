/**
 * 注册用于将源文件转换为其他格式的默认渲染器。
 *
 * 包括针对静态文件的透传渲染器以及专门用于 JSON、YAML 和 Nunjucks 模板的渲染器。
 */
import type Hexo from '../../hexo';

export = (ctx: Hexo) => {
  const { renderer } = ctx.extend;

  const plain = require('./plain');

  renderer.register('htm', 'html', plain, true);
  renderer.register('html', 'html', plain, true);
  renderer.register('css', 'css', plain, true);
  renderer.register('js', 'js', plain, true);

  renderer.register('json', 'json', require('./json'), true);

  const yaml = require('./yaml');

  renderer.register('yml', 'json', yaml, true);
  renderer.register('yaml', 'json', yaml, true);

  const nunjucks = require('./nunjucks');

  renderer.register('njk', 'html', nunjucks, true);
  renderer.register('j2', 'html', nunjucks, true);
};
