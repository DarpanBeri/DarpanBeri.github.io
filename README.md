# Darpan Beri — Portfolio Website

[![CI](https://github.com/DarpanBeri/DarpanBeri.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/DarpanBeri/DarpanBeri.github.io/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DarpanBeri_DarpanBeri.github.io&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DarpanBeri_DarpanBeri.github.io)

## Description

Personal portfolio website showcasing my projects, skills, and professional experience. Features a responsive design with dark mode support, interactive sections, and a contact form.

## Features

- Responsive mobile-first design
- Dark/light theme toggle
- Interactive project showcase with carousel
- Contact form with AJAX submission and validation
- Document downloads section (resume, CV, capstone materials)
- Google Analytics 4 tracking
- Easter egg content
- Accessibility optimizations
- Subresource Integrity (SRI) on all CDN resources

## Technologies Used

- HTML5, CSS3, JavaScript
- Bootstrap 3.4.1 (with SRI)
- jQuery 3.7.1 (with SRI)
- Font Awesome 4.7.0 (with SRI)
- Owl Carousel 2.3.4 (with SRI)
- Formspree for contact form handling
- Google Analytics 4

## Project Structure

```text
DarpanBeri.github.io/
├── assets/
│   ├── css/              # Stylesheets (main.css + vendored Bootstrap/FA)
│   ├── fonts/            # Font Awesome font files
│   ├── images/           # Website images
│   └── js/               # JavaScript (script.js, script.test.js, bootstrap.min.js)
├── tests/
│   └── e2e.spec.js       # Playwright end-to-end tests
├── .github/
│   ├── workflows/ci.yml  # GitHub Actions CI pipeline
│   └── ISSUE_TEMPLATE/   # Bug report & feature request templates
├── index.html            # Main webpage
├── LICENSE.txt           # MIT License
└── README.md             # This file
```

## Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/DarpanBeri/DarpanBeri.github.io.git
   cd DarpanBeri.github.io
   ```

2. Install dependencies (also installs Husky pre-commit hooks):

   ```bash
   npm install
   ```

3. Open `index.html` in a web browser, or use the local dev server:

   ```bash
   npm run serve
   # → http://localhost:8080
   ```

> **Note:** The contact form requires a production Formspree endpoint to submit successfully. Google Analytics events are visible in GA4 DebugView when running locally.

## Developer Workflow

All quality checks are available as npm scripts:

| Script                  | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `npm run format`        | Auto-format all files with Prettier                            |
| `npm run format:check`  | Check formatting without modifying files (used by CI)          |
| `npm run lint`          | Run ESLint + Stylelint + markdownlint                          |
| `npm test`              | Run Jest unit tests                                            |
| `npm run test:coverage` | Run Jest with LCOV coverage report                             |
| `npm run validate:html` | Validate `index.html` with html-validate                       |
| `npm run check:links`   | Spin up local server and scan for broken links                 |
| `npm run check:a11y`    | Spin up local server and run axe accessibility audit           |
| `npm run check-all`     | Run format check + lint + tests + HTML validation + link check |
| `npx playwright test`   | Run Playwright end-to-end tests                                |

Pre-commit hooks (Husky + lint-staged) automatically run Prettier and ESLint on staged files before every commit.

### CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `master`:

1. Format check
2. Lint (ESLint, Stylelint, markdownlint)
3. Unit tests with coverage
4. HTML validation
5. Link check
6. SonarCloud static analysis

## Resources

- [Resume](https://drive.google.com/file/d/10iwzb8ozByW5ceRHkb1m6lqpoq2UXtJo/view?usp=sharing)
- [Academic CV](https://drive.google.com/file/d/1ABtV72YgdHfK2IFIjTesv_3jV3DQBdyq/view?usp=sharing)
- [Capstone Poster](https://drive.google.com/file/d/1WyMcFZaHDOcC9xkAh8VggRbmTfmtzV_k/view?usp=drive_link)
- [Capstone Report](https://drive.google.com/file/d/1ZUx-jpPcDKeLZZMVJCRz5k9ipT5hy2m0/view?usp=drive_link)

## Analytics

The website uses Google Analytics 4 to track:

- Document downloads and interactions
- Form submissions and success rates
- Page navigation patterns
- Theme preference usage
- Carousel interactions
- Easter egg discoveries

## Contact Form

The contact form is integrated with [Formspree](https://formspree.io/) and submits asynchronously without a page reload.

- **Validation**: Required fields and email format are validated client-side before submission
- **Loading state**: Submit button shows a loading indicator during the request
- **Feedback**: Success or error messages are displayed after submission
- **Troubleshooting**: If the form does not submit, verify the Formspree endpoint in the `action` attribute of the `<form>` tag and check the browser console for errors

## Contributing

This is a personal portfolio website, but bug reports and suggestions are welcome — open a GitHub issue using the provided templates.

## License

This project is licensed under the MIT License — see [LICENSE.txt](LICENSE.txt) for details.
