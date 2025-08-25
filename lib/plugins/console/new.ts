import tildify from 'tildify';
import { magenta } from 'picocolors';
import { basename } from 'path';
import Hexo from '../../hexo';
import type Promise from 'bluebird';

/**
 * `hexo new`
 *
 * Creates a new post, page or other content type. Accepts optional layout,
 * slug and path arguments and passes remaining flags directly to the post
 * generator.
 */

const reservedKeys = {
  _: true,
  title: true,
  layout: true,
  slug: true,
  s: true,
  path: true,
  p: true,
  replace: true,
  r: true,
  // 全局选项
  config: true,
  debug: true,
  safe: true,
  silent: true
};

interface NewArgs {
  _?: string[]
  p?: string
  path?: string
  s?: string
  slug?: string
  r?: boolean
  replace?: boolean
  [key: string]: any
}

function newConsole(this: Hexo, args: NewArgs): Promise<void> {
  const path = args.p || args.path;
  let title: string;
  if (args._.length) {
    title = args._.pop();
  } else if (path) {
    // 默认标题
    title = basename(path);
  } else {
    // 如果用户没有输入任何参数，则显示帮助信息
    return this.call('help', { _: ['new'] });
  }

  const data = {
    title,
    layout: args._.length ? args._[0] : this.config.default_layout,
    slug: args.s || args.slug,
    path
  };

  const keys = Object.keys(args);

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    if (!reservedKeys[key]) data[key] = args[key];
  }

  return this.post.create(data, args.r || args.replace).then(post => {
    this.log.info('Created: %s', magenta(tildify(post.path)));
  });
}

export = newConsole;
