"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
  const { count } = useWishlist();

  return (
    <nav className="flex items-center justify-between border-b px-8 py-5 bg-white">
      <Link href="/">
        <h1 className="cursor-pointer text-2xl font-bold text-blue-600">
          HangoutsNChill
        </h1>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <Link href="/marketplace" className="hover:text-blue-600">
          Marketplace
        </Link>

        <Link href="/academy" className="hover:text-blue-600">
          Academy
        </Link>

        <Link href="/community" className="hover:text-blue-600">
          Community
        </Link>

        <Link href="/creators" className="hover:text-blue-600">
          Creators
        </Link>

        <Link
          href="/dashboard/wishlist"
          className="font-medium text-red-500 hover:text-red-600"
        >
          ❤️ Wishlist ({count})
        </Link>
      </div>

      <div className="flex gap-3">
        <Link
          href="/auth/login"
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Login
        </Link>

        <Link
          href="/auth/signup"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Join Free
        </Link>
      </div>
    </nav>
  );
}