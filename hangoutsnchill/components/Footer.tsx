export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-400">
              HangoutsNChill
            </h2>

            <p className="mt-4 text-gray-400">
              Learn. Connect. Earn.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Marketplace</h3>

            <ul className="mt-4 space-y-2 text-gray-400">
              <li>Courses</li>
              <li>Digital Products</li>
              <li>Services</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Community</h3>

            <ul className="mt-4 space-y-2 text-gray-400">
              <li>HNC Connect</li>
              <li>Academy</li>
              <li>Creator Hub</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Company</h3>

            <ul className="mt-4 space-y-2 text-gray-400">
              <li>About</li>
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-500">
          © 2026 HangoutsNChill. All rights reserved.
        </div>
      </div>
    </footer>
  );
}