import { exists, writeFile, unlink, stat, mkdirs } from 'hexo-fs';
import { join } from 'path';
import Promise from 'bluebird';
import prettyHrtime from 'pretty-hrtime';
import { cyan, magenta } from 'picocolors';
import tildify from 'tildify';
import { PassThrough, type Readable } from 'stream';
import { createSha1Hash } from 'hexo-util';
import type Hexo from '../../hexo';
import type Router from '../../hexo/router';

/**
 * `hexo generate`
 *
 * Converts source files into static assets. Supports incremental builds,
 * cleaning of outdated files and optional deployment or file watching modes.
 */

interface GenerateArgs {
  f?: boolean
  force?: boolean
  b?: boolean
  bail?: boolean
  c?: string
  concurrency?: string
  w?: boolean
  watch?: boolean
  d?: boolean
  deploy?: boolean
  [key: string]: any
}

class Generator {
  public context: Hexo;
  public force: boolean;
  public bail: boolean;
  public concurrency: string;
  public watch: boolean;
  public deploy: boolean;
  public generatingFiles: Set<string>;
  public start: [number, number];
  public args: GenerateArgs;

  constructor(ctx: Hexo, args: GenerateArgs) {
    this.context = ctx;
    this.force = args.f || args.force;
    this.bail = args.b || args.bail;
    this.concurrency = args.c || args.concurrency;
    this.watch = args.w || args.watch;
    this.deploy = args.d || args.deploy;
    this.generatingFiles = new Set();
    this.start = process.hrtime();
    this.args = args;
  }
  generateFile(path: string): Promise<void | boolean> {
    const publicDir = this.context.public_dir;
    const { generatingFiles } = this;
    const { route } = this.context;
    // 如果文件正在生成则跳过
    if (generatingFiles.has(path)) return Promise.resolve();

    // 锁定文件
    generatingFiles.add(path);

    let promise: Promise<boolean>;

    if (this.force) {
      promise = this.writeFile(path, true);
    } else {
      const dest = join(publicDir, path);
      promise = exists(dest).then(exist => {
        if (!exist) return this.writeFile(path, true);
        if (route.isModified(path)) return this.writeFile(path);
      });
    }

    return promise.finally(() => {
      // 解锁文件
      generatingFiles.delete(path);
    });
  }
  writeFile(path: string, force?: boolean): Promise<boolean> {
    const { route, log } = this.context;
    const publicDir = this.context.public_dir;
    const Cache = this.context.model('Cache');
    const dataStream = this.wrapDataStream(route.get(path));
    const buffers = [];
    const hasher = createSha1Hash();

    const finishedPromise = new Promise<void>((resolve, reject) => {
      dataStream.once('error', reject);
      dataStream.once('end', resolve);
    });

    // 获取数据 => 缓存数据 => 计算哈希
    dataStream.on('data', chunk => {
      buffers.push(chunk);
      hasher.update(chunk);
    });

    return finishedPromise.then(() => {
      const dest = join(publicDir, path);
      const cacheId = `public/${path}`;
      const cache = Cache.findById(cacheId);
      const hash = hasher.digest('hex');

      // 如果哈希未变化则跳过生成
      if (!force && cache && cache.hash === hash) {
        return;
      }

      // 将新哈希保存到缓存中
      return Cache.save({
        _id: cacheId,
        hash
      }).then(() => // 将缓存数据写入 public 目录
        writeFile(dest, Buffer.concat(buffers))).then(() => {
        log.info('Generated: %s', magenta(path));
        return true;
      });
    });
  }
  deleteFile(path: string): Promise<void> {
    const { log } = this.context;
    const publicDir = this.context.public_dir;
    const dest = join(publicDir, path);

    return unlink(dest).then(() => {
      log.info('Deleted: %s', magenta(path));
    }, err => {
      // 跳过 ENOENT 错误（文件已被删除）
      if (err && err.code === 'ENOENT') return;
      throw err;
    });
  }
  wrapDataStream(dataStream: ReturnType<Router['get']>): Readable {
    const { log } = this.context;
    // 传递包含所有数据和错误的原始流
    if (this.bail) {
      return dataStream;
    }

    // 传递所有数据，但不抛出错误
    dataStream.on('error', err => {
      log.error(err);
    });

    return dataStream.pipe(new PassThrough());
  }
  firstGenerate(): Promise<void> {
    const { concurrency } = this;
    const { route, log } = this.context;
    const publicDir = this.context.public_dir;
    const Cache = this.context.model('Cache');

    // 显示加载时间
    const interval = prettyHrtime(process.hrtime(this.start));
    log.info('Files loaded in %s', cyan(interval));

    // 重置计时器以备后续使用
    this.start = process.hrtime();


    // 检查 public 文件夹
    return stat(publicDir).then(stats => {
      if (!stats.isDirectory()) {
        throw new Error(`${magenta(tildify(publicDir))} is not a directory`);
      }
    }).catch(err => {
      // 如果不存在则创建 public 文件夹
      if (err && err.code === 'ENOENT') {
        return mkdirs(publicDir);
      }

      throw err;
    }).then(() => {
      const task = (fn, path) => () => fn.call(this, path);
      const doTask = fn => fn();
      const routeList = route.list();
      const publicFiles = Cache.filter(item => item._id.startsWith('public/')).map(item => item._id.substring(7));
      const tasks = publicFiles.filter(path => !routeList.includes(path))
        // 清理文件
        .map(path => task(this.deleteFile, path))
        // 生成文件
        .concat(routeList.map(path => task(this.generateFile, path)));

      return Promise.all(Promise.map(tasks, doTask, { concurrency: parseFloat(concurrency || 'Infinity') }));
    }).then(result => {
      const interval = prettyHrtime(process.hrtime(this.start));
      const count = result.filter(Boolean).length;

      log.info('%d files generated in %s', count.toString(), cyan(interval));
    });
  }
  execWatch(): Promise<void> {
    const { route, log } = this.context;
    return this.context.watch().then(() => this.firstGenerate()).then(() => {
      log.info('Hexo is watching for file changes. Press Ctrl+C to exit.');

      // 监听路由变化
      route.on('update', path => {
        const modified = route.isModified(path);
        if (!modified) return;

        this.generateFile(path);
      }).on('remove', path => {
        this.deleteFile(path);
      });
    });
  }
  execDeploy() {
    return this.context.call('deploy', this.args);
  }
}

function generateConsole(this: Hexo, args: GenerateArgs = {}): Promise<any> {
  const generator = new Generator(this, args);

  if (generator.watch) {
    return generator.execWatch();
  }

  return this.load().then(() => generator.firstGenerate()).then(() => {
    if (generator.deploy) {
      return generator.execDeploy();
    }
  });
}

export = generateConsole;
