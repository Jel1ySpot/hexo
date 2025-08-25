/**
 * 注册 Hexo 可用的语法高亮器。
 *
 * 目前支持 `highlight.js` 和 `prismjs`，允许主题选择其偏好的代码块高亮库。
 */
import type Hexo from '../../hexo';

module.exports = (ctx: Hexo) => {
  const { highlight } = ctx.extend;

  highlight.register('highlight.js', require('./highlight'));
  highlight.register('prismjs', require('./prism'));
};
