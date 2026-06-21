import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import productsData from "@/data/products.json";

function mapProduct(product: any) {
  return {
    ...product,
    categories: { category_name: product.category_name },
  };
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  return { products: productsData.map(mapProduct) };
});

export const searchProducts = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ query: z.string().optional(), categoryId: z.string().uuid().optional() }).parse(data)
  )
  .handler(async ({ data }) => {
    const query = data.query?.trim().toLowerCase();
    const products = productsData
      .filter((product) => {
        const matchesQuery = query
          ? product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
          : true;
        const matchesCategory = data.categoryId ? product.category_id === data.categoryId : true;
        return matchesQuery && matchesCategory;
      })
      .map(mapProduct);
    return { products };
  });

export const getProduct = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const product = productsData.find((product) => product.id === data.id);
    return { product: product ? mapProduct(product) : null };
  });

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      name: z.string().min(1).max(200),
      description: z.string().optional(),
      price: z.number().positive(),
      stock: z.number().int().min(0),
      categoryId: z.string().uuid().optional(),
      imageUrl: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert({
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category_id: data.categoryId,
        image_url: data.imageUrl,
      })
      .select()
      .single();
    if (error) throw error;
    return { product };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      stock: z.number().int().min(0).optional(),
      categoryId: z.string().uuid().optional().nullable(),
      imageUrl: z.string().optional().nullable(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update({
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category_id: data.categoryId,
        image_url: data.imageUrl,
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return { product };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });
