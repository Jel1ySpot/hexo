import type Hexo from '../../hexo';

/**
 * 将内置的生成器附加到提供的 Hexo 实例。
 *
 * 生成器在渲染阶段将源模型转换为可路由文件。每个注册条目都映射到相应的生成器实现。
 */
export = (ctx: Hexo) => {
  const { generator } = ctx.extend;

  // 生成静态资源文件，如图片或其他资源
  generator.register('asset', require('./asset'));
  // 生成常规页面（about、contact 等）
  generator.register('page', require('./page'));
  // 生成博客文章
  generator.register('post', require('./post'));
};
