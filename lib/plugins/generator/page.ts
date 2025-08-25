import type { BaseGeneratorReturn, PageSchema, SiteLocals } from '../../types';
import type Document from 'warehouse/dist/document';

/**
 * A simplified representation used when a page opts out of layouts and only
 * needs its raw content to be written to the target path.
 */
type SimplePageGenerator = Omit<BaseGeneratorReturn, 'layout'> & { data: string };

/**
 * Full representation for standard pages that use layouts.
 */
interface NormalPageGenerator extends BaseGeneratorReturn {
  layout: string[];
  data: PageSchema;
}

type PageGenerator = SimplePageGenerator | NormalPageGenerator;

/**
 * Convert `locals.pages` into a set of generation instructions.
 *
 * Each page is mapped to an object containing its destination path and either
 * raw content or a reference to the page model (for further processing with
 * layouts).
 */
function pageGenerator(locals: SiteLocals): PageGenerator[] {
  return locals.pages.map((page: Document<PageSchema> & PageSchema) => {
    const { path, layout } = page;

    // When a page disables layouts, output the content directly.
    if (!layout || layout === 'false' || layout === 'off') {
      return {
        path,
        data: page.content
      };
    }

    // Determine the layout search order. The explicit layout has highest
    // priority followed by the defaults.
    const layouts = ['page', 'post', 'index'];
    if (layout !== 'page') layouts.unshift(layout);

    // Flag the page as processed so that downstream logic can identify it.
    page.__page = true;

    return {
      path,
      layout: layouts,
      data: page
    };
  });
}

export = pageGenerator;
