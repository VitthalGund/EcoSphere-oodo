-- =========================================================================
-- NUCLEAR RESET SCRIPT
-- This directly cleans up everything via SQL, bypassing GoTrue entirely.
-- Run this in Supabase SQL Editor as postgres role.
-- =========================================================================

-- Step 1: Temporarily drop the trigger so it can't interfere with cleanup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Clean up all public schema data referencing these users
DELETE FROM public.challenge_participations 
WHERE employee_id IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'))
   OR approved_by IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM public.employee_participations 
WHERE employee_id IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'))
   OR approved_by IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM public.policy_acknowledgements 
WHERE employee_id IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM public.carbon_transactions 
WHERE created_by IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM public.challenges 
WHERE created_by IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM public.reward_redemptions
WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM public.user_badges
WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM public.compliance_issues
WHERE owner_id IN (SELECT id FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM public.users 
WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com');

-- Step 3: Clean up auth schema data
DELETE FROM auth.refresh_tokens 
WHERE user_id::text IN (SELECT id::text FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM auth.mfa_factors 
WHERE user_id::text IN (SELECT id::text FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM auth.sessions 
WHERE user_id::text IN (SELECT id::text FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

DELETE FROM auth.identities 
WHERE user_id::text IN (SELECT id::text FROM auth.users WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com'));

-- Step 4: Delete the auth users themselves
DELETE FROM auth.users 
WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com');

-- Step 5: Reinstall a clean, bulletproof trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_dept_id UUID;
    v_role TEXT;
    v_name TEXT;
BEGIN
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'employee');
    v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    v_dept_id := NULL;

    BEGIN
        IF new.raw_user_meta_data->>'department_id' IS NOT NULL 
           AND new.raw_user_meta_data->>'department_id' != '' THEN
            v_dept_id := (new.raw_user_meta_data->>'department_id')::UUID;
            IF NOT EXISTS (SELECT 1 FROM public.departments WHERE id = v_dept_id) THEN
                v_dept_id := NULL;
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_dept_id := NULL;
    END;

    INSERT INTO public.users (id, name, email, role, department_id, xp, level, points_balance, avatar_url)
    VALUES (new.id, v_name, new.email, v_role, v_dept_id, 0, 1, 0, new.raw_user_meta_data->>'avatar_url')
    ON CONFLICT (id) DO UPDATE SET
        name        = EXCLUDED.name,
        email       = EXCLUDED.email,
        role        = EXCLUDED.role,
        department_id = COALESCE(EXCLUDED.department_id, public.users.department_id),
        avatar_url  = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Never let a trigger failure block auth
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify users are gone
SELECT COUNT(*) as remaining_users 
FROM auth.users 
WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com');
