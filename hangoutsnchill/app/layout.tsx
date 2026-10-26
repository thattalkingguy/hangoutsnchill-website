
import "./globals.css";
import type { Metadata } from "next";

import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HangoutsNChill",
  description: "Learn. Connect. Earn.",
  other: {
    "impact-site-verification":
      "20db545d-ba58-4306-bcfc-bf173745b8af",
  },
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
          <Navbar />
          {children}
        </WishlistProvider>
      </body>
    </html>
  );
}
