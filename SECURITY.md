# Security Policy

## Supported version

Security fixes are applied to the current `main` branch.

## Reporting a vulnerability

Please use **GitHub Private Vulnerability Reporting / Security Advisories** for vulnerabilities that could expose credentials, patient data, authentication sessions, authorization rules or infrastructure details.

Do not publish working credentials, patient information or exploit details in a public issue.

## Security model

ConsultaMed uses Supabase Auth in the browser. The public Supabase `anon` key is expected to be present in frontend builds; authorization must be enforced in PostgreSQL with **Row Level Security (RLS)**.

Never expose any of the following in frontend code or repository history:

- Supabase `service_role` key;
- database passwords;
- private API keys;
- access/refresh tokens;
- real patient datasets.

The file `supabase/security_hardening.sql` is a reviewable baseline for RLS. It is intentionally **not executed automatically by git pull**. Review it against the production schema before applying it in Supabase.

## Operational recommendations

- Require MFA for GitHub, Supabase and hosting accounts.
- Keep public self-signup disabled unless it is explicitly part of the product flow.
- Rotate credentials immediately if a secret is ever committed publicly.
- Review RLS after adding a new table or a new role.
- Use synthetic data for demos and screenshots.
