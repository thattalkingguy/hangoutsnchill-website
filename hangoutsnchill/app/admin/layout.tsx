import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const menu = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: "📊",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: "👥",
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: "📦",
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: "🛒",
    },
    {
      title: "Withdrawals",
      href: "/admin/withdrawals",
      icon: "💸",
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: "📈",
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: "🔔",
    },
    {
      title: "Marketplace",
      href: "/marketplace",
      icon: "🏪",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      <aside className="w-72 bg-slate-900 text-white">

        <div className="border-b border-slate-700 p-8">

          <h1 className="text-3xl font-bold">
            HangoutsNChill
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Super Admin Panel
          </p>

        </div>

        <nav className="space-y-2 p-6">

          {menu.map((item) => (

            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-xl px-4 py-3 transition hover:bg-slate-800"
            >
              <span className="text-2xl">
                {item.icon}
              </span>

              <span className="font-medium">
                {item.title}
              </span>
            </Link>

          ))}

        </nav>

      </aside>

      <div className="flex flex-1 flex-col">

        <header className="flex items-center justify-between border-b bg-white px-10 py-6">

          <div>

            <h2 className="text-3xl font-bold">
              Admin Control Center
            </h2>

            <p className="text-gray-500">
              Manage the HangoutsNChill marketplace
            </p>

          </div>

          <div className="flex items-center gap-4">

            <div className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white">
              ADMIN
            </div>

          </div>

        </header>

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  );
}