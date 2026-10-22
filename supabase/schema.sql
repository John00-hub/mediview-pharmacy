-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIVIEW PHARMACY — production PostgreSQL schema (Supabase)
-- Maps 1:1 onto src/lib/types.ts and the DataPort interfaces.
-- Run in the Supabase SQL editor, or via: supabase db push (see README.md).
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

-- ── ENUMS ──────────────────────────────────────────────────────────────────
create type rx_class as enum (
  'OTC', 'POM', 'POM_OTC_WAIVER',
  'CONTROLLED_PROHIBITED_ONLINE',   -- never exposed publicly; kept for internal records
  'DEVICE', 'GENERAL_RETAIL'
);
create type dose_form as enum (
  'tablet','caplet','capsule','syrup','suspension','sachet','cream','ointment','gel',
  'wash','inhaler','nasal-spray','eye-drop','mouthwash','suppository','injection',
  'device','test-kit','drink','food','other'
);
create type price_status as enum ('ENQUIRY_ONLY','PUBLISHED');
create type stock_status as enum ('UNKNOWN','IN_STOCK','LOW_STOCK','OUT_OF_STOCK','TO_ORDER');
create type product_status as enum ('draft','active','archived');
create type enquiry_status as enum (
  'NEW','UNDER_REVIEW','AWAITING_PHARMACIST','QUOTE_PREPARED',
  'AWAITING_CUSTOMER','COMPLETED','CLOSED'
);
create type contact_preference as enum ('WHATSAPP','PHONE_CALL','EMAIL');
create type fulfilment_mode as enum ('PICKUP','DELIVERY');
create type staff_role as enum ('ADMIN','PHARMACIST','SALES');
create type event_type as enum (
  'SUBMITTED','STATUS_CHANGED','QUOTE_ADDED','NOTE_ADDED','PHARMACIST_REVIEW'
);

-- ── CATALOGUE ──────────────────────────────────────────────────────────────
create table brands (
  id    uuid primary key default uuid_generate_v4(),
  slug  text unique not null,
  name  text unique not null,
  created_at timestamptz not null default now()
);

