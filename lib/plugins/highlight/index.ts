/**
 * Registers syntax highlighters available to Hexo.
 *
 * Currently supports `highlight.js` and `prismjs` implementations, allowing
 * themes to choose their preferred library for code blocks.
 */
import type Hexo from '../../hexo';

module.exports = (ctx: Hexo) => {
  const { highlight } = ctx.extend;

  highlight.register('highlight.js', require('./highlight'));
  highlight.register('prismjs', require('./prism'));
};
