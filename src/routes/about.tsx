import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Sales Savvy" },
      { name: "description", content: "Learn about Sales Savvy and our mission." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">About Sales Savvy</h1>
      <div className="max-w-2xl space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Sales Savvy is a premium e-commerce platform built to deliver an exceptional shopping experience.
          We curate high-quality products across electronics, accessories, workspace essentials, and lifestyle goods.
        </p>
        <p>
          Our mission is simple: connect discerning customers with products that truly elevate their daily lives.
          Every item in our catalog is hand-selected for quality, design, and durability.
        </p>
        <p>
          With seamless checkout, real-time order tracking, and dedicated customer support, Sales Savvy
          redefines what it means to shop online.
        </p>
      </div>
    </div>
  );
}
