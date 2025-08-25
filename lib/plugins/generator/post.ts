import type { BaseGeneratorReturn, PostSchema, SiteLocals } from '../../types';
import type Document from 'warehouse/dist/document';

/**
 * 跳过布局，仅输出原始内容的文章表示。
 */
type SimplePostGenerator = Omit<BaseGeneratorReturn, 'layout'> & { data: string };

/**
 * 使用布局的常规文章表示。
 */
interface NormalPostGenerator extends BaseGeneratorReturn {
  data: PostSchema | Document<PostSchema>;
  layout: string[];
}

type PostGenerator = SimplePostGenerator | NormalPostGenerator;

/**
 * 将 `locals.posts` 转换为按日期排序的生成指令集合。
 */
function postGenerator(locals: SiteLocals): PostGenerator[] {
  const posts = locals.posts.sort('-date').toArray();
  const { length } = posts;

  return posts.map((post: Document<PostSchema>, i: number) => {
    const { path, layout } = post;

    // 如果禁用了布局，则直接输出渲染后的内容
    if (!layout || layout === 'false') {
      return {
        path,
        data: post.content
      };
    }

    // 填充上一篇与下一篇的链接以便导航
    if (i) post.prev = posts[i - 1];
    if (i < length - 1) post.next = posts[i + 1];

    // 确定布局的查找顺序：用户指定的布局优先，然后是默认布局
    const layouts = ['post', 'page', 'index'];
    if (layout !== 'post') layouts.unshift(layout);

    // 标记对象为文章，以便后续处理阶段识别
    post.__post = true;

    return {
      path,
      layout: layouts,
      data: post
    };
  });
}

export = postGenerator;
