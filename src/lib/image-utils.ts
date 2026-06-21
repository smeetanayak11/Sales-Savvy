export const productImageMap: Record<string, string> = {
  smartphone: "/images/product-smartphone.svg",
  phone: "/images/product-smartphone.svg",
  laptop: "/images/product-laptop.svg",
  sony: "/images/product-laptop.svg",
  headphones: "/images/product-headphones.jpg",
  headset: "/images/product-headphones.jpg",
  watch: "/images/product-watch.svg",
  shoes: "/images/product-shoes.svg",
  sneaker: "/images/product-shoes.svg",
  tshirt: "/images/product-clothing.svg",
  jeans: "/images/product-clothing.svg",
  jacket: "/images/product-clothing.svg",
  clothing: "/images/product-clothing.svg",
  bag: "/images/product-bag.svg",
  tote: "/images/product-bag.svg",
  book: "/images/product-book.svg",
  cookbook: "/images/product-book.svg",
  kitchen: "/images/product-kitchen.svg",
  home: "/images/product-home-decor.svg",
  decor: "/images/product-home-decor.svg",
  lipstick: "/images/product-beauty.svg",
  beauty: "/images/product-beauty.svg",
  gaming: "/images/product-gaming.svg",
  earbuds: "/images/product-headphones.jpg",
  sunglasses: "/images/product-accessories.svg",
  powerbank: "/images/product-headphones.jpg",
  accessories: "/images/product-accessories.svg",
  "product-placeholder": "/images/product-placeholder.svg",
};

export function resolveProductImage(
  url?: string,
  categoryName?: string,
  productName?: string
): string {
  if (!url && !categoryName && !productName) return "/images/product-placeholder.svg";
  if (url?.startsWith("/") || url?.startsWith("http")) return url;

  const source = [url, categoryName, productName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const key of Object.keys(productImageMap)) {
    if (source.includes(key)) return productImageMap[key];
  }

  return "/images/product-placeholder.svg";
}
