"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex gap-2 overflow-x-auto py-3">
          {CATEGORIES.map((category) => {
            const href = category.slug ? `/${category.slug}` : "/";
            const active = pathname === href;

            return (
              <Link
                key={category.slug || "home"}
                href={href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {category.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
