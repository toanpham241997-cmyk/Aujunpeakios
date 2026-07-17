import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] text-white">
      <h1 className="text-4xl font-black text-primary">404</h1>
      <p className="text-white/50 mt-2 mb-6">Page not found</p>
      <Link href="/" className="text-primary font-bold text-sm uppercase tracking-widest hover:underline">
        Go Home
      </Link>
    </div>
  );
}
