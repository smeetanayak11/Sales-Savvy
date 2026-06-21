import React, { useEffect, useState } from "react";
import productsData from "@/data/products.json";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function PaymentModal() {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [address, setAddress] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [upiId, setUpiId] = useState("");

  const { setCartToSingle, placeOrder } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e: any) {
      const detail = e.detail ?? {};
      setProductId(detail.id ?? null);
      setQuantity(Number(detail.quantity ?? 1));
      setAddress("");
      setOpen(true);
    }

    window.addEventListener("openBuyNow", handler as EventListener);
    return () => window.removeEventListener("openBuyNow", handler as EventListener);
  }, []);

  if (!open) return null;

  const product = productsData.find((p) => p.id === productId) as any;

  async function handlePay() {
    if (!address.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }

    if (paymentMethod === "upi" && !upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }

    setPaying(true);
    try {
      // Replace cart with single item
      setCartToSingle(productId!, quantity);

      if (paymentMethod === "cod") {
        // COD: no payment processing, create order as pending
        placeOrder(address, "cod", "pending");
        toast.success("Order placed — Cash on Delivery selected");
      } else if (paymentMethod === "upi") {
        // Mock UPI flow
        await new Promise((r) => setTimeout(r, 900));
        placeOrder(address, "upi", "paid");
        toast.success("UPI payment successful — order placed!");
      } else {
        // Card (mock)
        await new Promise((r) => setTimeout(r, 900));
        placeOrder(address, "card", "paid");
        toast.success("Payment successful — order placed!");
      }

      setOpen(false);
      navigate({ to: "/orders" });
    } catch (err: any) {
      toast.error(err?.message ?? "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            {product && (
              <img src={product.image_url ? `/images/product-${product.image_url}.svg` : "/images/product-placeholder.svg"} alt={product.name} className="h-20 w-20 rounded-lg object-cover" />
            )}
            <div>
              <h3 className="text-lg font-semibold">Quick checkout</h3>
              <p className="text-sm text-muted-foreground">Buy {product?.name ?? "product"} — {quantity}×</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Close</button>
        </div>

        <div className="mt-6 grid gap-3">
          <label className="text-sm font-medium">Shipping address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Shipping Address" className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none" />

          <label className="text-sm font-medium">Payment method</label>
          <div className="flex gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="pm" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
              <span className="text-sm">Card</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="pm" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
              <span className="text-sm">UPI</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="pm" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
              <span className="text-sm">Cash on Delivery</span>
            </label>
          </div>

          {paymentMethod === "card" && (
            <>
              <input placeholder="Card number" className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none" />
              <div className="flex gap-2">
                <input placeholder="MM/YY" className="flex-1 rounded-xl border border-border px-4 py-3 text-sm outline-none" />
                <input placeholder="CVC" className="w-28 rounded-xl border border-border px-4 py-3 text-sm outline-none" />
              </div>
            </>
          )}

          {paymentMethod === "upi" && (
            <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="your@upi" className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none" />
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm">Cancel</button>
            <button onClick={handlePay} disabled={paying} className="rounded-xl bg-[#E67E22] px-6 py-2 text-sm font-semibold text-white">
              {paying ? "Processing..." : `Pay ₹${(product ? Number(product.price) * quantity : 0).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
