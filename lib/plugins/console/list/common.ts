import strip from 'strip-ansi';

/**
 * 列表子命令共享的实用工具。
 *
 * 目前提供 `stringLength` 函数，用于测量控制台字符串的可见长度，能够处理 ANSI 颜色和双字节字符。
 */

export function stringLength(str: string): number {
  str = strip(str);

  const len = str.length;
  let result = len;

  // 检测双字节字符
  for (let i = 0; i < len; i++) {
    if (str.charCodeAt(i) > 255) {
      result++;
    }
  }

  return result;
}
