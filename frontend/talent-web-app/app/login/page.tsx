"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/src/components/Card";
import Button from "@/src/components/Button";
import { loginUser } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="container-app py-10">
      <Card className="mx-auto max-w-lg space-y-4">
        <h1 className="text-3xl font-black">Přihlášení</h1>
        <p className="text-sm text-zinc-600">Test: admin/admin nebo user/user</p>
        <label className="block text-sm">Uživatelské jméno<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label className="block text-sm">Heslo<input type="password" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-red-700">Ještě nemáte účet?</p>
              <Button href="/register" variant="secondary" className="px-3 py-2">Registrovat se</Button>
            </div>
          </div>
        )}
        <Button onClick={async () => {
          const user = await loginUser({ username, password });
          if (!user) return setError("Neplatné přihlášení.");
          router.push("/");
          router.refresh();
        }}>Přihlásit</Button>
      </Card>
    </div>
  );
}
