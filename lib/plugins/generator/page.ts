import type { BaseGeneratorReturn, PageSchema, SiteLocals } from '../../types';
import type Document from 'warehouse/dist/document';

/**
 * 当页面不使用布局时，仅需要将原始内容写入目标路径的简化表示。
 */
type SimplePageGenerator = Omit<BaseGeneratorReturn, 'layout'> & { data: string };

/**
 * 使用布局的标准页面的完整表示。
 */
interface NormalPageGenerator extends BaseGeneratorReturn {
  layout: string[];
  data: PageSchema;
}

type PageGenerator = SimplePageGenerator | NormalPageGenerator;

/**
 * 将 `locals.pages` 转换为生成指令集合。
 *
 * 每个页面映射为一个对象，包含目标路径以及原始内容或页面模型，用于结合布局进行进一步处理。
 */
function pageGenerator(locals: SiteLocals): PageGenerator[] {
  return locals.pages.map((page: Document<PageSchema> & PageSchema) => {
    const { path, layout } = page;

    // 当页面禁用布局时，直接输出内容
    if (!layout || layout === 'false' || layout === 'off') {
      return {
        path,
        data: page.content
      };
    }

    // 确定布局的查找顺序：显式指定的布局优先，其次是默认布局
    const layouts = ['page', 'post', 'index'];
    if (layout !== 'page') layouts.unshift(layout);

    // 标记页面已处理，以便下游逻辑识别
    page.__page = true;

    return {
      path,
      layout: layouts,
      data: page
    };
  });
}

export = pageGenerator;
