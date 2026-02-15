-- Function to handle name sync from auth metadata to customers table
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.customers
  SET display_name = COALESCE(
    (new.raw_user_meta_data->>'full_name'),
    (new.raw_user_meta_data->>'name'),
    (new.raw_user_meta_data->>'u_name'),
    (new.raw_user_meta_data->>'displayName'),
    display_name
  )
  WHERE auth_user_id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

-- Backfill existing customers who are missing a display_name
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
