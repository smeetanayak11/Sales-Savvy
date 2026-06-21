import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: users } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true });
    const { data: products } = await supabaseAdmin.from("products").select("id", { count: "exact", head: true });
    const { data: orders } = await supabaseAdmin.from("orders").select("id", { count: "exact", head: true });
    const { data: revenue } = await supabaseAdmin.from("orders").select("total_amount");

    const totalRevenue = (revenue ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

    return {
      totalUsers: users?.length ?? 0,
      totalProducts: products?.length ?? 0,
      totalOrders: orders?.length ?? 0,
      totalRevenue,
    };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select("*, user_roles(role)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { users: users ?? [] };
  });

export const updateOrderStatusAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ id: z.string().uuid(), status: z.string() }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { error } = await supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });
