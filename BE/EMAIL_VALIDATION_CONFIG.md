# Email Domain Validation Configuration

## Overview

This system provides flexible email domain validation for user registration. You can control whether to accept all email domains or restrict to specific university domains.

## Environment Variables

### `ALLOW_ALL_EMAIL_DOMAINS`

- **Type:** Boolean (`true` or `false`)
- **Default:** `false`
- **Description:** Controls whether all email domains are accepted

**Values:**

- `true` - Accept all valid email addresses (gmail.com, yahoo.com, etc.)
- `false` - Only accept university email domains specified in `UNIVERSITY_EMAIL_DOMAINS`

### `UNIVERSITY_EMAIL_DOMAINS`

- **Type:** Comma-separated list of domains
- **Default:** `iit.ac.lk,university.edu`
- **Description:** List of allowed university email domains (only used when `ALLOW_ALL_EMAIL_DOMAINS=false`)

## Configuration Examples

### Example 1: Allow All Emails (Development/Testing)

```env
ALLOW_ALL_EMAIL_DOMAINS=true
UNIVERSITY_EMAIL_DOMAINS=iit.ac.lk,university.edu
```

In this configuration, users can register with any email address:

- ✅ john.doe@gmail.com
- ✅ student@yahoo.com
- ✅ mihan.20220683@iit.ac.lk
- ✅ professor@university.edu

### Example 2: Restrict to University Emails Only (Production)

```env
ALLOW_ALL_EMAIL_DOMAINS=false
UNIVERSITY_EMAIL_DOMAINS=iit.ac.lk,university.edu
```

In this configuration, only university emails are accepted:

- ❌ john.doe@gmail.com (rejected)
- ❌ student@yahoo.com (rejected)
- ✅ mihan.20220683@iit.ac.lk (accepted)
- ✅ professor@university.edu (accepted)

### Example 3: Multiple University Domains

```env
ALLOW_ALL_EMAIL_DOMAINS=false
UNIVERSITY_EMAIL_DOMAINS=iit.ac.lk,mit.edu,stanford.edu,ox.ac.uk
```

Accepts emails from any of the specified universities:

- ✅ mihan.20220683@iit.ac.lk
- ✅ student@mit.edu
- ✅ researcher@stanford.edu
- ✅ professor@ox.ac.uk

## Valid University Email Formats

The system accepts various email formats from university domains:

- Student emails: `student.20220683@iit.ac.lk`
- Staff emails: `professor.name@iit.ac.lk`
- Department emails: `admissions@iit.ac.lk`
- Numbered IDs: `mihan.20220683@iit.ac.lk`

## Implementation Details

- Validation is performed at the DTO level using Zod schema validation
- Domain matching is case-insensitive (`IIT.AC.LK` = `iit.ac.lk`)
- Whitespace is automatically trimmed from domain list
- If `UNIVERSITY_EMAIL_DOMAINS` is empty and `ALLOW_ALL_EMAIL_DOMAINS=false`, no registrations will be accepted (with a warning logged)

## Error Messages

When validation fails, users will receive:

- **Invalid format:** "Invalid email address"
- **Restricted domain:** "Email must be a university email address"

## Setup Instructions

1. Copy `.env.example` to `.env` in the BE folder
2. Set `ALLOW_ALL_EMAIL_DOMAINS` based on your environment:
   - Development: `true` (for easier testing)
   - Production: `false` (to enforce university emails)
3. Configure `UNIVERSITY_EMAIL_DOMAINS` with your institution's domains
4. Restart the backend server

## Testing

Test registration with different email formats to verify the configuration:

```bash
# Test with university email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test.20220683@iit.ac.lk","password":"TestPass123"}'

# Test with non-university email (should fail when ALLOW_ALL_EMAIL_DOMAINS=false)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@gmail.com","password":"TestPass123"}'
```

## Security Considerations

- Always use `ALLOW_ALL_EMAIL_DOMAINS=false` in production environments
- Keep the list of university domains up to date
- Domain validation alone does not verify email ownership - email verification tokens are still sent
- The system performs additional validation for email verification before allowing full access
