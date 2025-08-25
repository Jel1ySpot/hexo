/**
 * Registers processors that handle source files before generation.
 *
 * Processors parse specific file types (assets, data files, posts) and convert
 * them into internal models or routes. Each processor exports a pattern and
 * process function which are wired up here.
 */
import type Hexo from '../../hexo';

export = (ctx: Hexo) => {
  const { processor } = ctx.extend;

  function register(name: string) {
    const obj = require(`./${name}`)(ctx);
    processor.register(obj.pattern, obj.process);
  }

  register('asset');
  register('data');
  register('post');
};
