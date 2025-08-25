import { underline, magenta } from 'picocolors';
import type Hexo from '../../hexo';

/**
 * `hexo migrate`
 *
 * 运行迁移插件，将其他平台的内容导入当前 Hexo 站点。如果请求的类型未安装，则列出可用的迁移器。
 */

interface MigrateArgs {
  _: string[]
  [key: string]: any
}

function migrateConsole(this: Hexo, args: MigrateArgs): Promise<any> {
  // 如果用户没有输入任何参数，则显示帮助信息
  if (!args._.length) {
    return this.call('help', {_: ['migrate']});
  }

  const type = args._.shift();
  const migrators = this.extend.migrator.list();

  if (!migrators[type]) {
    let help = '';

    help += `${magenta(type)} migrator plugin is not installed.\n\n`;
    help += 'Installed migrator plugins:\n';
    help += `  ${Object.keys(migrators).join(', ')}\n\n`;
    help += `For more help, you can check the online docs: ${underline('https://hexo.io/')}`;

    console.log(help);
    return;
  }

  return Reflect.apply(migrators[type], this, [args]);
}

export = migrateConsole;
