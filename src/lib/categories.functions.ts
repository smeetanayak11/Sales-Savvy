import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import productsData from "@/data/products.json";

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const categories = Array.from(
    new Map(
      productsData.map((product) => [product.category_id, { id: product.category_id, category_name: product.category_name }])
    ).values()
  ).sort((a, b) => a.category_name.localeCompare(b.category_name));
  return { categories };
});

export const createCategory = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ categoryName: z.string().min(1).max(100) }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .insert({ category_name: data.categoryName })
      .select()
      .single();
    if (error) throw error;
    return { category };
  });

export const updateCategory = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ id: z.string().uuid(), categoryName: z.string().min(1).max(100) }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .update({ category_name: data.categoryName })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return { category };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });
