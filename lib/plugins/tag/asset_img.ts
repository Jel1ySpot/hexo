import img from './img';
import { encodeURL } from 'hexo-util';
import type Hexo from '../../hexo';

/**
 * 资源图片标签
 *
 * 语法：
 *   {% asset_img [class names] slug [width] [height] [title text [alt text]]%}
 */
export = (ctx: Hexo) => {
  const PostAsset = ctx.model('PostAsset');

  return function assetImgTag(args: string[]) {
    const len = args.length;

    // 查找图片 URL
    for (let i = 0; i < len; i++) {
      const asset = PostAsset.findOne({post: this._id, slug: args[i]});
      if (asset) {
        // img 标签内部会调用 url_for，因此这里无需再次调用
        args[i] = encodeURL(new URL(asset.path, ctx.config.url).pathname);
        return img(ctx)(args);
      }
    }
  };
};
