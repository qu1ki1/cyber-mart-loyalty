-- Этап 1: мультитенантность.
-- Выполнить в Supabase → SQL Editor.

-- У каждого бизнеса теперь есть свой slug (используется в QR/deep-link
-- бота: t.me/<bot>?start=<slug>), бренд-настройки и пароль владельца.
alter table businesses add column if not exists slug text;
alter table businesses add column if not exists logo_url text;
alter table businesses add column if not exists primary_color text default '#39ff8a';
alter table businesses add column if not exists design_theme text default 'neon_gaming';
alter table businesses add column if not exists owner_password text;
alter table businesses add column if not exists description text;
alter table businesses add column if not exists created_at timestamptz default now();

create unique index if not exists businesses_slug_idx on businesses (lower(slug));

-- Присваиваем существующему (единственному пока) бизнесу slug и пароль,
-- чтобы старые данные не потерялись. ЗАМЕНИ пароль на свой после выполнения.
update businesses
set slug = coalesce(slug, 'cyber-mart'),
    owner_password = coalesce(owner_password, 'change-me-2026')
where slug is null;

-- Гости теперь привязаны к конкретному бизнесу, а не глобально —
-- один и тот же Telegram-пользователь может играть в разных заведениях
-- независимо (свои попытки, свои призы в каждом).
alter table users add column if not exists business_id integer references businesses(id);

-- Проставляем business_id всем существующим пользователям на единственный бизнес.
update users set business_id = (select id from businesses limit 1) where business_id is null;

alter table users drop constraint if exists users_telegram_id_key;
create unique index if not exists users_telegram_business_idx on users (telegram_id, business_id);
create index if not exists users_username_business_idx on users (lower(username), business_id);

-- gifts.business_id и winners.business_id уже существовали в исходной схеме —
-- ничего менять не нужно, просто теперь они реально используются для
-- разделения данных между бизнесами (раньше был только один бизнес,
-- так что это не проверялось).
