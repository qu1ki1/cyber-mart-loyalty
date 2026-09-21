-- ПОЛНЫЙ СБРОС ДАННЫХ — удаляет ВСЕ бизнесы, входы, призы, гостей,
-- выигрыши и приглашения. Структура таблиц (столбцы) остаётся —
-- значит после этого supabase-schema.sql заново гонять не нужно.
--
-- ВНИМАНИЕ: необратимо. Выполняй, только если точно хочешь начать с нуля.

truncate table winners restart identity cascade;
truncate table invites restart identity cascade;
truncate table admins restart identity cascade;
truncate table gifts restart identity cascade;
truncate table users restart identity cascade;
truncate table businesses restart identity cascade;

NOTIFY pgrst, 'reload schema';
