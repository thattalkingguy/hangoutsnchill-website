"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";

type WishlistContextType = {
  count: number;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType>({
  count: 0,
  refreshWishlist: async () => {},
});

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [count, setCount] = useState(0);

  async function refreshWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("wishlist")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setCount(count ?? 0);
  }

  useEffect(() => {
    refreshWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        count,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}