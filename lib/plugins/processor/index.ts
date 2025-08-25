/**
 * 注册在生成之前处理源文件的处理器。
 *
 * 处理器解析特定类型的文件（资源、数据文件、文章）并将其转换为内部模型或路由。每个处理器导出一个模式和处理函数，并在此处注册。
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
