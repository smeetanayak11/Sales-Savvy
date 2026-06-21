import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { searchProducts } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Shop — Sales Savvy" },
      { name: "description", content: "Browse all products at Sales Savvy." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = useSearch({ from: "/products" }) as { search?: string; categoryId?: string };
  const [query, setQuery] = useState(search.search ?? "");
  const [activeCategory, setActiveCategory] = useState<string | null>(search.categoryId ?? null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useServerFn(searchProducts);
  const fetchCategories = useServerFn(listCategories);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", query, activeCategory],
    queryFn: () => fetchProducts({ data: { query: query || undefined, categoryId: activeCategory || undefined } }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const products = productsData?.products ?? [];
  const categories = categoriesData?.categories ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">All Products</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-8 flex flex-wrap gap-2 animate-fade-in">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              !activeCategory ? "bg-foreground text-white" : "border border-border text-muted-foreground hover:border-primary"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === cat.id ? "bg-foreground text-white" : "border border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] rounded-xl bg-muted mb-3" />
              <div className="h-4 w-3/4 rounded bg-muted mb-2" />
              <div className="h-4 w-1/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={Number(product.price)}
              originalPrice={product.original_price ? Number(product.original_price) : undefined}
              imageUrl={product.image_url ?? undefined}
              categoryName={product.categories?.category_name}
              rating={product.rating}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
