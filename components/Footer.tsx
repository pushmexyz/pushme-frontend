'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bangers text-[#FF2B2B] mb-4">
              PressMe.xyz
            </h3>
            <p className="font-dm-sans text-gray-600">
              The internet's button. Press it. Make the stream react.
            </p>
          </div>

          <div>
            <h4 className="font-dm-sans font-semibold text-black mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/donate"
                  className="font-dm-sans text-gray-600 hover:text-[#FF2B2B] transition-colors"
                >
                  Donate
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="font-dm-sans text-gray-600 hover:text-[#FF2B2B] transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/overlay"
                  className="font-dm-sans text-gray-600 hover:text-[#FF2B2B] transition-colors"
                >
                  Overlay
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-dm-sans font-semibold text-black mb-4">Social</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/pushmexyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-dm-sans text-gray-600 hover:text-[#FF2B2B] transition-colors"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="https://pump.fun/coin/8Dvn4hkhKG8Vn2NUEsFmofXJYrVrAkNTLwZyvMJNpump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-dm-sans text-gray-600 hover:text-[#FF2B2B] transition-colors"
                >
                  Pump.fun
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="font-dm-sans text-gray-600 text-sm">
            © 2024 PressMe.xyz - Powered by Solana
          </p>
        </div>
      </div>
    </footer>
  );
}

