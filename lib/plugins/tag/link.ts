import { htmlTag } from 'hexo-util';

const rUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\w]*))?)/;

/**
* 链接标签
*
* 语法：
*   {% link text url [external] [title] %}
*/

function linkTag(args: string[]) {
  let url = '';
  const text = [];
  let external = false;
  let title = '';
  let i = 0;
  const len = args.length;

  // 查找链接的 URL 和文本
  for (; i < len; i++) {
    const item = args[i];

    if (rUrl.test(item)) {
      url = item;
      break;
    } else {
      text.push(item);
    }
  }

  // 从参数中移除链接 URL 和文本
  args = args.slice(i + 1);

  // 检查链接是否应在新窗口中打开
  // 并将最后的文本作为链接标题
  if (args.length) {
    const shift = args[0];

    if (shift === 'true' || shift === 'false') {
      external = shift === 'true';
      args.shift();
    }

    title = args.join(' ');
  }

  const attrs = {
    href: url,
    title,
    target: external ? '_blank' : ''
  };

  return htmlTag('a', attrs, text.join(' '));
}

export = linkTag;