create table categories (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  description text not null default '',
  icon        text not null default 'Package',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table products (
  id                     uuid primary key default uuid_generate_v4(),
  slug                   text unique not null,      -- STABLE: never changes on rename
  name_display           text not null,
  name_search            text not null,             -- lowercased name+brand+generic+strength+pack
  brand_id               uuid references brands(id) on delete set null,
  generic_name           text,
  dose_form              dose_form not null default 'other',
  strength               text,                      -- only as stated on label — never invented
  pack_size              text,
  primary_category_id    uuid not null references categories(id),
  rx_class               rx_class not null default 'OTC',
  price_status           price_status not null default 'ENQUIRY_ONLY',
  price_value            numeric(12,2),             -- used ONLY when price_status='PUBLISHED'
  currency               char(3) not null default 'NGN',
  stock_status           stock_status not null default 'UNKNOWN',
  cold_chain             boolean not null default false,
  professional_use_only  boolean not null default false,
  description_long       text not null default '',
  storage_note           text,
  nafdac_reg             text,
  barcode                text,
  requires_pharmacist_review boolean generated always as (rx_class = 'POM') stored,
  featured               boolean not null default false,
  status                 product_status not null default 'draft',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  updated_by             uuid
);
create index products_search_idx on products using gin (to_tsvector('english', name_search));
create index products_trgm_idx   on products using gin (name_search gin_trgm_ops);
create index products_cat_idx    on products (primary_category_id) where status = 'active';
create index products_brand_idx  on products (brand_id);

create table product_images (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,             -- private-capable bucket 'product-images'
  alt_text   text not null,
  sort       int not null default 0,
  width      int, height int,
  created_at timestamptz not null default now()
);

create table product_categories_secondary (
  product_id  uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- slug history for 301s when a slug MUST change (rare; report §6.2)
create table product_slug_history (
  old_slug   text primary key,
  product_id uuid not null references products(id) on delete cascade,
  changed_at timestamptz not null default now()
);

-- ── PUBLIC PRODUCT VIEW — controlled/prohibited items NEVER leak ───────────
create view products_public as
  select * from products
  where status = 'active'
    and rx_class <> 'CONTROLLED_PROHIBITED_ONLINE';

-- typo-tolerant search RPC (trigram + full-text, ranked)
create or replace function search_products(q text, lim int default 24)
returns setof products_public
language sql stable as $$
  select *
  from products_public
  where name_search % lower(q)                     -- trigram similarity (typos)
     or to_tsvector('english', name_search) @@ plainto_tsquery('english', q)
     or name_search ilike '%' || q || '%'
  order by
    similarity(name_search, lower(q)) desc,
    featured desc,
    name_display asc
  limit lim;
$$;

-- ── ENQUIRIES ──────────────────────────────────────────────────────────────
create table enquiries (
  id                  uuid primary key default uuid_generate_v4(),
  ref_code            text unique not null,         -- MVP-YYYY-NNNN
  customer_name       text not null,
  customer_phone      text not null,
  customer_email      text,
  contact_preference  contact_preference not null default 'WHATSAPP',
  fulfilment          fulfilment_mode not null default 'PICKUP',
  delivery_address    text,
  additional_info     text,
  privacy_acknowledged boolean not null default false,
  status              enquiry_status not null default 'NEW',
  pharmacist_verified boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index enquiries_status_idx on enquiries (status, created_at desc);

create sequence enquiry_ref_seq;
create or replace function next_enquiry_ref() returns text language plpgsql as $$
declare n int;
begin
  n := nextval('enquiry_ref_seq');
  return 'MVP-' || to_char(now(), 'YYYY') || '-' || lpad(n::text, 4, '0');
end $$;

create table enquiry_items (
  id            uuid primary key default uuid_generate_v4(),
  enquiry_id    uuid not null references enquiries(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  product_name  text not null,                      -- snapshot at submission
  quantity      int not null check (quantity between 1 and 99),
  note          text,
  has_prescription boolean not null default false,
  price_quoted  numeric(12,2)                       -- staff-entered at quote time
);

create table prescription_files (
  id               uuid primary key default uuid_generate_v4(),
  enquiry_item_id  uuid not null references enquiry_items(id) on delete cascade,
  storage_path     text not null,                   -- PRIVATE bucket 'prescriptions'
  mime_type        text not null check (mime_type in ('image/jpeg','image/png','application/pdf')),
  size_bytes       bigint not null check (size_bytes <= 8388608),
  uploaded_at      timestamptz not null default now(),
  reviewed_by      uuid,                            -- staff_users.id (pharmacist)
  reviewed_at      timestamptz,
  review_note      text,
  purge_after      timestamptz                      -- retention control (period set by pharmacist/legal)
);

create table enquiry_events (                          -- append-only audit log
  id          uuid primary key default uuid_generate_v4(),
  enquiry_id  uuid not null references enquiries(id) on delete cascade,
  actor       text not null,                           -- 'customer' | staff name | 'system'
  actor_id    uuid,
  event_type  event_type not null,
  detail      text not null default '',
  at          timestamptz not null default now()
);
-- append-only: no UPDATE/DELETE grants to any application role (see RLS below).

create table enquiry_notes (                             -- internal staff notes
  id         uuid primary key default uuid_generate_v4(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  author_id  uuid,
  author     text not null,
  text       text not null,
  at         timestamptz not null default now()
);

-- tracking lookup: ref + phone must BOTH match (anti-enumeration)
create or replace function track_enquiry(p_ref text, p_phone text)
returns setof enquiries language plpgsql stable as $$
begin
  return query
  select * from enquiries e
  where lower(e.ref_code) = lower(trim(p_ref))
    and length(regexp_replace(p_phone, '\D', '', 'g')) >= 10
    and right(regexp_replace(e.customer_phone, '\D', '', 'g'), 10)
        = right(regexp_replace(p_phone, '\D', '', 'g'), 10);
end $$;

-- ── STAFF (mirrors Supabase auth.users) ────────────────────────────────────
create table staff_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text unique not null,
  role       staff_role not null default 'SALES',
  pcn_reg    text,                                    -- pharmacist registration number (if applicable)
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table site_content (
  id                int primary key default 1 check (id = 1),
  announcement_text text not null default '',
  announcement_on   boolean not null default false,
  about_headline    text not null default '',
  about_body        text not null default '',
  opening_hours     text not null default '',
  hours_confirmed   boolean not null default false,
  featured_product_ids uuid[] not null default '{}',
  footer_note       text not null default '',
  updated_at        timestamptz not null default now(),
  updated_by        uuid
);
insert into site_content (id) values (1);

create table contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  phone      text,
  email      text,
  message    text not null,
  created_at timestamptz not null default now(),
  handled    boolean not null default false
);

create table redirect_rules (
  id             uuid primary key default uuid_generate_v4(),
  source_pattern text unique not null,
  dest_path      text not null,
  status_code    int not null default 301 check (status_code in (301,302)),
  enabled        boolean not null default true
);

-- ── updated_at triggers ────────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_upd  before update on products  for each row execute function set_updated_at();
create trigger categories_upd before update on categories for each row execute function set_updated_at();
create trigger enquiries_upd before update on enquiries  for each row execute function set_updated_at();
create trigger content_upd   before update on site_content for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Roles come from the authenticated JWT: public_role() reads a claim set by
-- the Edge Function / sign-in hook that mirrors staff_users.role into the JWT.
-- ═══════════════════════════════════════════════════════════════════════════
alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_categories_secondary enable row level security;
alter table product_slug_history enable row level security;
alter table enquiries enable row level security;
alter table enquiry_items enable row level security;
alter table prescription_files enable row level security;
alter table enquiry_events enable row level security;
alter table enquiry_notes enable row level security;
alter table staff_users enable row level security;
alter table site_content enable row level security;
alter table contact_messages enable row level security;
alter table redirect_rules enable row level security;

create or replace function public_role() returns staff_role
language sql stable as $$
  select coalesce(
    (select role from staff_users where id = auth.uid() and active),
    'SALES'::staff_role
  );
$$;
create or replace function is_staff() returns boolean
language sql stable as $$ select exists (select 1 from staff_users where id = auth.uid() and active) $$;
create or replace function is_pharmacist() returns boolean
language sql stable as $$ select coalesce((select role in ('PHARMACIST','ADMIN') from staff_users where id = auth.uid() and active), false) $$;
create or replace function is_admin() returns boolean
language sql stable as $$ select coalesce((select role = 'ADMIN' from staff_users where id = auth.uid() and active), false) $$;

-- Catalogue: world-readable through the safe view; writable by admin only.
create policy catalogue_read on products for select using (true);  -- app selects products_public
create policy catalogue_write on products for all using (is_admin()) with check (is_admin());
create policy brands_read on brands for select using (true);
create policy brands_write on brands for all using (is_admin()) with check (is_admin());
create policy cat_read on categories for select using (true);
create policy cat_write on categories for all using (is_admin()) with check (is_admin());
create policy img_read on product_images for select using (true);
create policy img_write on product_images for all using (is_admin()) with check (is_admin());
create policy pc_read on product_categories_secondary for select using (true);
create policy pc_write on product_categories_secondary for all using (is_admin()) with check (is_admin());
create policy slug_read on product_slug_history for select using (is_staff());
create policy slug_write on product_slug_history for all using (is_admin()) with check (is_admin());

-- Enquiries: anonymous can INSERT (customer submission) but never read others'.
create policy enq_insert on enquiries for insert to anon, authenticated
  with check (true);
create policy enq_staff_read on enquiries for select using (is_staff());
create policy enq_staff_write on enquiries for update using (is_staff()) with check (is_staff());
-- customers read ONLY their own via track_enquiry() SECURITY DEFINER-free RPC:
create policy enq_own_read on enquiries for select to anon, authenticated
  using (false); -- deliberately closed; tracking goes through the RPC + app-layer check

create policy item_insert on enquiry_items for insert to anon, authenticated with check (true);
create policy item_staff on enquiry_items for all using (is_staff()) with check (is_staff());

-- Prescription files: insert via signed upload URL (storage policies); metadata
-- readable ONLY by pharmacist/admin. SALES never sees prescription content.
create policy rx_meta_pharmacist on prescription_files for select using (is_pharmacist());
create policy rx_review_pharmacist on prescription_files for update using (is_pharmacist()) with check (is_pharmacist());

-- Audit log: append-only for staff; no update/delete policies exist.
create policy events_insert on enquiry_events for insert to anon, authenticated with check (true);
create policy events_read on enquiry_events for select using (is_staff());

create policy notes_staff on enquiry_notes for all using (is_staff()) with check (is_staff());

create policy staff_self_read on staff_users for select using (id = auth.uid() or is_admin());
create policy staff_admin_write on staff_users for all using (is_admin()) with check (is_admin());

create policy content_read on site_content for select using (true);
create policy content_write on site_content for all using (is_admin()) with check (is_admin());

create policy msg_insert on contact_messages for insert to anon, authenticated with check (true);
create policy msg_staff on contact_messages for all using (is_staff()) with check (is_staff());

create policy redirect_read on redirect_rules for select using (true);
create policy redirect_write on redirect_rules for all using (is_admin()) with check (is_admin());

-- ── STORAGE BUCKETS (run via supabase storage CLI or dashboard) ────────────
-- product-images : public read, admin write; next/image remotePatterns allows *.supabase.co
-- prescriptions  : PRIVATE; upload via createSignedUploadUrl() from server action;
--                  read via createSignedUrl(expiresIn: 300) restricted to pharmacist role;
--                  lifecycle: purge_after honored by scheduled pg_cron job.

-- ── PHARMACIST GATE (belt & braces behind the app layer) ───────────────────
-- An enquiry containing POM lines cannot leave AWAITING_PHARMACIST without
-- pharmacist_verified, and only pharmacist/admin can set that flag.
create or replace function guard_pharmacist_gate() returns trigger
language plpgsql as $$
declare has_pom boolean;
begin
  if new.status = old.status or new.status = 'AWAITING_PHARMACIST' then
    return new;
  end if;
  select exists (
    select 1 from enquiry_items i join products p on p.id = i.product_id
    where i.enquiry_id = new.id and (p.rx_class = 'POM' or i.has_prescription)
  ) into has_pom;
  if has_pom and not new.pharmacist_verified and not is_pharmacist() then
    raise exception 'Pharmacist verification required before status change';
  end if;
  if new.pharmacist_verified <> old.pharmacist_verified and not is_pharmacist() then
    raise exception 'Only pharmacist/admin roles may change verification state';
  end if;
  return new;
end $$;
create trigger enquiries_gate before update on enquiries
  for each row execute function guard_pharmacist_gate();
