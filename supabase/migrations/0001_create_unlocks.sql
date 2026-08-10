-- Paid Stripe Checkout sessions.
--
-- This table is written and read ONLY by the server, using the Supabase secret
-- key, from src/app/api/unlock/route.ts. The browser never talks to it.
--
-- Deliberately minimal: no email, no name, no customer record, nothing about
-- anyone's photos. The Stripe session id is the receipt; Stripe already holds
-- the payment details and is welcome to keep them.

create table if not exists public.unlocks (
  stripe_session_id     text        primary key,
  stripe_payment_intent text,
  amount_total          integer     not null,
  currency              text        not null,
  created_at            timestamptz not null default now(),
  last_redeemed_at      timestamptz not null default now(),
  redemption_count      integer     not null default 1
);

comment on table public.unlocks is
  'One row per paid Stripe Checkout session. Server-only, via the secret key. Contains no personal data and no photo data.';

comment on column public.unlocks.redemption_count is
  'How many times this session id has been presented. A number climbing well past 1 means the id is being shared around.';

-- Since April 2026 new tables are not automatically exposed to the Data API,
-- so the default state is already closed. These statements make that explicit
-- and survive anyone flipping the project-level auto-expose setting back on.
alter table public.unlocks enable row level security;

revoke all on public.unlocks from anon, authenticated;

-- No policies are created on purpose. With RLS on and zero policies, the anon
-- and authenticated roles are denied every row even if a GRANT reappears
-- later. service_role carries BYPASSRLS, which is how the API route reaches it.
grant select, insert, update on public.unlocks to service_role;
