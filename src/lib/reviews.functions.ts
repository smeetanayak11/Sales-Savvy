import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listReviews = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ productId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*, profiles(name)")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { reviews: reviews ?? [] };
  });

export const createReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      productId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        user_id: userId,
        product_id: data.productId,
        rating: data.rating,
        comment: data.comment,
      })
      .select()
      .single();
    if (error) throw error;
    return { review };
  });

export const getAverageRating = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ productId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin
      .from("reviews")
      .select("rating")
      .eq("product_id", data.productId);
    if (error) throw error;
    const ratings = (result ?? []).map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { average: avg, count: ratings.length };
  });
