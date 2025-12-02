# External API UI - Vertex AI Admin Panel

A modern React + Vite admin panel for managing Vertex AI configurations with Supabase backend.

*Originally built with [v0.app](https://v0.app) and converted to Vite + React for Lovable compatibility*

[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/edwNFgoakLT)

## Features

- 🔐 Supabase Authentication
- ⚙️ Dynamic Vertex AI Model Configuration
- 🎨 Dark/Light Theme Support
- 📊 Real-time Config Management
- 🚀 Fast Vite Development Server
- 🎯 RAG (Retrieval-Augmented Generation) Configuration
- 🔧 Google Cloud Vertex AI Integration

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build Tool & Dev Server
- **TypeScript** - Type Safety
- **Tailwind CSS v4** - Styling
- **Supabase** - Authentication & Database
- **shadcn/ui** - UI Components
- **React Router** - Client-side Routing
- **Google Cloud Vertex AI** - AI Model Backend

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd external-api-ui
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your Supabase credentials:
\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:3000`

## Project Structure

\`\`\`
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── admin-panel.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.ts   # Authentication hook
│   ├── lib/             # Utilities & clients
│   │   ├── utils.ts     # Helper functions
│   │   └── supabase-browser.ts
│   ├── pages/           # Route pages
│   │   ├── LoginPage.tsx
│   │   └── AdminPage.tsx
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML entry point
└── vite.config.ts       # Vite configuration
\`\`\`

## Database Setup

Run the SQL scripts in your Supabase SQL editor:

1. `scripts/create-supabase-table.sql` - Creates the vertex_configs table
2. `scripts/setup-supabase-auth.sql` - Sets up authentication

## Configuration

The admin panel allows you to configure:

- **Connection**: Supabase URL, API keys
- **Credentials**: Google Cloud project ID, service account credentials
- **Model Settings**: Temperature, Top P, max output tokens
- **System Prompt**: Custom instructions for the AI model
- **RAG Settings**: Corpus ID and similarity configuration

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist/` directory.

## Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Deployment

### Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Netlify
\`\`\`bash
npm install -g netlify-cli
netlify deploy
\`\`\`

### Lovable
This project is compatible with Lovable's Vite/React architecture.

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the client:

- `VITE_SUPABASE_URL` - Your Supabase project URL (Required)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (Required)
- `VITE_VERTEX_PROJECT_ID` - Google Cloud project ID (Optional)
- `VITE_VERTEX_CLIENT_EMAIL` - Service account email (Optional)
- `VITE_VERTEX_PRIVATE_KEY` - Service account private key (Optional)

Additional configuration can be managed through the admin UI after login.

## Original v0 Project

Continue building on v0.app: **[https://v0.app/chat/edwNFgoakLT](https://v0.app/chat/edwNFgoakLT)**

## License

MIT
