-- Buat user admin langsung via SQL
-- Jalankan di Supabase SQL Editor

-- 1. Buat user di auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'bowo@gmail.com',
  crypt('bowo321@', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- 2. Buat identity
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'bowo@gmail.com'),
  jsonb_build_object(
    'sub', (SELECT id::text FROM auth.users WHERE email = 'bowo@gmail.com'),
    'email', 'bowo@gmail.com'
  ),
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- 3. Buat approval langsung approved
INSERT INTO user_approvals (
  user_id,
  approved
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'bowo@gmail.com'),
  TRUE
);
