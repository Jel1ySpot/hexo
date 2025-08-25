/**
 * 注册在 Hexo 生命周期各阶段运行的内置过滤器。
 *
 * 过滤器是微型插件，可用于转换数据或挂钩到渲染、退出等事件。每个过滤器从其模块加载，并以适当的名称注册。
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
