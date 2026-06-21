DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Authenticated can read reviews" ON public.reviews FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.reviews FROM anon;

CREATE POLICY "No client inserts on user_roles" ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No client updates on user_roles" ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on user_roles" ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email) VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  INSERT INTO public.carts (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;