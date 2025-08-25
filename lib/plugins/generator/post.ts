import type { BaseGeneratorReturn, PostSchema, SiteLocals } from '../../types';
import type Document from 'warehouse/dist/document';

/**
 * Representation for posts that bypass layouts and only output raw content.
 */
type SimplePostGenerator = Omit<BaseGeneratorReturn, 'layout'> & { data: string };

/**
 * Representation for regular posts making use of layouts.
 */
interface NormalPostGenerator extends BaseGeneratorReturn {
  data: PostSchema | Document<PostSchema>;
  layout: string[];
}

type PostGenerator = SimplePostGenerator | NormalPostGenerator;

/**
 * Convert `locals.posts` into a set of generation instructions ordered by date.
 */
function postGenerator(locals: SiteLocals): PostGenerator[] {
  const posts = locals.posts.sort('-date').toArray();
  const { length } = posts;

  return posts.map((post: Document<PostSchema>, i: number) => {
    const { path, layout } = post;

    // If layout is disabled, output the rendered content directly.
    if (!layout || layout === 'false') {
      return {
        path,
        data: post.content
      };
    }

    // Populate links to previous and next posts for navigation.
    if (i) post.prev = posts[i - 1];
    if (i < length - 1) post.next = posts[i + 1];

    // Determine layout search order: user-specified layout first, then defaults.
    const layouts = ['post', 'page', 'index'];
    if (layout !== 'post') layouts.unshift(layout);

    // Flag to mark the object as a post during later processing stages.
    post.__post = true;

    return {
      path,
      layout: layouts,
      data: post
    };
  });
}

export = postGenerator;
