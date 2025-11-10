# Darpan Beri - Portfolio Website

## Description

Personal portfolio website showcasing my projects, skills, and professional experience. Features a responsive design with dark mode support, interactive sections, and a contact form.

## Features

- Responsive mobile-first design
- Dark/light theme toggle
- Interactive project showcase
- Contact form with validation
- Document downloads section
- Google Analytics 4 tracking
- Easter egg content
- Accessibility optimizations
- Subresource Integrity (SRI) security

## Technologies Used

- HTML5, CSS3, JavaScript
- Bootstrap 3.4.1 (with SRI)
- jQuery 3.7.1 (with SRI)
- Font Awesome 4.7.0 (with SRI)
- Owl Carousel 2.3.4 (with SRI)
- Formspree for form handling
- Google Analytics 4

## Project Structure

```text
DarpanBeri.github.io/
├── assets/
│   ├── css/         # Stylesheets
│   ├── fonts/       # Font Awesome fonts
│   ├── images/      # Website images
│   └── js/          # JavaScript files
├── index.html       # Main webpage
├── CHANGELOG.md     # Development history
├── LICENSE.txt      # MIT License
├── README.md        # Project documentation
└── SPEC.md         # Technical specifications
```

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/DarpanBeri/DarpanBeri.github.io.git
   ```

2. Open `index.html` in a web browser
3. For local development:
   - Use a local server (e.g., Live Server VS Code extension)
   - Enable JavaScript for full functionality
   - Contact form requires production deployment to work
   - Check Google Analytics in debug mode

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

## Production Notes

- Contact form uses Formspree.
- Form includes validation and error handling
- All external links use noopener for security
- Cross-browser tested and optimized
- Accessibility features implemented
- All CDN resources protected with Subresource Integrity (SRI) checks

## Contact Form

The contact form is integrated with [Formspree](https://formspree.io/) for handling submissions. It uses AJAX to submit the form without reloading the page. The following features are implemented:

- **AJAX Submission**: The form submits asynchronously using the Fetch API.
- **Validation**: Input fields are validated for required values and proper email format.
- **Loading State**: A loading indicator is displayed on the submit button during submission.
- **Feedback**: Success or error messages are displayed to the user after submission.
- **Minimalist Design**: Clean, modern interface with placeholder text and subtle styling.

### How to Use

1. Navigate to the "Contact" section of the website.
2. Fill in the required fields (Name, Email, and Message).
3. Click the "Send Message" button.
4. A success message will appear if the submission is successful. Otherwise, an error message will be displayed.

### Troubleshooting

- Ensure the Formspree endpoint (`action` attribute in the form) is correctly configured.
- Check the browser console for any errors if the form does not work as expected.

## Future Improvements

### Performance Optimizations

- Implement responsive image loading with lazy loading
- Minify CSS, JS and HTML files for faster load times
- Enhance PWA features for offline capabilities

### Content & UX Enhancements

- Improve text information to make content more accessible to non-technical visitors
- Enhance grammar and sentence structure throughout the website
- Add project filtering capabilities for easier navigation

### Technical Improvements

- Conduct Code Security Audit
- Implement additional accessibility enhancements
- Optimize animations and transitions for smoother performance

## Contributing

This is a personal portfolio website, but if you find any bugs or have suggestions, feel free to open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.
