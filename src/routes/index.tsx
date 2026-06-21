import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProducts } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import { ProductCard } from "@/components/ProductCard";
import { Truck, ShieldCheck, Star, ArrowRight } from "lucide-react";

const categoryEmojis: Record<string, string> = {
  Smartphones: "📱",
  Laptops: "💻",
  Headphones: "🎧",
  Watches: "⌚",
  Shoes: "👟",
  "T-shirts": "👕",
  Accessories: "✨",
  "Home & Decor": "🏡",
  "Home & Garden": "🏡",
  Electronics: "⚡",
  Clothing: "👕",
  "Sports & Outdoors": "🏃",
  Books: "📚",
  "Beauty & Personal Care": "✨",
  "Beauty Products": "✨",
  Gaming: "🎮",
  Bags: "👜",
  Jeans: "👖",
  Jackets: "🧥",
  "Kitchen Appliances": "🍳",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Savvy — Premium E-Commerce" },
      { name: "description", content: "Discover curated premium products at Sales Savvy." },
      { property: "og:title", content: "Sales Savvy — Premium E-Commerce" },
      { property: "og:description", content: "Discover curated premium products." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const fetchProducts = useServerFn(listProducts);
  const fetchCategories = useServerFn(listCategories);

  const { data: productsData } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => fetchProducts(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const products = productsData?.products ?? [];
  const categories = categoriesData?.categories ?? [];

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Dark */}
      <section className="relative bg-gradient-to-b from-[#111] to-[#1a1a1a] overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'nonzero\' stroke=\'%23fff\' stroke-width=\'1\'%3E%3Cpath d=\'M0 0h60v60H0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-36 text-center">
          {/* Collection badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 mb-8 backdrop-blur-sm">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-white/80">Premium curated collection — 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-white">Elevate your</span>
            <br />
            <span className="text-yellow-400">everyday</span>
            <br />
            <span className="text-white">with</span>
            <br />
            <span className="text-white">premium essentials.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-8 mx-auto max-w-2xl text-lg text-gray-400 leading-relaxed">
            Curated pieces for a life well-lived. Discover our latest collection of high-quality products crafted to last.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#E67E22] px-8 text-sm font-semibold text-white transition hover:bg-[#d35400]"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/products"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-8 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Browse Categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/5 bg-[#111]/50">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-white">500+</p>
                <p className="mt-2 text-sm text-gray-500">Products</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-white">10k+</p>
                <p className="mt-2 text-sm text-gray-500">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-white">4.9</p>
                <p className="mt-2 text-sm text-gray-500">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Benefits */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                <Truck className="h-7 w-7 text-[#E67E22]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                <ShieldCheck className="h-7 w-7 text-[#E67E22]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Secure Checkout</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                <Star className="h-7 w-7 text-[#E67E22]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Premium Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#E67E22]">New Arrivals</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Handpicked selections, updated weekly.
            </p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-[#E67E22] hover:underline">
            View all products &rarr;
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {featuredProducts.map((product) => (
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
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        )}
      </section>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 bg-gray-50">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#E67E22]">Browse</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="mt-3 mx-auto max-w-xl text-sm text-muted-foreground">
              Explore our handpicked product categories, from everyday essentials to premium finds.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/products"
                search={{ categoryId: cat.id }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-center transition hover:border-[#E67E22] hover:shadow-lg"
              >
                <span className="text-3xl">
                  {categoryEmojis[cat.category_name] ?? "📦"}
                </span>
                <span className="text-sm font-semibold text-foreground">{cat.category_name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Limited-Time Offer CTA */}
      <section className="bg-gradient-to-b from-[#1a1a1a] to-[#111] py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-yellow-400">Limited Time</p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Get 20% off your first order
          </h2>
          <p className="mt-4 mx-auto max-w-xl text-base leading-7 text-gray-400">
            Create an account and start shopping today. Premium products, delivered fast.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-[#1a1a1a] shadow-lg transition hover:bg-gray-100"
          >
            Create Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
