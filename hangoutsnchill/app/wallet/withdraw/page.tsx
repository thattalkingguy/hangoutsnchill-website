"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0);
  const [withdrawable, setWithdrawable] = useState(0);

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Wallet load failed:", error);
      return;
    }

    if (!data) return;

    setBalance(Number(data.balance));
    setWithdrawable(Number(data.withdrawable));
  }

  async function requestWithdrawal() {
    const value = Number(amount);

    if (!value || value <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    if (value > withdrawable) {
      alert("Insufficient withdrawable balance.");
      return;
    }

    if (!bankName || !accountName || !accountNumber) {
      alert("Please complete your bank details.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in again.");
        return;
      }

      const { error } = await supabase
        .from("withdrawals")
        .insert({
          user_id: user.id,
          bank_name: bankName,
          account_name: accountName,
          account_number: accountNumber,
          amount: value,
          status: "pending",
        });

      if (error) {
        alert(error.message);
        return;
      }

      /*
       * Notify the seller that the withdrawal request
       * has been successfully submitted.
       */
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "Withdrawal request received 💸",
          message: `Your withdrawal request of ₦${value.toLocaleString(
            "en-NG"
          )} has been submitted and is awaiting approval.`,
          is_read: false,
        });

      /*
       * A notification failure must not make us tell the
       * seller that the withdrawal itself failed.
       * The withdrawal has already been created successfully.
       */
      if (notificationError) {
        console.error(
          "Withdrawal notification failed:",
          notificationError
        );
      }

      alert("🎉 Withdrawal request submitted.");

      setAmount("");
      setBankName("");
      setAccountName("");
      setAccountNumber("");
    } catch (error) {
      console.error("Withdrawal request failed:", error);
      alert("Unable to submit withdrawal request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="mb-8 text-4xl font-bold">
        Withdraw Funds
      </h1>

      <div className="mb-8 rounded-xl bg-green-50 p-6">
        <h2 className="text-2xl font-bold">
          Available Balance
        </h2>

        <p className="mt-3 text-4xl font-bold text-green-600">
          ₦{withdrawable.toLocaleString("en-NG")}
        </p>

        <p className="mt-2 text-gray-500">
          Wallet Balance: ₦{balance.toLocaleString("en-NG")}
        </p>
      </div>

      <div className="space-y-5 rounded-xl bg-white p-8 shadow">
        <input
          className="w-full rounded border p-3"
          placeholder="Bank Name"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          placeholder="Account Name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />

        <input
          type="number"
          className="w-full rounded border p-3"
          placeholder="Withdrawal Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={requestWithdrawal}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Request Withdrawal"}
        </button>
      </div>
    </main>
  );
}