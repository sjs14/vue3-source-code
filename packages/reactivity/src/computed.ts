import { isFunction } from "@sjs/shared";
import { ReactiveEffect, tarckEffect, triggerEffet } from "./effect";

export class ComputedRefImpl {
  public effect;
  public _dirty = true;
  public __v_isReadonly = true;
  public __v_isRef = true;
  public _value;
  public dep = new Set();
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;

        // 触发更新
        triggerEffet(this.dep);
      }
    });
  }

  get value() {
    // 依赖收集
    tarckEffect(this.dep);

    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }

    return this._value;
  }

  set value(val) {
    this.setter(val);
  }
}

export const computed = (getterOrOptions) => {
  let getter, setter;

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("no set");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
};
