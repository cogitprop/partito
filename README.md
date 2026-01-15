# Partito

**Simple, beautiful event invitations without the sign-up.**

Create shareable event pages with RSVPs, capacity limits, waitlists, and email notifications - all without requiring your guests to create accounts.

[Live Demo][1] | [Report Bug][2] | [Request Feature][3]

![Partito Screenshot][image-1]

## Features

- **No Account Required** - Create events instantly, no sign-up needed
- **Password Protection** - Keep private events private
- **Smart RSVPs** - Going, Maybe, Can't Go responses with plus-ones
- **Capacity & Waitlists** - Automatic waitlist management when events fill up
- **Email Notifications** - Hosts get notified of new RSVPs
- **Custom Questions** - Add your own questions to the RSVP form
- **Calendar Integration** - Google Calendar and .ics downloads
- **Mobile-Friendly** - Looks great on any device
- **Privacy-First** - Minimal data collection, guest emails only visible to hosts

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Email:** Resend
- **Icons:** Lucide React

## Self-Hosting Guide

### Prerequisites

- Node.js 18+ (or Bun)
- A [Supabase][4] account (free tier works)
- A [Resend][5] account for email notifications (free tier: 100 emails/day)
- A domain with DNS access (for Resend email verification)

### Step 1: Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/partito.git
cd partito
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com][6]
2. Go to **Project Settings \> API** and copy:
   3. Project URL
   4. `anon` public key
3. Install Supabase CLI: `npm install -g supabase`
4. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
5. Run migrations: `supabase db push`
6. Deploy edge functions: `supabase functions deploy`

### Step 3: Set Up Resend

1. Create account at [resend.com][7]
2. Add and verify your domain
3. Create an API key
4. In Supabase Dashboard, go to **Edge Functions \> Secrets** and add:
   5. `RESEND_API_KEY` = your Resend API key
   6. `SITE_URL` = your deployed URL (e.g., `https://events.yourdomain.com`)

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

### Step 5: Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

### Step 6: Deploy

Build for production:

```bash
npm run build
```

Deploy the `dist` folder to any static hosting:
- [Vercel][8] (recommended)
- [Netlify][9]
- [Cloudflare Pages][10]

## Configuration

### Environment Variables

| Variable                        | Required | Description              |
| ------------------------------- | -------- | ------------------------ |
| `VITE_SUPABASE_PROJECT_ID`      | Yes      | Your Supabase project ID |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes      | Supabase anon/public key |
| `VITE_SUPABASE_URL`             | Yes      | Supabase project URL     |

### Edge Function Secrets (in Supabase Dashboard)

| Secret           | Required | Description                       |
| ---------------- | -------- | --------------------------------- |
| `RESEND_API_KEY` | Yes      | Resend API key for emails         |
| `SITE_URL`       | Yes      | Your deployed URL for email links |

### Customization

- **Branding:** Edit `src/index.css` for colors, `tailwind.config.ts` for theme
- **Email Templates:** Modify HTML in `supabase/functions/*/index.ts`
- **Contact Email:** Update `hello@partito.org` references in edge functions

## Project Structure

```
partito/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── partito/     # Custom Partito components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── integrations/    # Supabase client
│   ├── lib/             # Utilities
│   ├── pages/           # Route pages
│   └── types/           # TypeScript types
└── supabase/
    ├── functions/       # Edge functions
    └── migrations/      # Database schema
```

## Contributing

Contributions are welcome! Please read our[Contributing Guide][11] before submitting a PR.

## Security

For security concerns, please see our[Security Policy][12].

## License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0).

This means:
- You can use, modify, and distribute this software
- If you run a modified version as a web service, you must make your source code available
- Any modifications must also be licensed under AGPL-3.0

See the [LICENSE][13] file for details.

## Acknowledgments

- Built with[Lovable][14]
- UI components from[shadcn/ui][15]
- Icons from[Lucide][16]


[1]:	https://partito.org
[2]:	../../issues
[3]:	../../issues
[4]:	https://supabase.com
[5]:	https://resend.com
[6]:	https://supabase.com
[7]:	https://resend.com
[8]:	https://vercel.com
[9]:	https://netlify.com
[10]:	https://pages.cloudflare.com
[11]:	CONTRIBUTING.md
[12]:	SECURITY.md
[13]:	LICENSE
[14]:	https://lovable.dev
[15]:	https://ui.shadcn.com
[16]:	https://lucide.dev

[image-1]:	public/og-image.png