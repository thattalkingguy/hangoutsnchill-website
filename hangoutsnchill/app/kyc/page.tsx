"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type KycStatus = "not_started" | "pending" | "verified" | "rejected";

export default function KycPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<KycStatus>("not_started");
  const [rejectionReason, setRejectionReason] = useState("");

  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    loadKyc();
  }, []);

  async function loadKyc() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("KYC load failed:", error);
        alert("Unable to load your verification information.");
        return;
      }

      if (data) {
        setStatus(data.status);
        setIdType(data.id_type || "");
        setIdNumber(data.id_number || "");
        setDateOfBirth(data.date_of_birth || "");
        setAddress(data.address || "");
        setRejectionReason(data.rejection_reason || "");
      }
    } catch (error) {
      console.error("KYC error:", error);
      alert("Unable to load KYC information.");
    } finally {
      setLoading(false);
    }
  }

  async function submitKyc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!idType || !idNumber || !dateOfBirth || !address) {
      alert("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in again.");
        router.push("/auth/login");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("kyc_verifications")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingError) {
        console.error(existingError);
        alert("Unable to check your existing verification.");
        return;
      }

      const payload = {
        user_id: user.id,
        status: "pending",
        id_type: idType,
        id_number: idNumber.trim(),
        date_of_birth: dateOfBirth,
        address: address.trim(),
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
        reviewed_at: null,
        updated_at: new Date().toISOString(),
      };

      let error;

      if (existing) {
        ({ error } = await supabase
          .from("kyc_verifications")
          .update(payload)
          .eq("user_id", user.id));
      } else {
        ({ error } = await supabase
          .from("kyc_verifications")
          .insert(payload));
      }

      if (error) {
        console.error("KYC submission failed:", error);
        alert(error.message);
        return;
      }

      setStatus("pending");
      setRejectionReason("");

      alert("Your identity verification has been submitted successfully.");
    } catch (error) {
      console.error("KYC submission error:", error);
      alert("Unable to submit your verification.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading verification...</p>
      </main>
    );
  }

  if (status === "verified") {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Identity Verified
            </h1>

            <p className="mt-3 text-gray-600">
              Your HnC identity verification has been successfully approved.
              You can now withdraw eligible funds from your wallet.
            </p>

            <button
              onClick={() => router.push("/wallet/withdraw")}
              className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Go to Withdrawals
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (status === "pending") {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              ⏳
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Verification Under Review
            </h1>

            <p className="mt-4 text-gray-600">
              We've received your verification information. Our team will
              review it before withdrawals are enabled.
            </p>

            <p className="mt-4 text-sm text-gray-500">
              You don't need to submit another application while your
              verification is under review.
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-8 rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              HnC Identity Verification
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Verify Your Identity
            </h1>

            <p className="mt-4 text-gray-600">
              To protect our users and the HnC community, identity
              verification is required before withdrawing funds.
            </p>
          </div>

          {status === "rejected" && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <h2 className="font-bold text-red-900">
                Verification needs attention
              </h2>

              <p className="mt-2 text-sm text-red-800">
                Your previous verification was not approved.
              </p>

              {rejectionReason && (
                <p className="mt-2 text-sm text-red-800">
                  <strong>Reason:</strong> {rejectionReason}
                </p>
              )}

              <p className="mt-2 text-sm text-red-800">
                Please correct the information and submit again.
              </p>
            </div>
          )}

          <form onSubmit={submitKyc} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-medium text-gray-800">
                Identification Type
              </label>

              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
              >
                <option value="">Select ID type</option>
                <option value="National ID">National ID</option>
                <option value="International Passport">
                  International Passport
                </option>
                <option value="Driver's License">
                  Driver's License
                </option>
                <option value="Voter's Card">Voter's Card</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-800">
                ID Number
              </label>

              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
                placeholder="Enter your ID number"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-800">
                Date of Birth
              </label>

              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-800">
                Residential Address
              </label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={4}
                placeholder="Enter your current residential address"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
              <strong>Privacy & Security</strong>

              <p className="mt-2">
                Your verification information is used only for identity
                verification and account security. Do not submit information
                belonging to another person.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Verification..."
                : "Submit for Verification"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}