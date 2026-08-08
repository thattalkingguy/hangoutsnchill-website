"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AuthProtectedButtonProps = {
  productSlug: string;
  className?: string;
  label?: string;
};

export default function AuthProtectedButton({
  productSlug,
  className,
  label = "Join to purchase",
}: AuthProtectedButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setLoading(false);

    if (session?.user) {
      router.push(`/dashboard?product=${productSlug}`);
    } else {
      router.push(`/auth/login?product=${productSlug}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "Checking access..." : label}
    </button>
  );
}
