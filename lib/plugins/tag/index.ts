import moize from 'moize';
import type Hexo from '../../hexo';

/**
 * 注册用于 Markdown 和模板的内置标签插件。
 *
 * 标签插件提供便捷语法以嵌入图片、引用、代码块等内容。每个标签在其模块中实现，渲染时可能执行异步操作。
 */
export default (ctx: Hexo) => {
  const { tag } = ctx.extend;

  const blockquote = require('./blockquote')(ctx);

  tag.register('quote', blockquote, true);
  tag.register('blockquote', blockquote, true);

  const code = require('./code')(ctx);

  tag.register('code', code, true);
  tag.register('codeblock', code, true);

  tag.register('iframe', require('./iframe'));

  const img = require('./img')(ctx);

  tag.register('img', img);
  tag.register('image', img);

  const includeCode = require('./include_code')(ctx);

  tag.register('include_code', includeCode, {async: true});
  tag.register('include-code', includeCode, {async: true});

  const link = require('./link');

  tag.register('a', link);
  tag.register('link', link);
  tag.register('anchor', link);

  tag.register('post_path', require('./post_path')(ctx));
  tag.register('post_link', require('./post_link')(ctx));

  tag.register('asset_path', require('./asset_path')(ctx));
  tag.register('asset_link', require('./asset_link')(ctx));

  const assetImg = require('./asset_img')(ctx);

  tag.register('asset_img', assetImg);
  tag.register('asset_image', assetImg);

  tag.register('pullquote', require('./pullquote')(ctx), true);

  tag.register('url_for', require('./url_for')(ctx));
  tag.register('full_url_for', require('./full_url_for')(ctx));
};

// 使用 WeakMap 跟踪不同的 ctx（如有）
const moized = new WeakMap();

export function postFindOneFactory(ctx: Hexo) {
  if (moized.has(ctx)) {
    return moized.get(ctx);
  }

  const moizedPostFindOne = moize(createPostFindOne(ctx), {
    isDeepEqual: true,
    maxSize: 20
  });
  moized.set(ctx, moizedPostFindOne);

  return moizedPostFindOne;
}

function createPostFindOne(ctx: Hexo) {
  const Post = ctx.model('Post');
  return Post.findOne.bind(Post);
}
