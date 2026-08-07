# Client Health — Algorithm Agency

Internal bi-weekly client health scoring tool for Algorithm Agency.

## Stack
- **Framework**: TanStack Start (SSR) on Vite 7
- **Deployment**: Vercel (via Nitro vercel preset)
- **Database / Auth**: Supabase (Postgres + Row-Level Security + Auth)
- **AI Agents**: Supabase Edge Functions calling Anthropic API (keys in Supabase Vault)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui (Radix primitives)
- **Routing**: TanStack Router (file-based, generated route tree)

## Environment Variables (set in Vercel)
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (anon/publishable key)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `VITE_SUPABASE_URL` (client-side duplicate for browser bundle)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (client-side duplicate)

## Project Structure
- `src/routes/` — TanStack file-based routes
- `src/lib/` — business logic, DB helpers, agent prompt builders
- `src/integrations/supabase/` — Supabase clients, auth middleware
- `src/components/` — React UI components (shadcn/ui + custom)
- `supabase/functions/` — Edge Functions (generate-questions, batch-analysis)
