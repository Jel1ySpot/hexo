import { Cache } from 'hexo-util';
import type Hexo from '../../hexo';

export = (ctx: Hexo) => {
  const cache = new Cache();

  // 在监听模式下重置缓存
  ctx.on('generateBefore', () => { cache.flush(); });

  return function fragmentCache(id: string, fn: () => any) {
    if (this.cache) return cache.apply(id, fn);

    const result = fn();

    cache.set(id, result);
    return result;
  };
};
