"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Wallet = {
  balance: number;
  pending: number;
  total_sales: number;
  withdrawable: number;
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet>({
    balance: 0,
    pending: 0,
    total_sales: 0,
    withdrawable: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setWallet({
        balance: Number(data.balance),
        pending: Number(data.pending),
        total_sales: Number(data.total_sales),
        withdrawable: Number(data.withdrawable),
      });
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="p-10">
        Loading wallet...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-10">

      <h1 className="mb-8 text-4xl font-bold">
        My Wallet
      </h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Wallet Balance</p>
          <h2 className="mt-3 text-3xl font-bold">
            ₦{wallet.balance}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Withdrawable</p>
          <h2 className="mt-3 text-3xl font-bold text-green-600">
            ₦{wallet.withdrawable}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Pending</p>
          <h2 className="mt-3 text-3xl font-bold text-orange-600">
            ₦{wallet.pending}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Total Sales</p>
          <h2 className="mt-3 text-3xl font-bold text-blue-600">
            ₦{wallet.total_sales}
          </h2>
        </div>

      </div>

      <div className="mt-10">
        <Link
          href="/wallet/withdraw"
          className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white hover:bg-blue-700"
        >
          Withdraw Funds
        </Link>
      </div>

    </main>
  );
}