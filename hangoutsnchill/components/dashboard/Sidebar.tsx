"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: "🏠", name: "Dashboard", href: "/dashboard" },
    { icon: "🛍", name: "Marketplace", href: "/marketplace" },
    { icon: "➕", name: "Add Product", href: "/marketplace/add-product" },
    { icon: "📦", name: "My Products", href: "/dashboard" },
    { icon: "🛒", name: "My Orders", href: "/orders" },
    { icon: "📥", name: "Orders Received", href: "/seller/orders" },
    { icon: "💰", name: "Wallet", href: "/wallet" },
    { icon: "💸", name: "Withdraw", href: "/wallet/withdraw" },
    { icon: "🎓", name: "Academy", href: "/academy" },
    { icon: "🤖", name: "Nestuge AI", href: "/ai" },
    { icon: "💬", name: "Anonymous Chat", href: "/chat" },
    { icon: "👥", name: "Community", href: "/community" },
    { icon: "⚙️", name: "Settings", href: "/settings" },
  ];

  return (
    <aside className="flex h-screen w-72 flex-col border-r bg-white shadow-sm">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold text-blue-600">
          HangoutsNChill
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Learn • Connect • Earn
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span className="text-xl">{item.icon}</span>

                <span className="font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t p-4">
        <Link
          href="/login"
          className="flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          🚪 Logout
        </Link>
      </div>
    </aside>
  );
}