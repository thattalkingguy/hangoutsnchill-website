"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialiseRecovery() {
      try {
        /*
         * Supabase may place the recovery session in the URL hash.
         * Give Supabase a moment to establish the session before
         * deciding whether this is a normal login or recovery flow.
         */
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;

        if (data.session) {
          const url = new URL(window.location.href);

          const hasRecoveryIndicators =
            url.hash.includes("type=recovery") ||
            url.hash.includes("access_token=") ||
            url.searchParams.get("type") === "recovery";

          if (hasRecoveryIndicators) {
            setResetMode(true);
            setForgotPassword(false);
            setError("");
            setMessage("");
          }
        }
      } catch (initialiseError) {
        console.error(
          "ÀTÚNBÍ recovery session error:",
          initialiseError
        );
      }
    }

    initialiseRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("ÀTÚNBÍ AUTH EVENT:", event);

      if (event === "PASSWORD_RECOVERY") {
        setResetMode(true);
        setForgotPassword(false);
        setError("");
        setMessage("");
        return;
      }

      if (event === "SIGNED_IN" && session) {
        const url = new URL(window.location.href);

        if (
          url.hash.includes("type=recovery") ||
          url.searchParams.get("type") === "recovery"
        ) {
          setResetMode(true);
          setForgotPassword(false);
          setError("");
          setMessage("");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      window.location.href = "/admin/bookings";
    } catch (loginException) {
      console.error(
        "ÀTÚNBÍ login exception:",
        loginException
      );

      setError(
        loginException instanceof Error
          ? loginException.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your admin email address first.");
      setLoading(false);
      return;
    }

    try {
      const redirectTo =
        `${window.location.origin}/admin/reset-password`;

      console.log(
        "ÀTÚNBÍ PASSWORD RESET REDIRECT:",
        redirectTo
      );

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo,
          }
        );

      if (resetError) {
        console.error(
          "ÀTÚNBÍ PASSWORD RESET ERROR:",
          resetError
        );

        setError(resetError.message);
        return;
      }

      setMessage(
        "Password reset instructions have been sent. Please check your inbox and spam folder. Open the newest reset email."
      );
    } catch (resetException) {
      console.error(
        "ÀTÚNBÍ PASSWORD RESET EXCEPTION:",
        resetException
      );

      setError(
        resetException instanceof Error
          ? resetException.message
          : "Unable to send password reset instructions."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError(
        "Your new password must be at least 6 characters."
      );
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The two passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "This password reset link is no longer valid. Please request a new reset link."
        );
        return;
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        console.error(
          "ÀTÚNBÍ PASSWORD UPDATE ERROR:",
          updateError
        );

        setError(updateError.message);
        return;
      }

      setNewPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut();

      setResetMode(false);
      setForgotPassword(false);
      setPassword("");

      setMessage(
        "Your password has been successfully changed. You can now sign in with your new password."
      );

      /*
       * Remove recovery tokens from the browser URL.
       */
      window.history.replaceState(
        {},
        document.title,
        "/admin/login"
      );
    } catch (updateException) {
      console.error(
        "ÀTÚNBÍ PASSWORD UPDATE EXCEPTION:",
        updateException
      );

      setError(
        updateException instanceof Error
          ? updateException.message
          : "Unable to change your password."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetToLogin() {
    setForgotPassword(false);
    setResetMode(false);
    setError("");
    setMessage("");
    setNewPassword("");
    setConfirmPassword("");

    window.history.replaceState(
      {},
      document.title,
      "/admin/login"
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1E3] px-6 py-12 text-[#17130F]">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-[#B8954A]/20 bg-white/70 p-8 shadow-xl sm:p-10">

          <div className="text-center">
            <div className="text-3xl font-black tracking-[0.08em]">
              ÀTÚNBÍ
            </div>

            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-[#A47B22]">
              Entertainment
            </div>

            <h1 className="mt-8 text-3xl font-black">
              {resetMode
                ? "Create New Password"
                : forgotPassword
                ? "Reset Password"
                : "Admin Login"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#62574B]">
              {resetMode
                ? "Choose a new password for your ÀTÚNBÍ admin account."
                : forgotPassword
                ? "Enter your admin email and we will send you a secure password reset link."
                : "Access your booking management dashboard."}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-[#B8954A]/40 bg-[#FFF7E6] px-4 py-4 text-sm leading-6 text-[#17130F]">
              {message}
            </div>
          )}

          {resetMode ? (
            <form
              onSubmit={handlePasswordReset}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="new-password"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  New Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="new-password"
                    type={
                      showNewPassword ? "text" : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 pr-20 outline-none focus:border-[#A47B22]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(!showNewPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A47B22] hover:underline"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Confirm Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 pr-20 outline-none focus:border-[#A47B22]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A47B22] hover:underline"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#B8954A]/30 bg-[#FFF7E6] px-4 py-3 text-xs leading-5 text-[#62574B]">
                <strong className="text-[#17130F]">
                  Password tip:
                </strong>{" "}
                Use at least 6 characters. For security, use a
                password you do not reuse elsewhere.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#17130F] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Changing Password..."
                  : "Change Password"}
              </button>

              <button
                type="button"
                onClick={resetToLogin}
                className="w-full text-center text-sm font-bold text-[#A47B22] hover:underline"
              >
                ← Back to Login
              </button>
            </form>
          ) : !forgotPassword ? (
            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Admin email"
                  required
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 pr-20 outline-none focus:border-[#A47B22]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A47B22] hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#17130F] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotPassword(true);
                  setError("");
                  setMessage("");
                }}
                className="w-full text-center text-sm font-bold text-[#A47B22] hover:underline"
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleForgotPassword}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="reset-email"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Admin Email
                </label>

                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your admin email"
                  required
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#17130F] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotPassword(false);
                  setError("");
                  setMessage("");
                }}
                className="w-full text-center text-sm font-bold text-[#A47B22] hover:underline"
              >
                ← Back to Login
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-[#17130F]/10 pt-6 text-center text-xs text-[#766A5E]">
            ÀTÚNBÍ Entertainment • Admin Area
          </div>
        </div>
      </div>
    </main>
  );
}