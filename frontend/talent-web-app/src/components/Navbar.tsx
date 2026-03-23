"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/src/components/Button";
import { getCurrentUser, logoutUser } from "@/src/lib/api";
import { getProfileImage } from "@/src/lib/profilePreferences";
import { AuthUser } from "@/src/lib/types";

const links = [
  { href: "/", label: "Domů" },
  { href: "/projekty", label: "Projekty" },
  { href: "/talenty", label: "Talenty" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const refreshAuth = () => {
      getCurrentUser().then((authUser) => {
        setUser(authUser);
        setProfileImage(authUser?.profileImageUrl ?? (authUser ? getProfileImage(authUser.id) : null));
      });
    };

    refreshAuth();
    window.addEventListener("auth-changed", refreshAuth);
    return () => window.removeEventListener("auth-changed", refreshAuth);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-3">
        <Link href="/" className="text-xl font-bold tracking-tight">Talent Fund</Link>
        <nav className="hidden gap-6 text-sm text-zinc-700 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-zinc-950">{link.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button href="/register" variant="secondary" className="h-10 px-4">Registrace</Button>
              <Button href="/login" className="h-10 px-4">Přihlášení</Button>
            </>
          ) : (
            <>
              {user.role !== "ADMIN" && <Button href="/muj/projekty" variant="secondary" className="h-10 px-4">Moje kampaně</Button>}
              {user.role === "ADMIN" && (
                <>
                  <Button href="/admin/projekty" variant="secondary" className="h-10 px-4">Schvalování projektů</Button>
                  <Button href="/admin/uzivatele" variant="secondary" className="h-10 px-4">Správa uživatelů</Button>
                </>
              )}
              <Link href="/profil" className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-300 px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileImage} alt="Profil" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs">👤</span>
                )}
                <span className="hidden md:inline">Profil</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setUser(null);
                  router.push("/");
                  router.refresh();
                }}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                Odhlásit
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
