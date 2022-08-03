import { isObject } from "@sjs/shared";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }

    track(target, "get", key);

    const res = Reflect.get(target, key, receiver);

    if (isObject(res)) {
      // 相比vue2，性能提示，只有取值我才代理，不是一开始就递归代理
      return reactive(res);
    }

    return res;
  },
  set(target, key, value, receiver) {
    let oldVal = target[key];
    let result = Reflect.set(target, key, value, receiver);

    if (oldVal !== value) {
      trigger(target, "set", key, oldVal, value);
    }

    return result;
  },
};
