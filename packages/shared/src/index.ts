export const isObject = (target) => {
  return typeof target === "object" && target !== null;
};

export const isFunction = (target) => {
  return typeof target === "function";
};

export const isString = (target) => {
  return typeof target === "string";
};

export const isNumber = (target) => {
  return typeof target === "number";
};

export const isArray = Array.isArray;
export const assign = Object.assign;
