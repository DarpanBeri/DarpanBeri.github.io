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
});
