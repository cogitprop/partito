# Changelog

All notable changes to Partito will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-15

### Added

- Initial open-source release
- Event creation without sign-up
- Password protection for private events
- RSVP management (Going, Maybe, Can't Go)
- Plus-ones support with configurable limits
- Capacity limits with automatic waitlist
- Waitlist promotion when spots open
- Email notifications for hosts on new RSVPs
- Email notifications for waitlist promotions
- Custom RSVP questions (text, select, checkbox)
- Google Calendar integration
- ICS file download
- Virtual event support with link visibility options
- Guest list visibility controls
- Location privacy options (full address, area only, hidden)
- Event edit link recovery via email
- Contact form
- Mobile-responsive design
- Row-Level Security for all data
- Rate limiting for abuse prevention
- Password hashing with bcrypt

### Security

- XSS protection in all edge functions
- Secure password verification via RPC
- Guest emails hidden from public view
- Dietary information excluded from public RSVP data
- Token-based authorization for event editing
