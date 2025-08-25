/**
 * 未来注入器插件的占位符。
 *
 * 注入器扩展允许主题和插件向生成页面的各个部分追加片段。Hexo 目前没有内置注入器，但为外部模块预留了扩展点。
 */
import type Hexo from '../../hexo';

export = (ctx: Hexo) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { injector } = ctx.extend;
};
