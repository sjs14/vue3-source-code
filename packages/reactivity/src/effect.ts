export let activeEffect = undefined;
export class ReactiveEffect {
  public parent = null;
  public active = true;
  public deps = [];
  constructor(public fn, public scheduler) {}

  run() {
    if (!this.active) {
      return this.fn();
    }

    try {
      clearUpEffect(this);
      this.parent = activeEffect;
      activeEffect = this;
      this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }

  stop() {
    this.active = false;
    clearUpEffect(this);
  }
}

const clearUpEffect = (effect) => {
  const { deps } = effect;
  deps.forEach((dep) => {
    dep.delete(effect);
  });

  effect.deps.length = 0;
};

export function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  // 第一次执行可以收集依赖
  _effect.run();

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
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
  const effects = [...depsMap.get(key)];

  effects &&
    effects.forEach((effect) => {
      if (effect !== activeEffect) {
        effect.scheduler ? effect.scheduler() : effect.run();
      }
    });
};
