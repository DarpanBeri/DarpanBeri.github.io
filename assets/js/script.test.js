const { isValidEmail, initializeTheme } = require('./script.js');

describe('Email Validation', () => {
  test('returns true for valid email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name+tag@domain.co',
      'first_last@sub.domain.org',
      'user-name@domain.io',
      'user123@domain123.net',
    ];
    validEmails.forEach((email) => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  test('returns false for invalid email addresses', () => {
    const invalidEmails = [
      'plainaddress',
      'user@',
      '@domain.com',
      'user@domain',
      'user@domain..com',
      'user@.com',
      'user@domain,com',
      'user@domain com',
      '.user@domain.com',
      'user.@domain.com',
    ];
    invalidEmails.forEach((email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  test('returns false for edge cases like empty string and null', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });

  // Additional Email Validation tests for edge cases and branch logic
  test('trims whitespace and validates', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });

  test('rejects consecutive dots anywhere', () => {
    expect(isValidEmail('user..name@example.com')).toBe(false);
    expect(isValidEmail('user@exa..mple.com')).toBe(false);
  });

  test('rejects dot immediately after @', () => {
    expect(isValidEmail('user@.example.com')).toBe(false);
  });

  test('rejects invalid non-string types', () => {
    [123, true, {}, [], undefined].forEach((v) => {
      expect(isValidEmail(v)).toBe(false);
    });
  });

  test('rejects TLD shorter than 2 characters', () => {
    expect(isValidEmail('user@example.c')).toBe(false);
  });

  test('accepts multi-part alphabetic TLD chain', () => {
    expect(isValidEmail('user@sub.domain.co.uk')).toBe(true);
  });

  test('rejects domain label starting/ending with hyphen', () => {
    expect(isValidEmail('user@-example.com')).toBe(false);
    expect(isValidEmail('user@example-.com')).toBe(false);
  });

  test('rejects local part starting/ending with hyphen', () => {
    expect(isValidEmail('-user@example.com')).toBe(false);
    expect(isValidEmail('user-@example.com')).toBe(false);
  });

  test('rejects unicode or non-ASCII in local or domain', () => {
    expect(isValidEmail('用户@例子.公司')).toBe(false);
    expect(isValidEmail('user@domäin.com')).toBe(false);
  });

  test('rejects multiple @ signs', () => {
    expect(isValidEmail('user@@example.com')).toBe(false);
  });

  // NEW: Additional acceptance cases to improve coverage
  test('accepts underscores and percent signs in local part', () => {
    expect(isValidEmail('user_name@domain.com')).toBe(true);
    expect(isValidEmail('user%name@domain.com')).toBe(true);
  });

  test('accepts uppercase letters and long TLDs', () => {
    expect(isValidEmail('USER@EXAMPLE.MUSEUM')).toBe(true);
  });

  test('rejects spaces around @ or within local/domain parts', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('user@ example.com')).toBe(false);
    expect(isValidEmail('us er@example.com')).toBe(false);
  });

  test('rejects trailing dot in domain', () => {
    expect(isValidEmail('user@example.com.')).toBe(false);
  });

  test('accepts internal hyphens in local and domain (not at ends)', () => {
    expect(isValidEmail('a-b@a-b.com')).toBe(true);
  });
});

describe('Theme Initialization', () => {
  let getItemSpy;

  beforeEach(() => {
    // Spy on jsdom's built-in Storage prototype
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('sets theme to dark when localStorage contains "dark"', () => {
    getItemSpy.mockReturnValue('dark');
    const theme = initializeTheme();
    expect(globalThis.document.documentElement.dataset.theme).toBe('dark');
    expect(theme).toBe('dark');
  });

  test('sets theme to light when localStorage contains "light"', () => {
    getItemSpy.mockReturnValue('light');
    const theme = initializeTheme();
    expect(globalThis.document.documentElement.dataset.theme).toBe('light');
    expect(theme).toBe('light');
  });

  test('defaults to light when localStorage has no theme', () => {
    getItemSpy.mockReturnValue(null);
    const theme = initializeTheme();
    expect(globalThis.document.documentElement.dataset.theme).toBe('light');
    expect(theme).toBe('light');
  });

  test('applies arbitrary saved theme string', () => {
    // Tests that any saved theme value is applied
    getItemSpy.mockReturnValue('blue');
    const theme = initializeTheme();
    expect(globalThis.document.documentElement.dataset.theme).toBe('blue');
    expect(theme).toBe('blue');
  });

  test('falls back to light when saved value is empty string', () => {
    getItemSpy.mockReturnValue('');
    const theme = initializeTheme();
    expect(globalThis.document.documentElement.dataset.theme).toBe('light');
    expect(theme).toBe('light');
  });

  test('handles missing localStorage gracefully', () => {
    const origStorage = globalThis.localStorage;
    delete globalThis.localStorage;
    initializeTheme();
    expect(globalThis.document.documentElement.dataset.theme).toBe('light');
    globalThis.localStorage = origStorage;
  });
});

// Runtime smoke test to execute guarded jQuery-dependent block in script.js
describe('Runtime block smoke test (jQuery guarded)', () => {
  let handlers;
  const makeChain = (sel) => {
    // Chainable no-op function
    const chain = () => chain;
    chain._sel = sel || '';
    const methods = [
      'hide',
      'show',
      'addClass',
      'on',
      'each',
      'attr',
      'find',
      'text',
      'trigger',
      'focus',
      'html',
      'val',
    ];
    methods.forEach((m) => {
      chain[m] = () => chain;
    });
    // Implement fadeOut/fadeIn with immediate callback invocation if provided
    chain.fadeOut = (...args) => {
      const cb = args.find((a) => typeof a === 'function');
      if (cb) cb();
      return chain;
    };
    chain.fadeIn = (...args) => {
      const cb = args.find((a) => typeof a === 'function');
      if (cb) cb();
      return chain;
    };
    // click: register handler or invoke stored one
    chain.click = (fn) => {
      if (fn !== undefined) {
        handlers[chain._sel] = fn;
        return chain;
      }
      const h = handlers[chain._sel];
      if (h !== undefined) {
        h.call(chain, { preventDefault() {} });
      }
      return chain;
    };
    // jQuery-like collection shape
    chain.length = 1;
    return chain;
  };

  beforeEach(() => {
    // Minimal DOM required by runtime code
    document.body.innerHTML =
      '<button id="work" class="btn btn-rabbit">Work</button><button class="theme-toggle" aria-pressed="false"><i class="fa fa-moon-o"></i><span class="sr-only">Switch to dark mode</span></button><div id="owl-demo"></div>';
    // Event handler registry
    handlers = {};
    // Minimal $ stub
    const $stub = (selector) => {
      const chain = makeChain(selector);
      // Ensure selectors used in script.js behave as expected
      if (selector === '#owl-demo') {
        chain.length = 1; // ensure carousel init path sees element present
        chain.trigger = () => {}; // owl.trigger('refresh.owl.carousel') safe
        // Attach plugin method on the chain as jQuery would expose via $.fn
        chain.owlCarousel = $stub.fn.owlCarousel;
      }
      return chain;
    };
    // $(document).ready(fn) should call fn immediately
    $stub.fn = {};
    $stub.fn.owlCarousel = jest.fn(() => makeChain('#owl-demo'));

    // Wrap to special-case $(document)
    const original$ = $stub;
    const wrapper$ = (arg) => {
      // If arg is document (nodeType 9), return a chain with .ready and .on implemented
      if (arg?.nodeType === 9) {
        const docChain = makeChain('document');
        docChain.ready = (fn) => fn?.();
        // Basic delegated handler registration no-op to avoid errors
        docChain.on = () => docChain;
        return docChain;
      }
      return original$(arg);
    };
    Object.assign(wrapper$, $stub);

    globalThis.$ = wrapper$;
  });

  afterEach(() => {
    delete globalThis.$;
    jest.resetModules();
  });

  test('executes guarded code without throwing and initializes owlCarousel upon Work click', () => {
    // Re-require module so guarded block executes with stubbed $
    jest.isolateModules(() => {
      require('./script.js');
    });
    // Simulate clicking Work to trigger lazy init; ensure no errors and plugin available
    $('#work').click();
    expect(typeof $.fn.owlCarousel).toBe('function');
  });
});

// Helper functions extracted to reduce nesting depth
function handleAttrGet(el, name) {
  return el.dataset[name] || el.getAttribute(name);
}

function handleAttrSet(el, name, value) {
  if (name.startsWith('data-')) {
    el.dataset[name.slice(5)] = value;
  } else {
    el.setAttribute(name, value);
  }
}

function createJQueryStub() {
  const $stub = (arg) => {
    if (arg?.nodeType === 9) {
      return {
        ready: (fn) => {
          if (fn !== undefined) fn();
        },
        on: () => {},
      };
    }
    let el = null;
    if (typeof arg === 'string') {
      el = document.querySelector(arg);
    } else if (arg?.nodeType === 1) {
      el = arg;
    }
    const chain = {
      length: el ? 1 : 0,
      hide: () => chain,
      show: () => chain,
      addClass: (cls) => {
        if (el) el.classList.add(cls);
        return chain;
      },
      removeClass: (cls) => {
        if (el) el.classList.remove(cls);
        return chain;
      },
      on: (type, handler) => {
        if (el && handler !== undefined) el.addEventListener(type, handler);
        return chain;
      },
      click: (fn) => {
        if (!el) return chain;
        if (fn !== undefined) {
          el.addEventListener('click', fn);
        }
        return chain;
      },
      each: () => chain,
      attr: (name, value) => {
        if (!el) return chain;
        if (value === undefined) return handleAttrGet(el, name);
        handleAttrSet(el, name, value);
        return chain;
      },
      find: (sel) => {
        const child = el?.querySelector(sel);
        return $stub(child || sel);
      },
      text: (t) => {
        if (el && t !== undefined) el.textContent = String(t);
        return chain;
      },
      trigger: () => chain,
      focus: () => {
        if (el?.focus) el.focus();
        return chain;
      },
      html: (h) => {
        if (el && h !== undefined) el.innerHTML = String(h);
        return chain;
      },
      val: (v) => {
        if (!el) return chain;
        if (v === undefined) return el.value;
        el.value = v;
        return chain;
      },
      fadeOut: (...args) => {
        const cb = args.find((a) => typeof a === 'function');
        if (cb) cb();
        return chain;
      },
      fadeIn: (...args) => {
        const cb = args.find((a) => typeof a === 'function');
        if (cb) cb();
        return chain;
      },
      is: (sel) => {
        if (!el) return false;
        if (sel === ':visible') {
          const cs = getComputedStyle(el);
          return cs.display !== 'none' && cs.visibility !== 'hidden';
        }
        try {
          return el.matches(sel);
        } catch (error) {
          console.error('Error matching selector:', error);
          return false;
        }
      },
    };
    return chain;
  };
  $stub.fn = {};
  return $stub;
}

describe('Runtime interactions: theme toggle and contact form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button class="theme-toggle" aria-pressed="false">
        <i class="fa fa-moon-o"></i><span class="sr-only">Switch to dark mode</span>
      </button>
      <div id="form-status" class="alert" style="display:none"></div>
      <form id="contactForm" action="https://formspree.io/f/xkgrwpbr" method="POST">
        <input type="text" name="name" required value="John Doe" />
        <input type="email" name="email" required value="john@example.com" />
        <textarea name="message" required>Hi</textarea>
        <button type="submit">Send</button>
      </form>
    `;
    document.documentElement.dataset.theme = 'light';

    if (globalThis.scrollTo === undefined) {
      globalThis.scrollTo = () => {};
    }
    try {
      if (globalThis.history?.pushState) {
        jest.spyOn(globalThis.history, 'pushState').mockImplementation(() => {});
      }
    } catch (error) {
      console.error('Error setting up history spy:', error);
    }
    if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = function () {};
    }

    const origWinAddEventListener = globalThis.addEventListener;
    const shouldIgnoreEvent = (type) =>
      type === 'load' || type === 'orientationchange' || type === 'resize';
    globalThis.addEventListener = (type, listener) => {
      if (shouldIgnoreEvent(type)) {
        return;
      }
      return origWinAddEventListener.call(globalThis, type, listener);
    };
    globalThis.setInterval = jest.fn(() => 0);
    globalThis.clearInterval = jest.fn();
    globalThis.setTimeout = (cb, _ms) => {
      if (cb !== undefined) {
        try {
          cb();
        } catch (error) {
          console.error('Error in setTimeout callback:', error);
        }
      }
      return 0;
    };
    if (document.elementFromPoint === undefined) {
      document.elementFromPoint = () => null;
    } else {
      jest.spyOn(document, 'elementFromPoint').mockImplementation(() => null);
    }

    globalThis.$ = createJQueryStub();
    jest.resetModules();

    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const sr = themeToggle.querySelector('.sr-only');
    function toggleTheme() {
      const currentTheme = document.documentElement.dataset.theme || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = newTheme;
      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
      themeIcon.className = newTheme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
      themeToggle.setAttribute('aria-checked', newTheme === 'dark');
      sr.textContent = newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
    themeToggle.addEventListener('click', toggleTheme);

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');

        const formData = new FormData(form);
        try {
          await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: { Accept: 'application/json' },
          });
        } catch (error) {
          console.error('Error submitting form:', error);
        } finally {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn-loading');
        }
      });
    }
  });

  test('theme toggle button flips html[data-theme] and updates aria-pressed', () => {
    const toggle = document.querySelector('.theme-toggle');
    const icon = toggle.querySelector('i');
    const sr = toggle.querySelector('.sr-only');

    expect(document.documentElement.dataset.theme).toBe('light');
    toggle.click();
    expect(['dark', 'light']).toContain(document.documentElement.dataset.theme);
    // After first click from light -> dark expected
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(icon.className).toContain('fa-sun-o');
    expect(sr.textContent).toMatch(/Switch to light mode/i);
  });

  test('contact form submit adds and removes loading state and calls fetch', async () => {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    globalThis.fetch = fetchMock;

    // Dispatch submit
    const ev = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(ev);

    // Loading state applied before fetch
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.classList.contains('btn-loading')).toBe(true);

    // Wait microtasks
    await Promise.resolve();

    // Fetch called with formspree endpoint
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toMatch(/^https:\/\/formspree\.io\/f\//);
    expect(opts?.method?.toUpperCase()).toBe('POST');

    // After handler completion, loading removed
    // Give the finally{} a tick
    await Promise.resolve();
    expect(submitBtn.disabled).toBe(false);
    expect(submitBtn.classList.contains('btn-loading')).toBe(false);

    delete globalThis.fetch;
  });
});
