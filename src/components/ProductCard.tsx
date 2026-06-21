import { Link } from "@tanstack/react-router";
import { resolveProductImage } from "@/lib/image-utils";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  categoryName?: string;
  rating?: number;
  reviewCount?: number;
}

function resolveImage(url?: string, categoryName?: string, name?: string): string {
  return resolveProductImage(url, categoryName, name);
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  imageUrl,
  categoryName,
}: ProductCardProps) {
  const img = resolveImage(imageUrl, categoryName, name);
  const { addItem } = useCart();
  const discount = originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link to="/products/$id" params={{ id }} className="group block overflow-hidden">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 mb-4 aspect-[4/5]">
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
        {discount > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-[#E67E22] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            {discount}% off
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-black/60 backdrop-blur-sm px-4 py-3 text-center">
            <span className="text-sm font-semibold text-white tracking-wide">View Product</span>
          </div>
        </div>
      </div>
      <div className="px-1">
        {categoryName && (
          <p className="text-[10px] uppercase tracking-[0.24em] text-gray-400 font-semibold">{categoryName}</p>
        )}
        <h3 className="mt-1.5 text-sm font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-[#E67E22]">
          {name}
        </h3>
        <div className="mt-2 flex items-center gap-2 justify-between">
          <div>
            <p className="text-base font-bold text-foreground">₹{price.toFixed(2)}</p>
            {originalPrice && originalPrice > price && (
              <p className="text-xs text-gray-400 line-through">₹{originalPrice.toFixed(2)}</p>
            )}
          </div>
          <div className="ml-4 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(id, 1);
                toast.success("Added to cart");
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                try {
                  window.dispatchEvent(new CustomEvent("openBuyNow", { detail: { id, quantity: 1 } }));
                } catch (err) {
                  // fallback: add and go to checkout
                  addItem(id, 1);
                  window.location.href = "/checkout";
                }
              }}
              className="ml-1 inline-flex items-center gap-2 rounded-md bg-[#E67E22] px-3 py-2 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
