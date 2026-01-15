# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Partito, please report it responsibly:

1. **Do NOT** open a public issue
2. Email security concerns to: hello@partito.org
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 1 week
- **Resolution:** Based on severity
  - Critical: ASAP
  - High: 1-2 weeks
  - Medium: 1 month

## Security Measures

Partito implements the following security measures:

### Authentication & Authorization

- Token-based event editing (64-character hex tokens)
- Server-side token validation via Supabase RPC functions
- Fingerprint-based RSVP modification protection

### Data Protection

- Row-Level Security (RLS) on all database tables
- Sensitive fields excluded from public views
- Password hashing with bcrypt (pgcrypto)
- Guest emails only visible to event hosts

### Input Validation

- XSS sanitization on all user inputs in edge functions
- Input length limits on all fields
- Email format validation
- HTML escaping before embedding in emails

### Rate Limiting

- Event creation: 5 per hour per IP
- RSVP submission: 10 per hour per user
- Automatic cleanup of rate limit records

### Privacy

- No tracking or analytics
- Minimal data collection
- Dietary notes excluded from public RSVP view (medical privacy)
- Email recovery returns generic success (prevents enumeration)

## Self-Hosting Security Checklist

When deploying your own instance:

- [ ] Use HTTPS in production
- [ ] Set strong database passwords
- [ ] Configure Supabase RLS policies (included in migrations)
- [ ] Restrict CORS origins for production
- [ ] Keep dependencies updated
- [ ] Use environment variables for all secrets
- [ ] Enable Supabase's built-in protections

## Acknowledgments

We appreciate security researchers who help keep Partito safe. With your permission, we'll acknowledge your contribution in our changelog.
