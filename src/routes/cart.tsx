import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart — Sales Savvy" },
      { name: "description", content: "Your shopping cart at Sales Savvy." },
    ],
  }),
  component: CartPage,
});

import { resolveProductImage } from "@/lib/image-utils";

function resolveImage(url?: string, categoryName?: string, productName?: string): string {
  return resolveProductImage(url, categoryName, productName);
}

function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();

  const total = items.reduce((sum, item: any) => {
    const price = Number(item.product?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);


  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: any) => (
            <div key={item.productId} className="flex gap-4 p-4 rounded-xl border border-border">
              <img
                src={resolveImage(
                  item.product?.image_url,
                  item.product?.category_name,
                  item.product?.name
                )}
                alt={item.product?.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{item.product?.name}</h3>
                <p className="text-sm text-primary font-bold mt-1">
                  ₹{Number(item.product?.price ?? 0).toFixed(2)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-1 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">
                  ₹{(Number(item.product?.price ?? 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">Free</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary text-lg">₹{total.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
