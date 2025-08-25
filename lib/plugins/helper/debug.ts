import { inspect } from 'util';

// 将对象格式化为字符串，解决循环引用问题
function inspectObject(object: any, options?: any) {
  return inspect(object, options);
}

// 包装一层输出到控制台
function log(...args: any[]) {
  return Reflect.apply(console.log, null, args);
}

export {inspectObject};
export {log};
