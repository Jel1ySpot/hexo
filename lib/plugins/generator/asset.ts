import { exists, createReadStream } from 'hexo-fs';
import Promise from 'bluebird';
import { extname } from 'path';
import { magenta } from 'picocolors';
import type Hexo from '../../hexo';
import type { AssetSchema, BaseGeneratorReturn } from '../../types';
import type Document from 'warehouse/dist/document';

/**
 * 每个已处理资源返回的结构化数据。
 *
 * `modified` 表示源文件是否发生变化，从而需要重新渲染；`data` 是可选函数，用于返回资源内容，可以是渲染后的字符串或可读流。
 */
interface AssetData {
  modified: boolean;
  data?: () => any;
}

/**
 * 资源生成器返回对象的结构。
 *
 * `data` 属性包含资源的运行时元数据以及在生成过程中获取内容的函数。
 */
interface AssetGenerator extends BaseGeneratorReturn {
  data: {
    modified: boolean;
    data?: () => any;
  }
}

/**
 * 从指定模型加载并准备资源。
 *
 * 此方法执行两个步骤：
 * 1. 过滤掉源文件已不存在的资源，删除数据库中缺失的文件以保持与文件系统同步。
 * 2. 将剩余的每个资源映射为包含目标路径和获取数据函数的对象。可渲染的资源将被渲染为字符串，非可渲染资源则作为流读取。
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
      // 如果资源可以渲染为其他格式，则替换其扩展名
      const filename = path.substring(0, path.length - extname(path).length);

      path = `${filename}.${ctx.render.getOutput(path)}`;

      data.data = () => ctx.render.render({
        path: source,
        toString: true
      }).catch((err: Error) => {
        ctx.log.error({err}, 'Asset render failed: %s', magenta(path));
      });
    } else {
      // 无法渲染的资源将直接以流的形式从磁盘提供
      data.data = () => createReadStream(source);
    }

    return { path, data };
  });
};

/**
 * 注册资源生成器。
 *
 * 它会同时处理 "Asset" 和 "PostAsset" 模型，并将结果展平为一个数组供 Hexo 的生成流程使用。
 */
function assetGenerator(this: Hexo): Promise<AssetGenerator[]> {
  return Promise.all([
    process('Asset', this),
    process('PostAsset', this)
  ]).then(data => [].concat(...data));
}

export = assetGenerator;
