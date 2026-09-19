-- ПОЛНАЯ СХЕМА БАЗЫ, версия 2 — устойчива к тому, что часть таблиц
-- уже существует в старом виде (без нужных столбцов).
-- Порядок: сначала создаём таблицы (если их вообще нет), затем
-- добавляем каждый недостающий столбец по отдельности, и только
-- в самом конце — индексы. Безопасно выполнять повторно.

-- ---------- таблицы (если совсем не существуют) ----------
create table if not exists businesses (id bigserial primary key);
create table if not exists gifts (id bigserial primary key);
create table if not exists users (id bigserial primary key);
create table if not exists winners (id bigserial primary key);
create table if not exists admins (id bigserial primary key);
create table if not exists invites (id bigserial primary key);

-- ---------- businesses ----------
alter table businesses add column if not exists name text;
alter table businesses add column if not exists slug text;
alter table businesses add column if not exists logo_url text;
alter table businesses add column if not exists primary_color text default '#39ff8a';
alter table businesses add column if not exists design_theme text default 'neon_gaming';
alter table businesses add column if not exists description text;
alter table businesses add column if not exists custom_domain text;
alter table businesses add column if not exists created_at timestamptz default now();

-- ---------- gifts ----------
alter table gifts add column if not exists business_id bigint references businesses(id);
alter table gifts add column if not exists name text;
alter table gifts add column if not exists chance numeric default 10;
alter table gifts add column if not exists icon text default 'star';
alter table gifts add column if not exists rarity text default 'rare';
alter table gifts add column if not exists active boolean default true;
alter table gifts add column if not exists created_at timestamptz default now();

-- ---------- users ----------
alter table users add column if not exists telegram_id bigint;
alter table users add column if not exists business_id bigint references businesses(id);
alter table users add column if not exists first_name text;
alter table users add column if not exists username text;
alter table users add column if not exists bonus_attempts integer default 0;
alter table users add column if not exists referred_by bigint;
alter table users add column if not exists last_spin_at timestamptz;
alter table users add column if not exists winback_sent_at timestamptz;
alter table users add column if not exists created_at timestamptz default now();

-- ---------- winners ----------
alter table winners add column if not exists business_id bigint references businesses(id);
alter table winners add column if not exists telegram_id bigint;
alter table winners add column if not exists gift_id bigint references gifts(id);
alter table winners add column if not exists gift_name text;
alter table winners add column if not exists code text;
alter table winners add column if not exists redeemed boolean default false;
alter table winners add column if not exists redeemed_at timestamptz;
alter table winners add column if not exists expires_at timestamptz;
alter table winners add column if not exists reminded boolean default false;
alter table winners add column if not exists created_at timestamptz default now();

-- ---------- admins ----------
alter table admins add column if not exists business_id bigint references businesses(id);
alter table admins add column if not exists telegram_id bigint;
alter table admins add column if not exists role text;
alter table admins add column if not exists added_at timestamptz default now();

-- ---------- invites ----------
alter table invites add column if not exists business_id bigint references businesses(id);
alter table invites add column if not exists role text;
alter table invites add column if not exists code text;
alter table invites add column if not exists created_at timestamptz default now();
alter table invites add column if not exists used_by bigint;
alter table invites add column if not exists used_at timestamptz;

-- ---------- индексы (теперь все нужные столбцы точно есть) ----------
create unique index if not exists businesses_slug_idx on businesses (lower(slug));
create unique index if not exists businesses_domain_idx on businesses (lower(custom_domain)) where custom_domain is not null;

create index if not exists gifts_business_idx on gifts (business_id);

create unique index if not exists users_telegram_business_idx on users (telegram_id, business_id);
create index if not exists users_username_business_idx on users (lower(username), business_id);

create unique index if not exists winners_code_idx on winners (code);
create index if not exists winners_business_idx on winners (business_id);

create unique index if not exists admins_business_telegram_idx on admins (business_id, telegram_id);
create index if not exists admins_telegram_idx on admins (telegram_id);

create unique index if not exists invites_code_idx on invites (code);

NOTIFY pgrst, 'reload schema';
