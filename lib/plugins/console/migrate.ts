import { underline, magenta } from 'picocolors';
import type Hexo from '../../hexo';

/**
 * `hexo migrate`
 *
 * Runs migrator plugins to import content from other platforms into the
 * current Hexo site. Lists available migrators if the requested type is not
 * installed.
 */

interface MigrateArgs {
  _: string[]
  [key: string]: any
}

function migrateConsole(this: Hexo, args: MigrateArgs): Promise<any> {
  // Display help message if user didn't input any arguments
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
