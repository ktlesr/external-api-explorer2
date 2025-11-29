-- Auth için kullanıcılar zaten auth.users tablosunda
-- Ekstra bir şey yapmanıza gerek yok

-- Eğer kullanıcı oluşturmak isterseniz, Supabase Dashboard'dan
-- Authentication > Users > Add User yapabilirsiniz

-- Veya SQL ile:
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
-- VALUES ('admin@example.com', crypt('your-password', gen_salt('bf')), now());
