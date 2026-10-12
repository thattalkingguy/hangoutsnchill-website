import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | HangoutsNChill",
  description:
    "Privacy Policy for HangoutsNChill and its website, services, creator tools, events, marketplace, and connected platforms.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to HangoutsNChill
          </Link>

          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: October 8, 2026
          </p>
        </div>

        <div className="space-y-8 leading-7 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              1. Introduction
            </h2>

            <p className="mt-3">
              HangoutsNChill ("HnC", "we", "us", or "our") respects your
              privacy. This Privacy Policy explains how information may be
              collected, used, stored, and shared when you use the
              HangoutsNChill website, applications, services, creator tools,
              events, marketplace, community features, and connected
              third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              2. Information We May Collect
            </h2>

            <p className="mt-3">
              Depending on how you use HnC, we may collect information such as
              your name, email address, account information, profile
              information, content you submit, event and ticket information,
              transaction information, communications, and technical
              information about your use of our services.
            </p>

            <p className="mt-3">
              When you connect a supported third-party account, we may receive
              information that you authorize that service to provide to HnC.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              3. How We Use Information
            </h2>

            <p className="mt-3">
              We may use information to provide and improve HnC services,
              create and manage accounts, process transactions and event
              activities, operate creator and community features, provide
              customer support, communicate with users, protect the security
              of our services, prevent abuse and fraud, and develop new HnC
              features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              4. Connected Services
            </h2>

            <p className="mt-3">
              HnC may allow users to connect accounts from third-party
              platforms. These connections are subject to the user's
              authorization and the applicable policies of the third-party
              platform.
            </p>

            <p className="mt-3">
              For example, if you choose to connect a TikTok account to HnC,
              HnC will request only the permissions and information necessary
              for the approved functionality. Users control whether they
              authorize such connections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              5. Content and Creator Features
            </h2>

            <p className="mt-3">
              HnC may provide tools for users and creators to create, upload,
              manage, publish, and distribute content. Content submitted by
              users may be processed to provide these features and to operate
              the HnC platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              6. Payments and Transactions
            </h2>

            <p className="mt-3">
              Where HnC provides ticketing, marketplace, or other transaction
              functionality, payment information may be processed by payment
              providers or other authorized service providers. HnC does not
              need to directly store complete payment-card information when
              such information is processed by a third-party payment
              provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              7. Cookies and Technical Information
            </h2>

            <p className="mt-3">
              HnC and its service providers may use cookies, local storage,
              logs, analytics, and similar technologies to operate the
              website, maintain sessions, improve functionality, understand
              usage, and protect the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              8. Sharing of Information
            </h2>

            <p className="mt-3">
              We may share information with service providers that help us
              operate HnC, including hosting, analytics, payment, security,
              communication, and other technology providers. We may also
              disclose information when required by law, to protect our
              rights and users, or in connection with a business transfer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              9. Data Security
            </h2>

            <p className="mt-3">
              We use reasonable technical and organizational measures designed
              to protect information handled through HnC. However, no
              internet-based service can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              10. Your Choices
            </h2>

            <p className="mt-3">
              Depending on the services you use, you may be able to update
              account information, disconnect connected services, manage
              communications, or request information concerning your personal
              data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              11. Children's Privacy
            </h2>

            <p className="mt-3">
              HnC is not intended to knowingly collect personal information
              from children in violation of applicable law. If you believe a
              child has provided personal information improperly, please
              contact us so that appropriate action can be taken.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              12. Changes to This Policy
            </h2>

            <p className="mt-3">
              We may update this Privacy Policy as HnC develops and as our
              services or legal requirements change. The updated version will
              be posted on this page with a revised "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">
              13. Contact Us
            </h2>

            <p className="mt-3">
              If you have questions about this Privacy Policy or HnC's privacy
              practices, please contact HangoutsNChill through the contact
              information provided on the HnC website.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t pt-6 text-sm text-gray-500">
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-black">
              Home
            </Link>

            <Link href="/terms" className="hover:text-black">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}