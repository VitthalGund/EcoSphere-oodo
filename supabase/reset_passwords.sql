-- Reset passwords for all demo users to 'password123'
-- Run this in your Supabase SQL Editor

UPDATE auth.users 
SET 
    encrypted_password = crypt('password123', gen_salt('bf')),
    updated_at = now()
WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com');

-- Verify
SELECT email, 
       CASE WHEN encrypted_password IS NOT NULL THEN 'password set' ELSE 'NO PASSWORD' END as password_status
FROM auth.users
WHERE email IN ('priya@ecosphere.com', 'meera@ecosphere.com', 'raj@ecosphere.com');
