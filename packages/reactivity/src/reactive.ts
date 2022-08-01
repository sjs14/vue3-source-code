import { isObject } from "@sjs/shared";

const reactiveMap = new WeakMap();

const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

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

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === ReactiveFlags.IS_REACTIVE) {
        return true;
      }

      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver);
    },
  });

  reactiveMap.set(target, proxy);

  return proxy;
}
