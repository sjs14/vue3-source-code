import { track, trigger } from "./effect";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }

    track(target, "get", key);

    return Reflect.get(target, key, receiver);
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
