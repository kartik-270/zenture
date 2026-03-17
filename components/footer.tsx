import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-300">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">
              About Us
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/mission" className="hover:text-cyan-400 transition-colors">
              Our Mission
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-sm text-slate-500">
            Made with care for student mental wellness
          </p>
        </div>
      </div>
    </footer>
  );
}
