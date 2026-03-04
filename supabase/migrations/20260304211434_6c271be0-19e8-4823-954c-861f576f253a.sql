
-- Fix existing user ba739e30-a4c3-42ba-92ff-4ea3451fd54e (Тест Счетоводител)
INSERT INTO public.profiles (id, full_name, email)
VALUES ('ba739e30-a4c3-42ba-92ff-4ea3451fd54e', 'Тест Счетоводител', 'test.accountant.2026@mailinator.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('ba739e30-a4c3-42ba-92ff-4ea3451fd54e', 'accountant')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.accountant_profiles (user_id, display_name, specialization, bio, experience_years, is_approved)
VALUES ('ba739e30-a4c3-42ba-92ff-4ea3451fd54e', 'Тест Счетоводител', ARRAY['Пълно счетоводство', 'ДДС'], '', 0, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.auditor_directory (full_name, email, specialization, source, city)
VALUES ('Тест Счетоводител', 'test.accountant.2026@mailinator.com', ARRAY['Пълно счетоводство', 'ДДС'], 'platform', NULL);

-- Also fix the older accountant profile that has empty data
UPDATE public.accountant_profiles 
SET is_approved = true, display_name = COALESCE(display_name, 'Счетоводител')
WHERE is_approved = false AND user_id = '4a9ba23f-2668-4f84-8a32-e7f4d681b086';
