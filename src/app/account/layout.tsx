import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";

/**
 * Everything under /account is private and must never be indexed. The metadata
 * here covers the whole subtree, and robots.ts disallows the path as well —
 * belt and braces, because a leaked account URL in an index is the kind of
 * mistake that is hard to walk back.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
