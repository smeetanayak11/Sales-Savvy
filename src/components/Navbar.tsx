import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, Search, Menu, X, User, LogOut, Shield, Box } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  const navLinks = [
    { label: "Shop", to: "/products" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1a1a1a]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E67E22]">
              <Box className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Sales Savvy
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 ml-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeProps={{ className: "text-white font-semibold" }}
                inactiveProps={{ className: "text-gray-400" }}
                className="text-sm font-medium transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium text-[#E67E22] transition-colors hover:text-[#E67E22]/80 flex items-center gap-1"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            to="/cart"
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
              </Link>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden md:inline-flex h-9 items-center justify-center rounded-full bg-[#E67E22] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#d35400]"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-white/10 px-6 py-3 animate-fade-in bg-[#1a1a1a]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const q = (form.elements.namedItem("q") as HTMLInputElement).value;
              if (q) window.location.href = `/products?search=${encodeURIComponent(q)}`;
            }}
            className="mx-auto max-w-7xl"
          >
            <input
              name="q"
              autoFocus
              type="text"
              placeholder="Search products..."
              className="w-full bg-white/10 rounded-full px-5 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#E67E22]/40 border border-white/10 focus:border-[#E67E22]/50 transition-all placeholder:text-gray-500"
            />
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1a1a1a] px-6 py-4 space-y-3 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-[#E67E22] transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-300">
                Profile
              </Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-300">
                My Orders
              </Link>
              <button onClick={() => { signOut(); setMenuOpen(false); }} className="block text-sm font-medium text-red-400">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#E67E22]">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
