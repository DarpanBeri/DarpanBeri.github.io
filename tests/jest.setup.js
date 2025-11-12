// Ensure a window object exists
if (typeof window === 'undefined') {
  // eslint-disable-next-line no-global-assign
  global.window = globalThis;
}

// Provide a safe stub for window.$ so importing script.js in Jest does not throw.
// The stub implements the $(fn) signature as a no-op, so document-ready handlers
// do not execute in Jest/jsdom. This avoids side effects during module import.
if (typeof window.$ !== 'function') {
  const $stub = (arg) => {
    if (typeof arg === 'function') {
      // In Jest, do not execute document-ready handlers at import time.
      return undefined;
    }
    // Minimal chain object if a selector is passed inadvertently.
    return {
      length: 0,
      on() {
        return this;
      },
      each() {
        return this;
      },
      hide() {
        return this;
      },
      show() {
        return this;
      },
      addClass() {
        return this;
      },
      attr() {
        return this;
      },
      find() {
        return this;
      },
      text() {
        return this;
      },
      trigger() {
        return this;
      },
      fadeIn() {
        return this;
      },
      fadeOut() {
        return this;
      },
      click() {
        return this;
      },
      val() {
        return this;
      },
      html() {
        return this;
      },
    };
  };
  $stub.fn = {};
  window.$ = $stub;
}
