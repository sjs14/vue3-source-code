import { isArray, isObject } from "@sjs/shared";
import { tarckEffect, triggerEffet } from "./effect";
import { reactive } from "./reactive";

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

class RefImpl {
  public dep = new Set();
  public _value;
  public __v_isRef = true;
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    tarckEffect(this.dep);
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      // 新赋值的可能是对象
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      triggerEffet(this.dep);
    }
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function toRef(target, value) {
  return {
    get value() {
      return target[value];
    },

    set value(newValue) {
      target[value] = newValue;
    },
  };
}

export function toRefs(target) {
  const object = isArray(target) ? new Array(target.length) : {};

  for (const key in target) {
    object[key] = toRef(target, key);
  }

  return object;
}

export function proxyRefs(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const r = Reflect.get(target, key, receiver);

      return r.__v_ifRef ? r.value : r;
    },

    set(target, key, value, receiver) {
      let oldValue = target[key];
      if (oldValue.__v_ifRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
