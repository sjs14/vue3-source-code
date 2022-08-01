export let activeEffect = undefined;
export class ReactiveEffect {
  public parent = null;
  public active = true;
  public deps = [];
  constructor(public fn) {}

  run() {
    if (!this.active) {
      return this.fn();
    }

    try {
      this.parent = activeEffect;
      activeEffect = this;
      this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn);

  // 第一次执行可以收集依赖
  _effect.run();
}

// 跟踪依赖收集
export const targetMap = new WeakMap();
export const track = (target, type, key) => {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);

  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  let shouldTrack = !dep.has(activeEffect);

  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
};

export const trigger = (target, type, key, oldVal, newVal) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  effects &&
    effects.forEach((effect) => {
      if (effect !== activeEffect) effect.run();
    });
};
