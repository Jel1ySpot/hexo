import { url_for } from 'hexo-util';
import type Hexo from '../../hexo';

/**
 * 资源路径标签
 *
 * 语法：
 *   {% asset_path slug %}
 */
export = (ctx: Hexo) => {
  const PostAsset = ctx.model('PostAsset');

  return function assetPathTag(args: string[]) {
    const slug = args.shift();
    if (!slug) return;

    const asset = PostAsset.findOne({post: this._id, slug});
    if (!asset) return;

    const path = url_for.call(ctx, asset.path);

    return path;
  };
};
