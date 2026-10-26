# Warranty Wallet

A personal warranty management web application that helps users organize product warranties, track expiry dates, and manage purchase details in one place.

## Features

- **Authentication** — Secure registration, login, and password recovery.
- **Warranty Management** — Create, view, edit, and delete warranty records.
- **Dashboard** — Overview of total, active, expiring-soon, and expired warranties.
- **Search & Filtering** — Find warranties by product and filter by status.
- **Expiry Tracking** — Automatic expiry-date calculation and remaining-days indicators.
- **Data Privacy** — User-specific records protected by Supabase Row Level Security (RLS).
- **Responsive UI** — Minimalist dark interface designed for desktop and mobile.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend & Database:** Supabase Auth, PostgreSQL
- **Security:** Row Level Security (RLS)
- **Testing:** Vitest, React Testing Library, Playwright

## Getting Started

### Prerequisites

- Node.js LTS
- npm
- A Supabase project

### Installation

```bash
git clone https://github.com/YOUR-USERNAME/warranty-wallet.git
cd warranty-wallet
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Apply the SQL migration provided in the `supabase/migrations/` directory using the Supabase SQL Editor. Configure authentication and redirect URLs in your Supabase project.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Commands

```bash
npm run dev       # Start development server
npm run lint      # Run ESLint
npx tsc --noEmit  # Check TypeScript types
npm test          # Run unit and component tests
npm run build     # Create production build
```

## Security

- Authentication is handled by Supabase Auth.
- Row Level Security restricts access to user-owned records.
- Environment variables are excluded from version control.
- No AI, OCR, invoice uploads, or separate backend server is required.

## Project Status

Under development. Automated tests and production deployment should be verified before release.

## License

No license has been specified yet.
