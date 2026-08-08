import "./globals.css";
import type { Metadata } from "next";

import { WishlistProvider } from "@/context/WishlistContext";

export const metadata: Metadata = {
  title: "HangoutsNChill",
  description: "Learn. Connect. Earn.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </body>
    </html>
  );
}