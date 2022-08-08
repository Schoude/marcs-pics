export function proxRender(value, el, renderFn) {
  const obj = {
    value,
  };

  renderFn(value, el);

  const handlers = {
    get(o, prop) {
      if (prop !== 'value') {
        return undefined;
      }

      return o[prop];
    },

    set(o, prop, value) {
      if (prop !== 'value') {
        return undefined;
      }

      renderFn(value, el);

      o[prop] = value;
      return true;
    }

  };

  return new Proxy(obj, handlers);
}
