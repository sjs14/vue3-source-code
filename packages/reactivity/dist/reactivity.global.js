(() => {
  // packages/reactivity/src/effect.ts
  function b1() {
  }
  var b2 = 2;

  // packages/shared/src/index.ts
  var isObject = (target) => {
    return typeof target === "object" && target !== null;
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
    const proxy = new Proxy(target, {
      get(target2, key, receiver) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
          return true;
        }
        return Reflect.get(target2, key, receiver);
      },
      set(target2, key, value, receiver) {
        return Reflect.set(target2, key, value, receiver);
      }
    });
    reactiveMap.set(target, proxy);
    return proxy;
  }
})();
//# sourceMappingURL=reactivity.global.js.map
