"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ProfileCard from "@/components/dashboard/ProfileCard";
import RecentProducts from "@/components/dashboard/RecentProducts";
import StatCard from "@/components/StatCard";

import type { Product } from "@/lib/product";

type Profile = {
  full_name: string;
  username: string;
  role: string;
};

type Wallet = {
  balance: number;
  pending: number;
  withdrawable: number;
  total_sales: number;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [wallet, setWallet] = useState<Wallet>({
    balance: 0,
    pending: 0,
    withdrawable: 0,
    total_sales: 0,
  });

  const [productCount, setProductCount] = useState(0);
  const [productValue, setProductValue] = useState(0);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [profileResult, walletResult, productsResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single(),

          supabase
            .from("wallets")
            .select("*")
            .eq("user_id", user.id)
            .single(),

          supabase
            .from("products")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      if (walletResult.data) {
        setWallet(walletResult.data);
      }

      if (productsResult.data) {
        setRecentProducts(productsResult.data as Product[]);
        setProductCount(productsResult.data.length);

        const total = productsResult.data.reduce(
          (sum, product) => sum + Number(product.price),
          0
        );

        setProductValue(total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1">
        <Topbar />

        <div className="space-y-8 p-8">
          {profile && (
            <ProfileCard
              name={profile.full_name}
              email={profile.username}
            />
          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Wallet Balance"
              value={`₦${Number(wallet.balance).toLocaleString()}`}
              subtitle="Available balance"
              icon="💰"
            />

            <StatCard
              title="Pending"
              value={`₦${Number(wallet.pending).toLocaleString()}`}
              subtitle="Awaiting clearance"
              icon="⏳"
            />

            <StatCard
              title="Withdrawable"
              value={`₦${Number(wallet.withdrawable).toLocaleString()}`}
              subtitle="Ready for withdrawal"
              icon="🏦"
            />

            <StatCard
              title="Total Sales"
              value={`₦${Number(wallet.total_sales).toLocaleString()}`}
              subtitle="Lifetime sales"
              icon="📈"
            />

            <StatCard
              title="Role"
              value={profile?.role ?? "Member"}
              subtitle="Account type"
              icon="👤"
            />

            <StatCard
              title="My Products"
              value={String(productCount)}
              subtitle="Published products"
              icon="📦"
            />

            <StatCard
              title="Marketplace Value"
              value={`₦${productValue.toLocaleString()}`}
              subtitle="Value of your products"
              icon="🛍️"
            />
          </div>

          <RecentProducts products={recentProducts} />
        </div>
      </main>
    </div>
  );
}