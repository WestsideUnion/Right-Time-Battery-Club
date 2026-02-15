# SPEC.md — Right Time Battery Club (MVP v1)

## Summary
Right Time Battery Club is a secure digital receipt vault and warranty tracker for watch battery services.
Customers upload receipt photos, confirm extracted structured data, and access warranty status via email OTP login.
Receipt photos are automatically deleted after 13 months for privacy.

Stack:
- Hosting: Vercel
- Frontend: Next.js (App Router) + React + TypeScript + Tailwind
- Backend: Supabase (Auth, Postgres, Storage, Edge Functions, RLS)

## Core Requirements
- Email OTP authentication (no passwords)
- Receipt upload with hybrid OCR + manual confirmation
- Support multiple battery items per receipt
- Warranty expires at 12 months
- Receipt photo and data deleted at 13 months
- Strict Supabase Row Level Security
- Admin dashboard with CSV export of opted‑in customers

## Roles
### Customer
- Auth via email OTP
- Can access only their receipts
- Can confirm/edit extracted fields

### Admin
- Shop-scoped access
- Search/filter receipts
- View signed image URLs
- Edit structured data
- Export opted-in customers to CSV

## Receipt Parsing Rules
- Detect lines matching: "Battery change <model>"
- Next non-empty line is watch brand code
- Support multiple item groups
- Extract service date/time from header

## Data Model (SaaS-ready)
Tables:
- shops
- customers
- receipts
- receipt_items
- shop_members
- audit_logs
- receipt_deletions

All scoped by shop_id with RLS.

## Security
- No unauthenticated lookup
- Private storage with signed URLs
- No payment data storage
- Rate limiting on OTP and uploads

## Retention
- Expire at 12 months
- Delete photo + record at 13 months
- Automated cron cleanup
- Log deletions

## Acceptance Criteria
- Secure auth enforced
- Multi-item receipts supported
- Admin CSV export works
- Automated deletion verified
- RLS isolation enforced
