"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Withdrawal = {
  id: string;
  user_id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function loadWithdrawals() {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setWithdrawals(data || []);
    setLoading(false);
  }

  async function approveWithdrawal(item: Withdrawal) {
    if (item.status !== "pending") {
      alert("This request has already been processed.");
      return;
    }

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", item.user_id)
      .single();

    if (walletError || !wallet) {
      alert("Seller wallet not found.");
      return;
    }

    if (Number(wallet.withdrawable) < Number(item.amount)) {
      alert("Insufficient wallet balance.");
      return;
    }

    const { error: updateWalletError } = await supabase
      .from("wallets")
      .update({
        balance: Number(wallet.balance) - Number(item.amount),
        withdrawable: Number(wallet.withdrawable) - Number(item.amount),
      })
      .eq("user_id", item.user_id);

    if (updateWalletError) {
      alert(updateWalletError.message);
      return;
    }

    const { error: withdrawalError } = await supabase
      .from("withdrawals")
      .update({
        status: "approved",
      })
      .eq("id", item.id);

    if (withdrawalError) {
      alert(withdrawalError.message);
      return;
    }

    alert("✅ Withdrawal approved.");
    loadWithdrawals();
  }

  async function rejectWithdrawal(id: string) {
    const { error } = await supabase
      .from("withdrawals")
      .update({
        status: "rejected",
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadWithdrawals();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold">Withdrawal Requests</h1>

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            No withdrawal requests yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Account</th>
                  <th className="p-4 text-left">Bank</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">
                      <div className="font-semibold">{item.account_name}</div>
                      <div className="text-sm text-gray-500">{item.account_number}</div>
                    </td>
                    <td className="p-4">{item.bank_name}</td>
                    <td className="p-4">₦{item.amount}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          item.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="space-x-2 p-4">
                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() => approveWithdrawal(item)}
                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(item.id)}
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
