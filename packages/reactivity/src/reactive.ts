import { isObject } from "@sjs/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandle";

const reactiveMap = new WeakMap();

export function reactive(target) {
  if (!isObject(target)) {
    return;
  }

  // 同个对象被多次代理时，如果被代理过，则返回代理对象
  const exisitingProxy = reactiveMap.get(target);
  if (exisitingProxy) {
    return exisitingProxy;
  }

  // 第一次代理成功后给代理对象加上标识，
  // 代理对象再次被代理时，判断到已经存在标识IS_REACTIVE，直接返回代理对象
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  const proxy = new Proxy(target, mutableHandlers);

  reactiveMap.set(target, proxy);

  return proxy;
}
