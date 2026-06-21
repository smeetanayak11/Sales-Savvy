
-- RLS policies for categories (admin only write, public read)
CREATE POLICY "Anyone can read categories"
ON public.categories FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Only admin can modify categories"
ON public.categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for products (admin only write, public read)
CREATE POLICY "Anyone can read products"
ON public.products FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Only admin can modify products"
ON public.products FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for carts (user owns their own)
CREATE POLICY "Users can manage own cart"
ON public.carts FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for cart_items (via cart ownership)
CREATE POLICY "Users can manage own cart items"
ON public.cart_items FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()
));

-- RLS policies for orders (user sees own, admin sees all)
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update order status"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for order_items (user via order, admin all)
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Users can insert own order items"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()
));

-- RLS policies for reviews (read public, write own)
CREATE POLICY "Anyone can read reviews"
ON public.reviews FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Users can manage own reviews"
ON public.reviews FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for wishlist (user owns their own)
CREATE POLICY "Users can manage own wishlist"
ON public.wishlist FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_roles (admin read, service_role write)
CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Revoke public execute on security definer functions
REVOKE EXECUTE ON FUNCTION public.has_role FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
