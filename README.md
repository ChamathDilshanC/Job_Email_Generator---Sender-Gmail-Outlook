# Job Email Generator

A modern Next.js application that generates professional job application emails with dynamic company and position information. Features a premium dark-themed UI with glassmorphism effects, real-time email preview, and seamless integration with Gmail and Outlook.

![Job Email Generator](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Features

- ✨ **Modern UI Design** - Dark theme with gradients and glassmorphism effects
- 🔄 **Real-Time Preview** - See your email update as you type
- 📧 **Email Client Integration** - Open directly in Gmail or Outlook
- 📋 **Copy to Clipboard** - Quick copy functionality for manual pasting
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast & Lightweight** - Built with Next.js 14 and TypeScript
- 🎨 **Customizable Template** - Easy to modify email content
<br>
<div align="center">
<img width="1919" height="935" alt="Screenshot 2026-01-14 232701" src="https://github.com/user-attachments/assets/536dd857-205e-4a34-86cc-cd3ca5f299da" />

</div>

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or navigate to the project directory:

```bash
cd Job_Email_Generator
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Fill in the form** with your application details:

   - Company Name (e.g., "Niyamu")
   - Position (e.g., "Full Stack Developer Intern")
   - Recipient Email (e.g., "hr@company.com")
   - Select your preferred email client (Gmail or Outlook)

2. **Preview your email** in real-time on the right side

3. **Open in email client** by clicking the primary button, or use the "Copy Email" button to copy the content

## Customizing the Email Template

Edit the template in `lib/emailTemplate.ts`:

```typescript
export const EMAIL_TEMPLATE = `
Your custom email content here...
Use {COMPANY_NAME} and {POSITION} as placeholders
`;
```

The `{COMPANY_NAME}` and `{POSITION}` placeholders will be automatically replaced with the values from the form.

## Project Structure

```
Job_Email_Generator/
├── app/
│   ├── globals.css          # Global styles and design system
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Main application page
│   └── page.module.css       # Component-specific styles
├── lib/
│   ├── emailTemplate.ts      # Email template logic
│   └── emailClient.ts        # Email client integration
├── package.json
├── tsconfig.json
└── next.config.js
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with CSS Modules
- **Fonts**: Google Fonts (Inter)

## Building for Production

```bash
npm run build
npm start
```

## Deployment

This application can be deployed to:

- **Vercel** (recommended) - Zero configuration deployment
- **Netlify** - Static site hosting
- **Any Node.js hosting** - VPS, AWS, etc.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/job-email-generator)

## Screenshots

### Desktop View

The application features a modern dark theme with a split layout showing the form on the left and live email preview on the right.

### Mobile View

Fully responsive design that stacks the form and preview vertically on smaller screens.

## License

MIT License - feel free to use this project for your job applications!

## Author

**Chamath Dilshan**

- Portfolio: [chamathdilshan.com](https://chamathdilshan.com)
- Email: dilshancolonne123@gmail.com
- Phone: +94 775 616 104

## Contributing

Feel free to fork this project and customize it for your own use. If you have suggestions for improvements, please open an issue or submit a pull request.

---

Made with ❤️ by Chamath Dilshan
