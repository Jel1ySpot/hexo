import tildify from 'tildify';
import { magenta } from 'picocolors';
import type Hexo from '../../hexo';
import type Promise from 'bluebird';

/**
 * `hexo publish`
 *
 * 将草稿文章移动到 posts 目录，从而发布它。该命令可接受布局参数，并在提供 `--replace` 标志时替换现有文章。
 */

interface PublishArgs {
  _: string[]
  r?: boolean
  replace?: boolean
  [key: string]: any
}

function publishConsole(this: Hexo, args: PublishArgs): Promise<void> {
  // 如果用户没有输入任何参数，则显示帮助信息
  if (!args._.length) {
    return this.call('help', {_: ['publish']});
  }

  return this.post.publish({
    slug: args._.pop(),
    layout: args._.length ? args._[0] : this.config.default_layout
  }, args.r || args.replace).then(post => {
    this.log.info('Published: %s', magenta(tildify(post.path)));
  });
}

export = publishConsole;
