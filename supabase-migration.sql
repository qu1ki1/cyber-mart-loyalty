-- Run once in Supabase SQL editor.
-- Adds the columns api/spin.js and api/redeem.js rely on.

alter table gifts   add column if not exists rarity   text default 'rare';
alter table gifts   add column if not exists icon     text default 'star';

alter table winners add column if not exists code        text;
alter table winners add column if not exists redeemed     boolean default false;
alter table winners add column if not exists redeemed_at  timestamptz;

create unique index if not exists winners_code_idx on winners (code);

-- Set a rarity per existing gift (edit to match your actual gift names):
-- update gifts set rarity = 'common'    where name = '+30 минут игры';
-- update gifts set rarity = 'uncommon'  where name = '+1 час игры';
-- update gifts set rarity = 'rare'      where name = 'Бесплатный напиток';
-- update gifts set rarity = 'epic'      where name = 'Скидка 10%';
-- update gifts set rarity = 'legendary' where name = 'Джекпот';

-- Strongly recommended once the new endpoints are live: lock the tables down
-- so the browser can no longer write to them directly with the anon key.
-- alter table gifts   enable row level security;
-- alter table winners enable row level security;
-- alter table users   enable row level security;
-- (writes now only happen via api/spin.js and api/redeem.js, which use the
--  service_role key and therefore bypass RLS entirely)
-- Выполнить в Supabase → SQL Editor.

-- Бонусные попытки, которые вручную выдал администратор.
alter table users add column if not exists bonus_attempts integer default 0;

-- Срок действия кода (14 дней с момента выигрыша).
alter table winners add column if not exists expires_at timestamptz;

-- Быстрый поиск гостя по username при выдаче попытки.
create index if not exists users_username_idx on users (lower(username));

-- Призы больше не ограничены по количеству — поле quantity можно оставить
-- в таблице (не мешает), но код его больше не читает и не уменьшает.
-- Если хочешь физически убрать столбец:
-- alter table gifts drop column if exists quantity;

-- Допустимые значения gifts.icon (иначе иконка не отрисуется):
--   clock, clockBig, cup, percent, star
-- Пример:
-- update gifts set icon = 'clock'    where name = '+30 минут игры';
-- update gifts set icon = 'clockBig' where name = '+1 час игры';
-- update gifts set icon = 'cup'      where name = 'Бесплатный напиток';
-- update gifts set icon = 'percent'  where name = 'Скидка 10%';
-- update gifts set icon = 'star'     where name = 'Джекпот';
