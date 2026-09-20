"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "📊",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: "👥",
  },
  {
    href: "/admin/exchange",
    label: "Exchange",
    icon: "🔄",
  },
  {
    href: "/admin/treasury",
    label: "Treasury",
    icon: "🏦",
  },
  {
    href: "/admin/withdrawals",
    label: "Withdrawals",
    icon: "💸",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: "📈",
  },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ADMIN NAVIGATION */}

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex min-h-16 items-center justify-between gap-4">
            
            {/* BRAND */}

            <Link
              href="/admin"
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-lg">
                H
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900">
                  HnC Admin
                </p>

                <p className="text-xs text-gray-500">
                  Command Center
                </p>
              </div>
            </Link>

            {/* DESKTOP NAV */}

            <nav className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => {
                const active =
                  isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-2">
                      {item.icon}
                    </span>

                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* USER SIDE */}

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 md:block"
              >
                View HnC
              </Link>

              <span className="rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                ADMIN
              </span>
            </div>
          </div>

          {/* MOBILE NAV */}

          <nav className="flex gap-2 overflow-x-auto pb-3 lg:hidden">
            {navigation.map((item) => {
              const active =
                isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-1">
                    {item.icon}
                  </span>

                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* PAGE CONTENT */}

      {children}
    </div>
  );
}