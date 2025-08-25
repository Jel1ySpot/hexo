import { exists, createReadStream } from 'hexo-fs';
import Promise from 'bluebird';
import { extname } from 'path';
import { magenta } from 'picocolors';
import type Hexo from '../../hexo';
import type { AssetSchema, BaseGeneratorReturn } from '../../types';
import type Document from 'warehouse/dist/document';

/**
 * Structured data returned for each processed asset.
 *
 * `modified` indicates whether the source file has changed and therefore
 * needs to be re-rendered. `data` is an optional function that returns the
 * content of the asset, either a rendered string or a readable stream.
 */
interface AssetData {
  modified: boolean;
  data?: () => any;
}

/**
 * Shape of the objects returned by the asset generator.
 *
 * The `data` property contains runtime metadata about the asset as well as a
 * function to retrieve the asset content during generation.
 */
interface AssetGenerator extends BaseGeneratorReturn {
  data: {
    modified: boolean;
    data?: () => any;
  }
}

/**
 * Load and prepare assets from the specified model.
 *
 * The method performs a two-step process:
 * 1. Filter out assets whose source files no longer exist. Missing files are
 *    removed from the database to keep the model in sync with the file system.
 * 2. Map each remaining asset to an object containing its destination path and
 *    a function for obtaining its data. Renderable assets are rendered to
 *    strings, while non-renderable ones are read as streams.
 */
const process = (name: string, ctx: Hexo) => {
  return Promise.filter(ctx.model(name).toArray(), (asset: Document<AssetSchema>) => exists(asset.source).tap(exist => {
    if (!exist) return asset.remove();
  })).map((asset: Document<AssetSchema>) => {
    const { source } = asset;
    let { path } = asset;
    const data: AssetData = {
      modified: asset.modified
    };

    if (asset.renderable && ctx.render.isRenderable(path)) {
      // Replace extension name if the asset can be rendered to another format
      const filename = path.substring(0, path.length - extname(path).length);

      path = `${filename}.${ctx.render.getOutput(path)}`;

      data.data = () => ctx.render.render({
        path: source,
        toString: true
      }).catch((err: Error) => {
        ctx.log.error({err}, 'Asset render failed: %s', magenta(path));
      });
    } else {
      // Non-renderable assets are served directly from disk as streams
      data.data = () => createReadStream(source);
    }

    return { path, data };
  });
};

/**
 * Register the asset generator.
 *
 * It processes both "Asset" and "PostAsset" models and flattens the results
 * into a single array consumed by Hexo's generation pipeline.
 */
function assetGenerator(this: Hexo): Promise<AssetGenerator[]> {
  return Promise.all([
    process('Asset', this),
    process('PostAsset', this)
  ]).then(data => [].concat(...data));
}

export = assetGenerator;
