import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1), price: z.number().positive() })) }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: userId, total_amount: total })
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    // Clear cart
    const { data: cart } = await supabase.from("carts").select("id").eq("user_id", userId).single();
    if (cart) {
      await supabase.from("cart_items").delete().eq("cart_id", cart.id);
    }

    return { order };
  });

export const getOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(name, image_url))")
      .eq("user_id", userId)
      .order("order_date", { ascending: false });
    if (error) throw error;
    return { orders: orders ?? [] };
  });

export const getOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(name, image_url))")
      .eq("id", data.id)
      .single();
    if (error) throw error;
    if (order.user_id !== userId) throw new Error("Unauthorized");
    return { order };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ id: z.string().uuid(), status: z.string() }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, profiles(name, email), order_items(*, products(name))")
      .order("order_date", { ascending: false });
    if (error) throw error;
    return { orders: orders ?? [] };
  });
