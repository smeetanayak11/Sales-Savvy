import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowLeft, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { resolveProductImage } from "@/lib/image-utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sales Savvy" },
      { name: "description", content: "Complete your purchase at Sales Savvy." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [address, setAddress] = useState({ street: "", city: "", zip: "" });
  const { items: cartItems, totalAmount, clearCart, placeOrder } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);

  const orderMutation = {
    isPending: isProcessing,
    mutate: async () => {
      if (!address.street || !address.city || !address.zip) {
        toast.error("Please enter a shipping address.");
        return;
      }
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      placeOrder(`${address.street}, ${address.city} ${address.zip}`);
      clearCart();
      setStep("success");
      setIsProcessing(false);
      toast.success("Order placed successfully!");
    },
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Sign in to checkout</h2>
        <p className="text-muted-foreground mb-6">You need to be signed in to complete your purchase.</p>
        <Link to="/auth" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground">
          Sign In
        </Link>
      </div>
    );
  }

  const items = cartItems || [];

  if (items.length === 0 && step !== "success") {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
        <Link to="/products" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground">
          Browse Products
        </Link>
      </div>
    );
  }

  const total = totalAmount;
  const deliveryCharge = total >= 1000 ? 0 : 49;

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  if (step === "success") {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Thank you for your purchase. You can track your order in your account dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/orders" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground">
            View Orders
          </Link>
          <Link to="/products" className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-sm font-bold text-foreground hover:bg-muted">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-6">Checkout</h1>

      <div className="mb-10 grid grid-cols-2 gap-3 max-w-xl">
        <div className={`rounded-2xl border p-4 text-sm font-semibold ${step === "details" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-foreground"}`}>
          <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 1</span>
          Shipping Address
        </div>
        <div className={`rounded-2xl border p-4 text-sm font-semibold ${step === "payment" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-foreground"}`}>
          <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 2</span>
          Payment
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {step === "details" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Shipping Address</h2>
              <input
                placeholder="Street address"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  placeholder="ZIP code"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={() => setStep("payment")}
                className="h-12 rounded-xl bg-primary text-primary-foreground px-8 font-semibold text-sm hover:bg-primary/90"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Payment Method</h2>
              <div className="p-6 rounded-xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-medium">Mock Payment (Sandbox)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This is a demo checkout. In production, integrate Stripe or Razorpay test keys.
                </p>

                <div className="space-y-3 mt-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                    <span className="font-medium">Card</span>
                  </label>
                  {paymentMethod === "card" && (
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      <input placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" />
                        <input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" />
                      </div>
                      <input placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="w-40 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" />
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input type="radio" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
                    <span className="font-medium">UPI</span>
                  </label>
                  {paymentMethod === "upi" && (
                    <div className="mt-2">
                      <input placeholder="example@upi" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" />
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input type="radio" checked={paymentMethod === "netbanking"} onChange={() => setPaymentMethod("netbanking")} />
                    <span className="font-medium">Net Banking</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  className="h-12 rounded-xl border border-border px-6 font-semibold text-sm hover:bg-muted"
                >
                  Back
                </button>
                <button
                  onClick={() => orderMutation.mutate()}
                  disabled={orderMutation.isPending}
                  className="h-12 rounded-xl bg-[#2874f0] text-white px-8 font-semibold text-sm hover:brightness-95 disabled:opacity-50"
                >
                  {orderMutation.isPending ? "Processing..." : `Pay ₹${(total + deliveryCharge).toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold">Order Summary</h3>
            {items.map((item: any) => (
              <div key={item.productId} className="flex items-center justify-between text-sm gap-3">
                <div className="flex items-center gap-3">
                  <img src={resolveProductImage(item.product?.image_url, item.product?.category_name, item.product?.name)} alt={item.product?.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div>
                    <div className="text-sm font-medium">{item.product?.name}</div>
                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div className="text-sm font-medium">₹{(Number(item.product?.price ?? 0) * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Delivery</span>
                <span>{deliveryCharge === 0 ? "Free" : `₹${deliveryCharge.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{(total + deliveryCharge).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
