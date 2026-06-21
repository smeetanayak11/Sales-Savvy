import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Pencil,
  Trash2,
  Plus,
  Search,
  Save,
  X,
  Shield,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products.functions";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/categories.functions";
import { listAllOrders } from "@/lib/orders.functions";
import { getAdminStats, listUsers, updateOrderStatusAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Sales Savvy" },
      { name: "description", content: "Sales Savvy admin dashboard." },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "products" | "categories" | "orders" | "users";

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

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
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">Please sign in to access the admin dashboard.</p>
        <Link to="/auth" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground">
          Sign In
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
        <Link to="/" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
        {([
          { key: "dashboard", label: "Dashboard", icon: BarChart3 },
          { key: "products", label: "Products", icon: Package },
          { key: "categories", label: "Categories", icon: ShoppingCart },
          { key: "orders", label: "Orders", icon: ShoppingCart },
          { key: "users", label: "Users", icon: Users },
        ] as { key: Tab; label: string; icon: typeof BarChart3 }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "users" && <UsersTab />}
    </div>
  );
}

function DashboardTab() {
  const fetchStats = useServerFn(getAdminStats);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchStats(),
  });

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Products", value: stats?.totalProducts ?? 0, icon: Package, color: "bg-green-50 text-green-600" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "bg-purple-50 text-purple-600" },
    { label: "Revenue", value: `₹${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="p-6 rounded-2xl border border-border">
            <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${card.color} mb-4`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{isLoading ? "—" : card.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsTab() {
  const queryClient = useQueryClient();
  const fetchProducts = useServerFn(listProducts);
  const createFn = useServerFn(createProduct);
  const updateFn = useServerFn(updateProduct);
  const deleteFn = useServerFn(deleteProduct);
  const fetchCategories = useServerFn(listCategories);

  const { data } = useQuery({ queryKey: ["admin-products"], queryFn: () => fetchProducts() });
  const { data: catData } = useQuery({ queryKey: ["categories"], queryFn: () => fetchCategories() });

  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const products = data?.products ?? [];
  const categories = catData?.categories ?? [];

  const createMutation = useMutation({
    mutationFn: (d: any) => createFn({ data: d }),
    onSuccess: () => {
      toast.success("Product created");
      setCreating(false);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => updateFn({ data: d }),
    onSuccess: () => {
      toast.success("Product updated");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Products</h2>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {creating && (
        <ProductForm
          categories={categories}
          onSubmit={(d) => createMutation.mutate(d)}
          onCancel={() => setCreating(false)}
          loading={createMutation.isPending}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Category</th>
              <th className="text-right py-3 px-4 font-semibold">Price</th>
              <th className="text-right py-3 px-4 font-semibold">Stock</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                {editing?.id === p.id ? (
                  <td colSpan={5} className="p-4">
                    <ProductForm
                      product={p}
                      categories={categories}
                      onSubmit={(d) => updateMutation.mutate({ ...d, id: p.id })}
                      onCancel={() => setEditing(null)}
                      loading={updateMutation.isPending}
                    />
                  </td>
                ) : (
                  <>
                    <td className="py-3 px-4">{p.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.categories?.category_name || "—"}</td>
                    <td className="py-3 px-4 text-right">₹{Number(p.price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">{p.stock}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => setEditing(p)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
  loading,
}: {
  product?: any;
  categories: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ? String(product.price) : "",
    stock: product?.stock ? String(product.stock) : "",
    categoryId: product?.category_id || "",
    imageUrl: product?.image_url || "",
  });

  return (
    <div className="p-6 rounded-2xl border border-border bg-muted/20 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          placeholder="Price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.category_name}</option>
          ))}
        </select>
      </div>
      <input
        placeholder="Image URL"
        value={form.imageUrl}
        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
      <div className="flex gap-3">
        <button
          onClick={() =>
            onSubmit({
              name: form.name,
              description: form.description,
              price: parseFloat(form.price),
              stock: parseInt(form.stock),
              categoryId: form.categoryId || undefined,
              imageUrl: form.imageUrl || undefined,
            })
          }
          disabled={loading || !form.name || !form.price}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="h-4 w-4" /> {product ? "Update" : "Create"}
        </button>
        <button onClick={onCancel} className="h-10 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted flex items-center gap-2">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const queryClient = useQueryClient();
  const fetchCategories = useServerFn(listCategories);
  const createFn = useServerFn(createCategory);
  const updateFn = useServerFn(updateCategory);
  const deleteFn = useServerFn(deleteCategory);

  const { data } = useQuery({ queryKey: ["admin-categories"], queryFn: () => fetchCategories() });
  const categories = data?.categories ?? [];

  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

  const createMutation = useMutation({
    mutationFn: (name: string) => createFn({ data: { categoryName: name } }),
    onSuccess: () => {
      toast.success("Category created");
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => updateFn({ data: d }),
    onSuccess: () => {
      toast.success("Category updated");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Categories</h2>
      <div className="flex gap-3">
        <input
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => createMutation.mutate(newName)}
          disabled={!newName.trim() || createMutation.isPending}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {categories.map((cat: any) => (
          <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-border">
            {editing?.id === cat.id ? (
              <div className="flex items-center gap-3 flex-1">
                <input
                  value={editing.category_name}
                  onChange={(e) => setEditing({ ...editing, category_name: e.target.value })}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={() => updateMutation.mutate({ id: cat.id, categoryName: editing.category_name })}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button onClick={() => setEditing(null)} className="p-2 text-muted-foreground hover:bg-muted rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-medium">{cat.category_name}</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(cat)} className="p-2 text-muted-foreground hover:text-primary rounded-lg">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(cat.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  const queryClient = useQueryClient();
  const fetchOrders = useServerFn(listAllOrders);
  const updateStatus = useServerFn(updateOrderStatusAdmin);

  const { data, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => fetchOrders() });
  const orders = data?.orders ?? [];

  const statusMutation = useMutation({
    mutationFn: (d: { id: string; status: string }) => updateStatus({ data: d }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">All Orders</h2>
      {isLoading ? (
        <div className="animate-pulse h-48 rounded-2xl bg-muted" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Order</th>
                <th className="text-left py-3 px-4 font-semibold">Customer</th>
                <th className="text-right py-3 px-4 font-semibold">Total</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-b border-border/50">
                  <td className="py-3 px-4 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                  <td className="py-3 px-4">{o.profiles?.name || o.profiles?.email || "—"}</td>
                  <td className="py-3 px-4 text-right">₹{Number(o.total_amount).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <select
                      value={o.status}
                      onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(o.order_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const fetchUsers = useServerFn(listUsers);
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => fetchUsers() });
  const users = data?.users ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Users</h2>
      {isLoading ? (
        <div className="animate-pulse h-48 rounded-2xl bg-muted" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Role</th>
                <th className="text-left py-3 px-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-3 px-4">{u.name || "—"}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      u.user_roles?.some((r: any) => r.role === "admin")
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {u.user_roles?.some((r: any) => r.role === "admin") ? "Admin" : "Customer"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
