# Technical Specification

## Project Organization
- Active development in root directory
- Reference materials in old_website/ (excluded from version control)
- Version control via Git with GitHub Pages deployment
- .gitignore configured for reference files and system artifacts

## Current Architecture
- Base template: rabbit-master
- Custom modifications from old_website
- Bootstrap-based responsive design
- Font Awesome for icons
- jQuery 3.7.1 for interactions
- Owl Carousel 2.3.4 for image slider
- Formspree for contact form handling
- Google Analytics 4 for user tracking

### Typography System
- Primary Fonts
  - Headings: "Josefin Sans", sans-serif
  - Body: "Crimson", serif
  - UI Elements: "Josefin Sans", sans-serif
  - Fallback: "Lato", sans-serif
- Font Sizes
  - Base size: 16px
  - Mobile base size: 14px
  - Page title: 36px (28px mobile)
  - Headings scale: 2em to 0.9em
  - Buttons and interactive elements: 16px
  - Home description: 19px (17px mobile)
  - Subtitle: 20px (18px mobile)
- Line Heights
  - Body text: 1.75
  - Headings: 1.2
  - Interactive elements: 1.5
- Letter Spacing
  - Buttons and links: 0.5px
  - Normal text: default
- Font Weights
  - Headings: 700 (bold)
  - Body: 400 (regular)
  - Special elements: 600 (semi-bold)

## Component Analysis

### Header/Navigation
- Vertical navigation with animated transitions
- Social media links with hover effects
- Responsive avatar image
- Dark mode toggle button
- Skip to main content functionality
  - Hidden by default, visible on focus
  - Keyboard accessible
  - Proper focus management
  - High contrast styling

### Sections
1. Home
   - Full-height landing page
   - Responsive avatar with optimized loading
   - Social links with accessibility improvements
   - Keyboard-navigable menu buttons
   - Main content region with proper ARIA attributes

2. About
   - Split layout with responsive images
   - Education info with custom styling
   - Skills list with scrollable table
   - Personal description
   - Document download buttons with tracking

3. Work
   - Owl Carousel slider with autoplay
   - Project showcase with loading animations
   - Academic achievements section
   - Current and previous projects
   - Project links with tracking
   - Custom button styling for actions

4. Resources
   - Document links with visual feedback
   - Download tracking capability
   - Easter egg navigation feature
   - Secure external links with noopener

5. Contact
   - Formspree integration (endpoint: xkgrwpbr)
   - Client-side validation with error messages
   - Loading states and animations
   - Success/error feedback
   - Location information
   - ARIA-compliant form fields
   - Rate limiting protection

## Technical Improvements
1. Performance
   - Lazy loading for images
   - Optimized GIF loading behavior
   - Loading state animations
   - CSS transitions optimization
   - Button styling refinements

2. Accessibility
   - Skip to main content implementation
   - ARIA labels and landmarks
   - Keyboard navigation support
   - Focus state management
   - Color contrast in both themes
   - Screen reader compatibility
   - Semantic HTML structure
   - Proper heading hierarchy
   - Focus trap management
   - Touch target sizing

3. User Experience
   - Dark/light theme toggle
   - Form validation feedback
   - Loading state indicators
   - Smooth transitions
   - Mobile-first responsive design
   - Consistent button behavior

## Browser Support
- Modern Chromium browsers (Chrome, Edge, Opera)
- Firefox
- Safari
- Mobile browsers
  - iOS Safari
  - Chrome for Android
  - Samsung Internet

## Security Measures
- Form protection via Formspree
- External links with noopener
- Content-Security-Policy ready
- Input validation and sanitization
- Protected email addresses
- Secure file downloads
- Form submission rate limiting
- Production endpoint configuration
- Subresource Integrity (SRI) checks for all external scripts and stylesheets

## Analytics & Tracking
- Google Analytics 4 integration
  - Event tracking implementation
    - Document downloads
    - Form submissions and interactions
    - Navigation patterns
    - Theme preferences
    - Carousel usage
    - Easter egg discovery
  - Custom dimensions for user behavior
  - Conversion tracking for form submissions
  - Performance metrics collection
  - User journey analysis
  - Mobile vs desktop usage tracking
  - Document popularity tracking
  - Error rate monitoring

## Development Workflow
- Git-based version control
- Documentation-driven development
- Systematic testing approach
- Performance monitoring
- Cross-browser validation
- Mobile-first development
- Accessibility-first design
- Analytics-driven improvements
- Regular documentation updates

## AI Cleanup and Guardrails Implementation Plan

This section supersedes the previous ad-hoc “Implementation Details for Priority Improvements”. It defines a comprehensive, automated framework to validate and improve any AI-generated or edited content end-to-end.

### Objectives
- Normalize and format code and content consistently.
- Validate HTML, accessibility, links, SEO, and performance budgets.
- Enforce tests and coverage for behavior changes.
- Block unsafe patterns (inline JS, missing rel on external links, non-semantic controls).
- Automate checks pre-commit and in CI to keep main stable.

### Tooling Overview
- Formatters/Linters: Prettier, ESLint, Stylelint, Markdownlint
- HTML Validation: html-validate
- Accessibility: jest-axe (unit), pa11y/axe (page-level in CI)
- Links: lychee link checker
- Tests: Jest (unit + coverage), Playwright (E2E smoke)
- Performance: Lighthouse CI with budgets (Performance ≥ 90; Total JS ≤ 250 KB)
- Prose: Vale (Google developer style)
- CI: GitHub Actions (lint, tests, coverage upload to Codecov, validation, E2E)
- Bots: Semantic Pull Requests, Dependabot

### Guardrail Rules (non-exhaustive)
- No inline event handlers (e.g., `onclick=`) — handlers must be in JS modules.
- External `target="_blank"` links must include `rel="noopener noreferrer"`.
- Use semantic elements for interactivity (`<button>` not `div role="button">`).
- Accessible feedback: `#form-status` must have `role="status"` and `aria-live="polite"`.
- Respect `prefers-reduced-motion` for animations.
- Maintain tests and coverage for changed behavior.

### CI Gates (summary)
- Lint and format checks must pass.
- HTML validation, link check, and accessibility checks must pass.
- Unit tests with coverage thresholds must pass; coverage uploaded to Codecov.
- E2E smoke tests must pass.
- Lighthouse budgets must be met.

### PR Sequencing (high-level)
- PR 1: Repo hygiene, templates, CODEOWNERS, SPEC alignment (this plan).
- PR 2: Tooling bootstrap (package.json, configs, Husky + lint-staged, initial unit tests).
- PR 3: CI (lint + unit + coverage + html-validate + markdownlint + stylelint) and Codecov.
- PR 4: Link and accessibility checks in CI (lychee, pa11y/axe, jest-axe fragments).
- PR 5: Playwright E2E and workflow.
- PR 6: PR bots (Semantic PRs, Dependabot).
- PR 7: Performance budgets via Lighthouse CI and Vale prose lint in CI.

Any future scope changes should update this plan here.
