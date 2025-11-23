import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <h2 className="text-4xl font-bangers text-black mb-4">404</h2>
        <p className="text-xl font-dm-sans text-gray-700 mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-[#FF2B2B] text-white rounded-full font-dm-sans font-bold text-lg hover:bg-[#FF4444] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

