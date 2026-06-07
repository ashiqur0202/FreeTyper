import Link from 'next/link';
import { Keyboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Keyboard className="h-16 w-16 text-amber-500" />
      <h1 className="mt-6 text-6xl font-extrabold text-white">404</h1>
      <p className="mt-4 text-xl text-gray-400">Page not found — maybe try typing your way back?</p>
      <p className="mt-2 text-sm text-gray-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-500"
      >
        Back to Home
      </Link>
    </div>
  );
}
