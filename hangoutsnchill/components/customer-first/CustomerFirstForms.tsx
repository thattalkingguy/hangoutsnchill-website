"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type RequestType = "callback" | "complaint";

const COMPLAINT_CATEGORIES = [
  { value: "poor_customer_service", label: "Poor customer service" },
  { value: "unanswered_call", label: "Unanswered call" },
  { value: "unreturned_call", label: "Unreturned call" },
  { value: "unresolved_enquiry", label: "Unresolved enquiry" },
  { value: "billing", label: "Billing issue" },
  { value: "product_or_service", label: "Product or service issue" },
  { value: "staff_conduct", label: "Staff conduct" },
  { value: "general", label: "Other / General" },
];

export default function CustomerFirstForms({
  companySlug,
  companyName,
}: {
  companySlug: string;
  companyName: string;
}) {
  const [requestType, setRequestType] = useState<RequestType>("callback");
  const [requesterName, setRequesterName] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<
    "phone" | "email" | "whatsapp" | "in_app"
  >("phone");
  const [preferredCallbackAt, setPreferredCallbackAt] = useState("");
  const [category, setCategory] = useState("poor_customer_service");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Please log in to use HnC Customer First.");
      }

      const response = await fetch("/api/customer-first", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: requestType,
          company_slug: companySlug,
          requester_name: requesterName,
          requester_phone: requesterPhone,
          preferred_contact_method: contactMethod,
          preferred_callback_at: preferredCallbackAt
            ? new Date(preferredCallbackAt).toISOString()
            : null,
          category,
          subject,
          message,
          contact_consent: contactConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Your request could not be submitted."
        );
      }

      setSuccessMessage(data.message);
      setRequesterPhone("");
      setPreferredCallbackAt("");
      setSubject("");
      setMessage("");
      setContactConsent(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <section
      id="customer-first"
      className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
          HnC Customer First
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Every customer deserves attention.
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Need help from {companyName}? Request a callback or submit a
          complaint through HnC. We record your request and make its status
          clear.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setRequestType("callback");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`rounded-xl border px-4 py-4 text-left transition ${
            requestType === "callback"
              ? "border-blue-600 bg-blue-50 text-blue-900"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="block font-bold">Request a callback</span>
          <span className="mt-1 block text-xs text-slate-500">
            Ask the company to contact you.
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRequestType("complaint");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`rounded-xl border px-4 py-4 text-left transition ${
            requestType === "complaint"
              ? "border-blue-600 bg-blue-50 text-blue-900"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="block font-bold">Submit a complaint</span>
          <span className="mt-1 block text-xs text-slate-500">
            Tell us about a service problem.
          </span>
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-800">
            Your name
          </label>
          <input
            className={inputClass}
            value={requesterName}
            onChange={(event) => setRequesterName(event.target.value)}
            placeholder="Enter your full name"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">
            Phone number
          </label>
          <input
            className={inputClass}
            type="tel"
            value={requesterPhone}
            onChange={(event) => setRequesterPhone(event.target.value)}
            placeholder="Enter your phone number"
            maxLength={40}
          />
        </div>

        {requestType === "callback" ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Preferred contact method
              </label>
              <select
                className={inputClass}
                value={contactMethod}
                onChange={(event) =>
                  setContactMethod(
                    event.target.value as
                      | "phone"
                      | "email"
                      | "whatsapp"
                      | "in_app"
                  )
                }
              >
                <option value="phone">Phone call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="in_app">HnC notification</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Preferred callback time (optional)
              </label>
              <input
                className={inputClass}
                type="datetime-local"
                value={preferredCallbackAt}
                onChange={(event) =>
                  setPreferredCallbackAt(event.target.value)
                }
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Complaint category
              </label>
              <select
                className={inputClass}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {COMPLAINT_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Complaint subject
              </label>
              <input
                className={inputClass}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Briefly describe the issue"
                maxLength={160}
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-800">
            {requestType === "callback"
              ? "How can the company help you?"
              : "Describe what happened"}
          </label>
          <textarea
            className={inputClass}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={
              requestType === "callback"
                ? "Tell the company why you would like a callback..."
                : "Provide the details of your experience..."
            }
            rows={5}
            maxLength={5000}
            required
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
          <input
            type="checkbox"
            checked={contactConsent}
            onChange={(event) => setContactConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700"
            required={requestType === "callback"}
          />
          <span>
            I agree that HnC may use the information I provide to process this
            request. For callback requests, I also consent to the selected
            contact method being used to contact me about it.
          </span>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {busy
            ? "Submitting..."
            : requestType === "callback"
              ? "Submit callback request"
              : "Submit complaint"}
        </button>

        <p className="text-xs leading-5 text-slate-500">
          You must be logged in to submit a request. HnC records submissions,
          but company notification and response are not guaranteed until the
          relevant communication service is connected.
        </p>
      </form>
    </section>
  );
}