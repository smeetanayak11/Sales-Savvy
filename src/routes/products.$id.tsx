import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ShoppingCart, Star, Minus, Plus, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "@/lib/products.functions";
import { listReviews, createReview, getAverageRating } from "@/lib/reviews.functions";
import { addToCart } from "@/lib/cart.functions";
import { RatingStars } from "@/components/RatingStars";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

export const Route = createFileRoute("/products/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Product — Sales Savvy` },
      { name: "description", content: "Product details at Sales Savvy." },
    ],
  }),
  component: ProductDetailPage,
});

import { resolveProductImage } from "@/lib/image-utils";

function resolveImage(url?: string, categoryName?: string, productName?: string): string {
  return resolveProductImage(url, categoryName, productName);
}

function ProductDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const fetchProduct = useServerFn(getProduct);
  const fetchReviews = useServerFn(listReviews);
  const fetchAvg = useServerFn(getAverageRating);
  const addCartFn = useServerFn(addToCart);
  const createReviewFn = useServerFn(createReview);

  const navigate = useNavigate();
  const { setCartToSingle } = useCart();

  const { data: productData } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct({ data: { id } }),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => fetchReviews({ data: { productId: id } }),
  });

  const { data: avgData } = useQuery({
    queryKey: ["rating-avg", id],
    queryFn: () => fetchAvg({ data: { productId: id } }),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => addCartFn({ data: { productId: id, quantity } }),
    onSuccess: () => {
      toast.success("Added to cart!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Sign in to add items to cart");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      createReviewFn({ data: { productId: id, rating: reviewRating, comment: reviewComment } }),
    onSuccess: () => {
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["rating-avg", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit review");
    },
  });

  const product = productData?.product;
  const reviews = reviewsData?.reviews ?? [];
  const avg = avgData?.average ?? 0;
  const count = avgData?.count ?? 0;

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="animate-pulse">
          <div className="aspect-square max-w-md mx-auto rounded-2xl bg-muted mb-6" />
          <div className="h-8 w-1/2 mx-auto rounded bg-muted mb-4" />
          <div className="h-4 w-3/4 mx-auto rounded bg-muted" />
        </div>
      </div>
    );
  }

  const img = resolveImage(
    product.image_url ?? undefined,
    product.categories?.category_name,
    product.name
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img
            src={img}
            alt={product.name}
            className="w-full aspect-square rounded-2xl object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{product.name}</h1>
            {product.categories?.category_name && (
              <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1">
                {product.categories.category_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <RatingStars rating={avg} size="md" />
            <span className="text-sm text-muted-foreground">
              {avg.toFixed(1)} ({count} {count === 1 ? "review" : "reviews"})
            </span>
          </div>

          <p className="text-3xl font-bold text-primary">₹{Number(product.price).toFixed(2)}</p>

          <p className="text-muted-foreground leading-relaxed">{product.description || "No description available."}</p>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center border border-border rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending}
              className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={() => {
                // open the buy-now payment modal
                try {
                  window.dispatchEvent(new CustomEvent("openBuyNow", { detail: { id, quantity } }));
                } catch (e) {
                  // fallback: navigate to checkout
                  setCartToSingle(id, quantity);
                  navigate({ to: "/checkout" });
                }
              }}
              className="h-12 rounded-xl border border-border bg-background text-sm font-semibold px-6 transition hover:bg-muted"
            >
              Buy Now
            </button>
          </div>

          <div className="pt-6 border-t border-border space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Stock:</span>
              <span>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-20 border-t border-border pt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Customer Reviews</h2>

        {user && (
          <div className="mb-10 p-6 rounded-2xl border border-border bg-muted/20">
            <h3 className="text-sm font-semibold mb-4">Write a review</h3>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      star <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending || !reviewComment.trim()}
                className="self-end h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="h-3.5 w-3.5" />
                Post
              </button>
            </div>
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{review.profiles?.name || "Anonymous"}</span>
                    <RatingStars rating={review.rating} size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}
