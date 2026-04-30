# Database Setup Guide

This guide explains how to initialize and manage your database tables.

## Quick Start

### Initialize Database Tables

Run the database initialization script to create all tables if they don't exist:

```bash
npm run db:init
```

This script will:

- ✅ Create all database tables if they don't exist
- ✅ Run Drizzle migrations automatically
- ✅ Verify all tables are created successfully
- ✅ Can be run multiple times safely (idempotent)

## Available Database Commands

### `npm run db:init`

Initializes the database by creating all tables. Uses migrations if available, otherwise creates tables manually.

### `npm run db:migrate`

Runs Drizzle migrations from the `drizzle/` folder.

### `npm run db:push`

Push schema changes directly to the database (useful for development).

### `npm run db:studio`

Opens Drizzle Studio - a web-based database browser and editor.

## Prerequisites

Make sure you have:

1. A MySQL database created
2. `DATABASE_URL` environment variable set in your `.env` file

Example `.env` file:

```env
DATABASE_URL=mysql://username:password@localhost:3306/database_name
```

## Database Tables

The initialization script creates the following tables in order:

### Core Tables

- `users` - User accounts
- `email_verification_tokens` - Email verification tokens
- `password_reset_tokens` - Password reset tokens

### API Management

- `api_clients` - API client applications
- `api_keys` - API keys for authentication
- `api_key_permissions` - Permissions for API keys
- `api_key_usage` - API key usage logs

### Alumni System

- `alumni_profiles` - Alumni profile information
- `degrees` - Academic degrees
- `certifications` - Professional certifications
- `licenses` - Professional licenses
- `professional_courses` - Professional courses
- `employment_history` - Work history
- `alumni_event_participation` - Event participation tracking

### Bidding & Sponsorship

- `bids` - Bidding system for feature days
- `feature_days` - Featured alumni days
- `sponsors` - Sponsor information
- `sponsorship_offers` - Sponsorship offers

## Troubleshooting

### Connection Issues

If you see connection errors, verify:

- Database server is running
- `DATABASE_URL` is correctly set
- Database credentials are correct
- Database exists (create it if needed)

### Migration Issues

If migrations fail, the script will automatically fall back to manual table creation.

### Manual Database Creation

If you need to create the database manually:

```sql
CREATE DATABASE your_database_name;
```

## For Production

For production deployments:

1. Run migrations instead of manual table creation
2. Use proper database user with appropriate permissions
3. Backup your database before running migrations
4. Test migrations in staging environment first

## Migration Files

Migration files are stored in the `drizzle/` folder:

- `0000_clean_manta.sql` - Initial schema
- `0001_security_bidding_and_profiles.sql` - Security and bidding features
- `0002_add_performance_indexes.sql` - Performance indexes

To generate new migrations after schema changes:

```bash
drizzle-kit generate
```
