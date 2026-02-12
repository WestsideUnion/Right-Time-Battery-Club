-- Add info@righttimeinc.com as an admin to the default shop if not already present

DO $$
DECLARE
    v_user_id UUID;
    v_shop_id UUID;
BEGIN
    -- Get the user ID for info@righttimeinc.com
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'info@righttimeinc.com';

    -- Get the default shop ID
    SELECT id INTO v_shop_id FROM public.shops WHERE slug = 'right-time' LIMIT 1;

    -- If user and shop exist, insert into shop_members
    IF v_user_id IS NOT NULL AND v_shop_id IS NOT NULL THEN
        INSERT INTO public.shop_members (shop_id, user_id, role)
        VALUES (v_shop_id, v_user_id, 'admin')
        ON CONFLICT (shop_id, user_id) DO UPDATE SET role = 'admin';
    END IF;
END $$;
