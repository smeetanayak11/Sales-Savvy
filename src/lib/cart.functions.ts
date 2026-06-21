import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getCart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single();
    if (cartError) throw cartError;

    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("cart_id", cart.id);
    if (itemsError) throw itemsError;

    return { cartId: cart.id, items: items ?? [] };
  });

export const addToCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single();
    if (!cart) throw new Error("Cart not found");

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", data.productId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + data.quantity })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ cart_id: cart.id, product_id: data.productId, quantity: data.quantity });
      if (error) throw error;
    }
    return { success: true };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ itemId: z.string().uuid(), quantity: z.number().int().min(0) }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    if (data.quantity === 0) {
      const { error } = await supabase.from("cart_items").delete().eq("id", data.itemId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: data.quantity })
        .eq("id", data.itemId);
      if (error) throw error;
    }
    return { success: true };
  });

export const removeCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ itemId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("cart_items").delete().eq("id", data.itemId);
    if (error) throw error;
    return { success: true };
  });
