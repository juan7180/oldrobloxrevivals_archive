import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F1113] px-4 text-white">
      <Image
        src="/snoo-404.svg"
        alt=""
        width={48}
        height={48}
        className="mb-6"
        priority
      />

      <h1 className="text-xl font-semibold text-white">Page not found</h1>
      <Link
        href="/"
        className="mt-6 min-w-[280px] rounded-full bg-reddit-blue px-8 py-3 text-center text-sm font-semibold text-white hover:bg-[#006cbd] transition-colors"
      >
        go back home
      </Link>
    </div>
  );
}
