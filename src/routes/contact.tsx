import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sales Savvy" },
      { name: "description", content: "Get in touch with Sales Savvy." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 rounded-2xl border border-border">
          <Mail className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Email</h3>
          <p className="text-sm text-muted-foreground">support@salessavvy.com</p>
        </div>
        <div className="p-6 rounded-2xl border border-border">
          <Phone className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Phone</h3>
          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
        </div>
        <div className="p-6 rounded-2xl border border-border">
          <MapPin className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Address</h3>
          <p className="text-sm text-muted-foreground">123 Commerce St, Suite 100</p>
        </div>
      </div>
    </div>
  );
}
