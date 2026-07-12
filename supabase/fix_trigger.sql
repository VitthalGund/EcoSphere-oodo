-- =========================================================================
-- MASTER FIX SCRIPT
-- Run this in Supabase SQL Editor to fix all login issues
-- =========================================================================

-- Step 1: Fix the handle_new_user trigger to be safe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_dept_id UUID;
    v_role TEXT;
    v_name TEXT;
    v_dept_exists BOOLEAN;
BEGIN
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'employee');
    v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    v_dept_id := NULL;

    BEGIN
        IF new.raw_user_meta_data->>'department_id' IS NOT NULL 
           AND new.raw_user_meta_data->>'department_id' != '' THEN
            v_dept_id := (new.raw_user_meta_data->>'department_id')::UUID;
            SELECT EXISTS(SELECT 1 FROM public.departments WHERE id = v_dept_id) INTO v_dept_exists;
            IF NOT v_dept_exists THEN
                v_dept_id := NULL;
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_dept_id := NULL;
    END;

    INSERT INTO public.users (id, name, email, role, department_id, xp, level, points_balance, avatar_url)
    VALUES (new.id, v_name, new.email, v_role, v_dept_id, 0, 1, 0, new.raw_user_meta_data->>'avatar_url')
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        department_id = COALESCE(EXCLUDED.department_id, public.users.department_id),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 2: Insert missing auth.identities so GoTrue can authenticate the existing users
-- This is the key fix for "Database error finding user"
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
SELECT
    u.id::text,
    u.id,
    jsonb_build_object('sub', u.id::text, 'email', u.email),
    'email',
    u.created_at,
    u.updated_at,
    now()
FROM auth.users u
WHERE u.email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com')
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i 
    WHERE i.user_id = u.id AND i.provider = 'email'
  );

-- Step 3: Ensure public.users profiles exist for all auth users
INSERT INTO public.users (id, name, email, role, department_id, xp, level, points_balance)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    u.email,
    COALESCE(u.raw_user_meta_data->>'role', 'employee'),
    CASE 
        WHEN u.email = 'priya@ecosphere.com' THEN 'd1111111-1111-1111-1111-111111111111'::uuid
        WHEN u.email = 'meera@ecosphere.com' THEN 'd2222222-2222-2222-2222-222222222222'::uuid
        WHEN u.email = 'raj@ecosphere.com'   THEN 'd4444444-4444-4444-4444-444444444444'::uuid
        ELSE NULL
    END,
    0, 1, 0
FROM auth.users u
WHERE u.email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department_id = COALESCE(EXCLUDED.department_id, public.users.department_id);

-- Verify everything looks correct
SELECT 
    u.email,
    u.id,
    EXISTS(SELECT 1 FROM auth.identities i WHERE i.user_id = u.id) as has_identity,
    EXISTS(SELECT 1 FROM public.users pu WHERE pu.id = u.id) as has_profile
FROM auth.users u
WHERE u.email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com');
