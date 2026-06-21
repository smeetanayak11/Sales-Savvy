import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="text-xl font-extrabold tracking-tight text-[#E67E22]">
              Sales Savvy
            </Link>
            <p className="mt-4 max-w-sm text-sm text-gray-500 leading-relaxed">
              Premium online marketplace. Quality products for discerning customers.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Shop</h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/products" className="text-sm text-gray-500 hover:text-[#E67E22] transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Account</h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/auth" className="text-sm text-gray-500 hover:text-[#E67E22] transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-gray-500 hover:text-[#E67E22] transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-100 pt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2026 Sales Savvy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
