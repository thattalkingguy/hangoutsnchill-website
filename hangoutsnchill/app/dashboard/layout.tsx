"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.replace("/auth/login");
        return;
      }

      setIsChecking(false);
    };

    verifySession();
  }, [router]);

  if (isChecking) {
    return (
      <main className="min-h-screen bg-slate-50 py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-700">Verifying your access...</p>
          <p className="mt-3 text-sm text-slate-500">You will be redirected to login if your session is not valid.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
