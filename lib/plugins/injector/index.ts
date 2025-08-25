/**
 * Placeholder for future injector plugins.
 *
 * The injector extension allows themes and plugins to append snippets into
 * various sections of the generated pages. Hexo currently ships without any
 * built-in injectors but sets up the extension point for external modules.
 */
import type Hexo from '../../hexo';

export = (ctx: Hexo) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { injector } = ctx.extend;
};
