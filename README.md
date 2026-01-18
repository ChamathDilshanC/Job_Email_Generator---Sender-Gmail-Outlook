# JobMail - Professional Job Application Email Generator

A modern, feature-rich Next.js application for creating and sending professional job application emails with Google authentication, resume builder integration, and seamless Gmail/Outlook support.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange?style=for-the-badge&logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Key Features

### 🔐 Authentication & Security

- **Google Authentication** - Secure sign-in with Firebase Authentication
- **Protected Routes** - Locked tabs and features for unauthenticated users
- **Auto Cache Clearing** - Privacy-focused cache management on sign-out
- **Session Management** - Persistent login with secure token handling

### 📧 Email Management

- **Multiple Email Templates** - Professional, Creative, Formal, and Technical templates
- **Real-Time Preview** - See your email as you compose it
- **Gmail API Integration** - Send emails directly with attachments
- **Outlook Support** - mailto: integration for Outlook users
- **Email History** - Track all sent applications
- **Copy to Clipboard** - Quick copy functionality

### 👤 Resume Builder

- **Personal Information Management** - Store and manage your professional details
- **Multiple Experience Entries** - Add unlimited work experiences
- **Education Tracking** - Record your academic background
- **Skills Management** - Organize technical and soft skills
- **Auto-Fill Integration** - Automatically populate email templates

### 🎨 Modern UI/UX

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Modern, professional appearance
- **Sidebar Navigation** - Easy access to all features
- **Lock Icons** - Clear visual indicators for protected features
- **Confirmation Dialogs** - Prevent accidental actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project (for authentication)
- Google Cloud Console project (for Gmail API)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/Job_Email_Generator.git
cd Job_Email_Generator
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file with your Firebase and Google API credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

4. **Start the development server:**

```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📖 Usage Guide

### First Time Setup

1. **Sign In with Google** - Click the "Sign in with Google" button in the header
2. **Complete Resume Builder** - Navigate to "Your Information" and fill in your details
3. **Create Email Template** - Go to "Send Email" and compose your first application

### Sending an Email

1. **Fill Application Details:**
   - Company Name
   - Position/Role
   - Recipient Email
   - Select Email Template

2. **Upload Files:**
   - CV (Required)
   - Cover Letter (Optional)

3. **Choose Email Client:**
   - Gmail (with direct API sending)
   - Outlook (opens default mail client)

4. **Send or Copy:**
   - Click "Send via Gmail" for direct sending
   - Use "Copy Email" for manual sending

### Managing Your Profile

- View email statistics (sent/total)
- Export your data (JSON format)
- Clear application cache
- Sign out with confirmation
- Delete account (with safeguards)

## 🔒 Security Features

### Authentication Guards

- **Locked Navigation** - "Your Information" tab shows lock icon when signed out
- **Disabled Buttons** - Resume Builder button locked until authenticated
- **Tooltip Guidance** - "Sign in to access" messages on locked features
- **Visual Feedback** - Reduced opacity and cursor changes for locked elements

### Privacy Controls

- **Secure Sign Out** - Clears all browser cache and session data
- **Cache Management** - Clear cache option in Profile settings
- **Data Export** - Download all your data before deletion
- **Account Deletion** - Complete data removal with confirmation

## 📁 Project Structure

```
Job_Email_Generator/
├── app/
│   ├── pages/
│   │   ├── SendEmail.tsx       # Email composition page
│   │   ├── ResumeBuilder.tsx   # Personal info management
│   │   ├── EmailTemplates.tsx  # Template selection
│   │   ├── History.tsx         # Email history
│   │   └── Profile.tsx         # User profile & settings
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main app container
├── components/
│   ├── sidebar-01/             # Navigation sidebar
│   ├── ui/                     # UI components
│   ├── alert-dialog.tsx        # Alert system
│   └── firebase-sign-in.tsx    # Auth button
├── contexts/
│   └── AuthContext.tsx         # Authentication state
├── lib/
│   ├── emailTemplate.ts        # Email generation
│   ├── emailTemplateGenerator.ts # Template engine
│   ├── gmailClient.ts          # Gmail API
│   ├── resumeDataService.ts    # Resume data API
│   ├── emailHistoryService.ts  # History management
│   └── clearCache.ts           # Cache utilities
└── firebase.ts                 # Firebase config
```

## 🎨 Customization

### Email Templates

Edit templates in `lib/emailTemplateGenerator.ts`:

```typescript
export function generateEmailFromTemplate(
  templateType: TemplateType,
  resumeData: ResumeData,
  jobDetails: JobDetails
): EmailResult {
  // Customize your templates here
}
```

### Styling

Global styles are in `app/globals.css`:

- CSS variables for theming
- Color scheme customization
- Responsive breakpoints

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, React
- **Styling:** Tailwind CSS, Shadcn/ui components
- **Authentication:** Firebase Authentication
- **APIs:** Gmail API, Google OAuth 2.0
- **Icons:** Lucide React
- **State Management:** React Context API

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

- **Netlify** - Static site deployment
- **AWS Amplify** - Full-stack hosting
- **Custom VPS** - Node.js hosting

## 📝 Recent Updates

- ✅ Added Google Authentication with Firebase
- ✅ Implemented locked tabs for unauthenticated users
- ✅ Added Sign Out button in Profile settings
- ✅ Auto cache clearing on sign-out
- ✅ Fixed sign-in persistence bug
- ✅ Resume data auto-reload on authentication change
- ✅ Lock icons on protected features
- ✅ Confirmation dialogs for critical actions
- ✅ Improved horizontal padding in main view

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Fork the repository
- Create a feature branch
- Submit a pull request

## 📄 License

MIT License - Free to use for personal and commercial projects

## 👨‍💻 Author

**Chamath Dilshan**

- Portfolio: [chamathdilshan.com](https://chamathdilshan.com)
- Email: dilshancolonne123@gmail.com
- Phone: +94 775 616 104

## 🙏 Acknowledgments

- Firebase for authentication services
- Google for Gmail API
- Shadcn/ui for beautiful components
- Vercel for hosting platform

---

Made with ❤️ by Chamath Dilshan • [Privacy Policy](/privacy) • [Terms of Service](/terms)
