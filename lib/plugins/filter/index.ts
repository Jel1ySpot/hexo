/**
 * Registers built-in filters that run at various points in Hexo's lifecycle.
 *
 * Filters are tiny plugins that transform data or hook into events such as
 * rendering and exiting. Each filter is loaded from its own module and
 * registered under an appropriate name.
 */
import type Hexo from '../../hexo';

export = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  require('./after_render')(ctx);
  require('./after_post_render')(ctx);
  require('./before_post_render')(ctx);
  require('./before_exit')(ctx);
  require('./before_generate')(ctx);
  require('./template_locals')(ctx);

  filter.register('new_post_path', require('./new_post_path'));
  filter.register('post_permalink', require('./post_permalink'));
};
