import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Package, ArrowRight } from "lucide-react";
import { getOrders } from "@/lib/orders.functions";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Sales Savvy" },
      { name: "description", content: "View your order history at Sales Savvy." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const fetchOrders = useServerFn(getOrders);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="animate-pulse h-96 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Please sign in</h2>
        <p className="text-muted-foreground mb-6">Sign in to view your orders.</p>
        <Link to="/auth" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground">
          Sign In
        </Link>
      </div>
    );
  }

  const orders = ordersData?.orders ?? [];
  const { orders: localOrders } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse h-24 rounded-xl bg-muted" />
          ))}
        </div>
      ) : orders.length > 0 || localOrders.length > 0 ? (
        <div className="space-y-4">
          {localOrders.length > 0 && localOrders.map((order) => (
            <div key={order.id} className="p-6 rounded-2xl border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    order.status?.toLowerCase().includes("delivered") ? "bg-green-100 text-green-700" :
                    order.status?.toLowerCase().includes("shipped") ? "bg-blue-100 text-blue-700" :
                    order.status?.toLowerCase().includes("cancel") ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-primary">₹{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.items?.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="h-3 w-3" />
                    <span>{item.name} x {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {orders.length > 0 && orders.map((order: any) => (
            <div key={order.id} className="p-6 rounded-2xl border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    order.status === "delivered" ? "bg-green-100 text-green-700" :
                    order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                    order.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-primary">₹{Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="h-3 w-3" />
                    <span>{item.products?.name} x {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Link to="/products" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground">
            Start Shopping <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
}
