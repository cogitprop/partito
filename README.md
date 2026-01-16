# Partito

Beautiful event pages, effortless RSVPs. Create simple, beautiful event pages and collect RSVPs in seconds — no sign-up required.

## Features

- **No Account Required**: Create events instantly without signing up
- **Beautiful Design**: Elegant, botanical-inspired event pages
- **RSVP Management**: Collect and manage guest responses with ease
- **Password Protection**: Optionally protect your event pages
- **Waitlist Support**: Automatic waitlist management when events fill up
- **Email Notifications**: Guests and hosts receive email updates
- **Calendar Integration**: Add events to Google Calendar, Outlook, or download .ics files
- **Shareable Links**: Easy-to-share event URLs
- **Edit Access Recovery**: Recover access to your events via email
- **Mobile Responsive**: Works beautifully on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form + Zod validation

## Prerequisites

- Node.js 18+ or Bun
- A Supabase account and project
- (Optional) Resend account for email notifications

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/partito.git
cd partito
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations in `supabase/migrations/` in order
3. Deploy the Edge Functions from `supabase/functions/`
4. Update `supabase/config.toml` with your project ID

### 4. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

### 5. Start the development server

```bash
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
partito/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── partito/     # Custom Partito components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Third-party integrations
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   └── types/           # TypeScript types
├── supabase/
│   ├── functions/       # Supabase Edge Functions
│   └── migrations/      # Database migrations
└── ...config files
```

## Supabase Edge Functions

The following Edge Functions power the backend:

- `create-event`: Creates new events with secure token generation
- `contact-form`: Handles contact form submissions
- `event-calendar`: Generates calendar files (.ics)
- `event-share`: Handles event sharing functionality
- `notify-rsvp`: Sends RSVP notifications to hosts
- `notify-waitlist-promotion`: Notifies guests promoted from waitlist
- `og-image`: Generates Open Graph images for social sharing
- `recover-edit-link`: Sends edit link recovery emails

### Setting up email notifications

To enable email notifications, set the `RESEND_API_KEY` secret in your Supabase Edge Functions:

```bash
supabase secrets set RESEND_API_KEY=your-resend-api-key
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
