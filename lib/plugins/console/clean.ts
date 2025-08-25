import Promise from 'bluebird';
import { exists, unlink, rmdir } from 'hexo-fs';
import type Hexo from '../../hexo';

/**
 * `hexo clean`
 *
 * 移除生成的文件、缓存数据库和 public 目录，使站点恢复到干净状态。在执行 `hexo generate` 等命令前运行，以确保清除过期文件。
 */

function cleanConsole(this: Hexo): Promise<[void, void, any]> {
  return Promise.all([
    deleteDatabase(this),
    deletePublicDir(this),
    this.execFilter('after_clean', null, {context: this})
  ]);
}

function deleteDatabase(ctx: Hexo): Promise<void> {
  const dbPath = ctx.database.options.path;

  return exists(dbPath).then(exist => {
    if (!exist) return;

    return unlink(dbPath).then(() => {
      ctx.log.info('Deleted database.');
    });
  });
}

function deletePublicDir(ctx: Hexo): Promise<void> {
  const publicDir = ctx.public_dir;

  return exists(publicDir).then(exist => {
    if (!exist) return;

    return rmdir(publicDir).then(() => {
      ctx.log.info('Deleted public folder.');
    });
  });
}

export = cleanConsole;
