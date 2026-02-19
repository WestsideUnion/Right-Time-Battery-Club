-- Fix: also sync name when a new auth.users row is INSERTED (brand-new Google OAuth signups)
-- Root cause: previous trigger only fired on UPDATE of raw_user_meta_data,
-- which misses users who sign up for the very first time via Google OAuth.
-- The INSERT into auth.users happens *before* the OAuth metadata is written,
-- so the AFTER INSERT trigger here catches the metadata write (which is an UPDATE
-- to the newly created row), ensuring the name is always synced.

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_upserted ON auth.users;

CREATE TRIGGER on_auth_user_upserted
  AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

-- Final backfill: catch any users still missing a display_name
UPDATE public.customers c
SET display_name = COALESCE(
    (u.raw_user_meta_data->>'full_name'),
    (u.raw_user_meta_data->>'name'),
    (u.raw_user_meta_data->>'u_name'),
    (u.raw_user_meta_data->>'displayName')
)
FROM auth.users u
WHERE c.auth_user_id = u.id
AND (c.display_name IS NULL OR c.display_name = '');
