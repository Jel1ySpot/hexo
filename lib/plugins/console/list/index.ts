import abbrev from 'abbrev';
import page from './page';
import post from './post';
import route from './route';
import tag from './tag';
import category from './category';
import type Hexo from '../../../hexo';
import type Promise from 'bluebird';

/**
 * `hexo list <type>`
 *
 * 列出不同 Hexo 实体的信息，如文章、页面、路由、标签和分类。每种类型都有自己的处理模块，将格式化后的信息输出到控制台。
 */

interface ListArgs {
  _: string[]
}

const store = {
  page, post, route, tag, category
};

const alias = abbrev(Object.keys(store));

function listConsole(this: Hexo, args: ListArgs): Promise<void> {
  const type = args._.shift();

  // 如果用户没有输入任何参数，则显示帮助信息
  if (!type || !alias[type]) {
    return this.call('help', {_: ['list']});
  }

  return this.load().then(() => Reflect.apply(store[alias[type]], this, [args]));
}

export = listConsole;
