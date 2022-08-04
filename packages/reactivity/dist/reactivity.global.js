var SjsReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    ComputedRefImpl: () => ComputedRefImpl,
    ReactiveEffect: () => ReactiveEffect,
    activeEffect: () => activeEffect,
    computed: () => computed,
    effect: () => effect,
    reactive: () => reactive,
    tarckEffect: () => tarckEffect,
    targetMap: () => targetMap,
    track: () => track,
    trigger: () => trigger,
    triggerEffet: () => triggerEffet,
    watch: () => watch
  });

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.parent = null;
      this.active = true;
      this.deps = [];
    }
    run() {
      if (!this.active) {
        return this.fn();
      }
      let res;
      try {
        this.parent = activeEffect;
        activeEffect = this;
        clearUpEffect(this);
        res = this.fn();
      } finally {
        activeEffect = this.parent;
      }
      return res;
    }
    stop() {
      this.active = false;
      clearUpEffect(this);
    }
  };
  var clearUpEffect = (effect2) => {
    const { deps } = effect2;
    deps.forEach((dep) => {
      dep.delete(effect2);
    });
    effect2.deps.length = 0;
  };
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  var track = (target, type, key) => {
    if (!activeEffect)
      return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    tarckEffect(dep);
  };
  function tarckEffect(dep) {
    if (!activeEffect)
      return;
    let shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
  var trigger = (target, type, key, oldVal, newVal) => {
    const depsMap = targetMap.get(target);
    if (!depsMap)
      return;
    const effects = depsMap.get(key);
    triggerEffet(effects);
  };
  function triggerEffet(effects) {
    effects = [...effects];
    effects && effects.forEach((effect2) => {
      if (effect2 !== activeEffect) {
        try {
          effect2.scheduler ? effect2.scheduler() : effect2.run();
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  // packages/shared/src/index.ts
  var isObject = (target) => {
    return typeof target === "object" && target !== null;
  };
  var isFunction = (target) => {
    return typeof target === "function";
  };
  var isArray = Array.isArray;

  // packages/reactivity/src/baseHandle.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, "get", key);
      const res = Reflect.get(target, key, receiver);
      if (isObject(res)) {
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
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target)) {
      return;
    }
    const exisitingProxy = reactiveMap.get(target);
    if (exisitingProxy) {
      return exisitingProxy;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    const proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }

  // packages/reactivity/src/computed.ts
  var ComputedRefImpl = class {
    constructor(getter, setter) {
      this.setter = setter;
      this._dirty = true;
      this.__v_isReadonly = true;
      this.__v_isRef = true;
      this.dep = /* @__PURE__ */ new Set();
      this.effect = new ReactiveEffect(getter, () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffet(this.dep);
        }
      });
    }
    get value() {
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
  };
  var computed = (getterOrOptions) => {
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

  // packages/reactivity/src/watch.ts
  function traversal(target, set = /* @__PURE__ */ new Set()) {
    if (!isObject(target))
      return target;
    if (set.has(target))
      return target;
    Object.keys(target).forEach((key) => {
      traversal(target[key], set);
    });
    return target;
  }
  function watch(source, cb) {
    let getter;
    if (source["__v_isReactive" /* IS_REACTIVE */]) {
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
      const newValue = effect2.run();
      clearup && clearup();
      cb(oldValue, newValue, clearupFn);
      oldValue = newValue;
    };
    const effect2 = new ReactiveEffect(getter, schedulerCb);
    oldValue = effect2.run();
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
