-- Backfill display_name for existing customers using auth.users metadata
UPDATE customers
SET display_name = COALESCE(
    (auth.users.raw_user_meta_data->>'full_name'),
    (auth.users.raw_user_meta_data->>'name'),
    (auth.users.raw_user_meta_data->>'u_name')
)
FROM auth.users
WHERE customers.auth_user_id = auth.users.id
  AND (customers.display_name IS NULL OR customers.display_name = '');
