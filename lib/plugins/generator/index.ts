import type Hexo from '../../hexo';

/**
 * Attach built-in generators to the provided Hexo instance.
 *
 * Generators transform source models into routable files during the render
 * phase. Each registration maps a name to the corresponding generator
 * implementation.
 */
export = (ctx: Hexo) => {
  const { generator } = ctx.extend;

  // Generate static asset files such as images or other resources.
  generator.register('asset', require('./asset'));
  // Generate regular pages (about, contact, etc.).
  generator.register('page', require('./page'));
  // Generate blog posts.
  generator.register('post', require('./post'));
};
