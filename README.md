# Free eCommerce Template for Next.js - NextMerce

The free Next.js eCommerce template is a lite version of the NextMerce Next.js eCommerce boilerplate, designed to streamline the launch and management of your online store.

![NextMerce](https://github.com/user-attachments/assets/57155689-a756-4222-8af7-134e556acae2)

While NextMerce Pro features advanced functionalities, seamless integration, and customizable options, providing all the essential tools needed to build and expand your business, the lite version offers a basic Next.js template specifically crafted for eCommerce websites. Both versions ensure superior performance and flexibility, all powered by Next.js.

### NextMerce Free VS NextMerce Pro

| ✨ Features                   | 🎁 NextMerce Free | 🔥 NextMerce Pro             |
| ----------------------------- | ----------------- | ---------------------------- |
| Next.js Pages                 | Static            | Dynamic Boilerplate Template |
| Components                    | Limited           | All According to Demo        |
| eCommerce Functionality       | Included          | Included                     |
| Integrations (DB, Auth, etc.) | Not Included      | Included                     |
| Community Support             | Included          | Included                     |
| Premium Email Support         | Not Included      | Included                     |
| Lifetime Free Updates         | Included          | Included                     |

#### [🚀 Live Demo](https://demo.nextmerce.com/)

#### [🌐 Visit Website](https://nextmerce.com/)

## Supabase Integration (Products, Blogs, Categories, Orders, Auth)

This project is now wired to Supabase for:

- Catalog data: products, categories
- Content data: blogs, testimonials
- User data: profiles with role support (`admin`, `manager`, `customer`)
- Auth: email/password sign-up and sign-in
- User orders: scoped by logged-in user

### 1. Environment Variables

Use `.env.example` as a template:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

### 2. Apply Database Schema + Seed

Run these SQL files in your Supabase SQL editor in order:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

This creates tables, RLS policies, and a trigger that auto-creates `profiles` rows when users sign up.

### 3. Admin / Manager Role Assignment

New users default to `customer`. Promote specific users manually in SQL:

```sql
update public.profiles
set role = 'admin'
where email = 'owner@yourstore.com';
```

You can also set role to `manager`.

### 4. Vercel + Supabase Free Tier Connection Guidance

For Vercel deployment and Supabase free tier, prefer Supabase REST/Auth access via:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

Do not use direct Postgres connection from browser code.

- Direct DB URI (`postgresql://...`) is for server tools/migrations only.
- App runtime should use Supabase API keys via `@supabase/supabase-js`.

This avoids IPv4/network restrictions and is the recommended path for free-tier setups.

### 5. Security Notes

- Never commit real secrets (DB password, service role key).
- Rotate keys if they were ever shared publicly.
- Use publishable key in client code; keep service-role key server-only.
