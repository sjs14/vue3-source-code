import { isArray, isFunction, isObject } from "@sjs/shared";
import { ReactiveFlags } from "./baseHandle";
import { ReactiveEffect } from "./effect";

// 针对循环引用，可以用set存已经读值的对象
function traversal(target, set = new Set()) {
  if (!isObject(target)) return target;

  if (set.has(target)) return target;
  Object.keys(target).forEach((key) => {
    traversal(target[key], set);
  });

  return target;
}

export function watch(source, cb) {
  let getter;
  if (source[ReactiveFlags.IS_REACTIVE]) {
    getter = () => traversal(source);
  } else if (isFunction(source)) {
    getter = source;
  } else if (isArray(source)) {
    source.forEach((item) => {
      watch(item, cb);
    });
    return;
  } else {
    return;
  }

  let clearup;

  const clearupFn = (fn) => {
    clearup = fn;
  };

  let oldValue;
  const schedulerCb = () => {
    const newValue = effect.run();
    clearup && clearup();
    cb(oldValue, newValue, clearupFn);
    oldValue = newValue;
  };

  const effect = new ReactiveEffect(getter, schedulerCb);

  oldValue = effect.run();
}
