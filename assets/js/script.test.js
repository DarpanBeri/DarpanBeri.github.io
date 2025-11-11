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
});

describe('Theme Initialization', () => {
  let getItemSpy;
  let setAttributeSpy;

  beforeEach(() => {
    // Spy on jsdom's built-in Storage and Element prototypes
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    setAttributeSpy = jest.spyOn(Element.prototype, 'setAttribute');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('sets theme to dark when localStorage contains "dark"', () => {
    getItemSpy.mockReturnValue('dark');
    const theme = initializeTheme();
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
    expect(theme).toBe('dark');
  });

  test('sets theme to light when localStorage contains "light"', () => {
    getItemSpy.mockReturnValue('light');
    const theme = initializeTheme();
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
    expect(theme).toBe('light');
  });

  test('defaults to light when localStorage has no theme', () => {
    getItemSpy.mockReturnValue(null);
    const theme = initializeTheme();
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
    expect(theme).toBe('light');
  });

  // Additional Theme Initialization tests for edge cases and branch logic
  test('applies arbitrary saved theme string', () => {
    getItemSpy.mockReturnValue('blue');
    const theme = initializeTheme();
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'blue');
    expect(theme).toBe('blue');
  });

  test('falls back to light when saved value is empty string', () => {
    getItemSpy.mockReturnValue('');
    const theme = initializeTheme();
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
    expect(theme).toBe('light');
  });

  test('handles missing localStorage gracefully', () => {
    const origStorage = globalThis.localStorage;
    // eslint-disable-next-line no-global-assign
    delete globalThis.localStorage;
    const theme = initializeTheme();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
    globalThis.localStorage = origStorage;
  });
});
