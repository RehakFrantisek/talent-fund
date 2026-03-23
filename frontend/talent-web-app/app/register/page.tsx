"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/src/components/Card";
import Button from "@/src/components/Button";
import { registerUser } from "@/src/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="container-app py-10">
      <Card className="mx-auto max-w-lg space-y-4">
        <h1 className="text-3xl font-black">Registrace</h1>
        <label className="block text-sm">Jméno <span className="text-red-600">*</span><input required className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
        <label className="block text-sm">Příjmení <span className="text-red-600">*</span><input required className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
        <label className="block text-sm">Datum narození <span className="text-red-600">*</span><input required type="date" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
        <label className="block text-sm">Přihlašovací jméno <span className="text-red-600">*</span><input required className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={username} onChange={(e) => setUsername(e.target.value)} /></label>

        <label className="block text-sm">
          Heslo <span className="text-red-600">*</span>
          <div className="mt-1 flex items-center gap-2">
            <input required type={showPassword ? "text" : "password"} className="w-full rounded-lg border border-zinc-300 p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-xs" onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? "Skrýt" : "👁"}
            </button>
          </div>
        </label>

        <label className="block text-sm">
          Potvrzení hesla <span className="text-red-600">*</span>
          <div className="mt-1 flex items-center gap-2">
            <input required type={showConfirmPassword ? "text" : "password"} className="w-full rounded-lg border border-zinc-300 p-2" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-xs" onClick={() => setShowConfirmPassword((prev) => !prev)}>
              {showConfirmPassword ? "Skrýt" : "👁"}
            </button>
          </div>
        </label>

        {(error || passwordMismatch) && <p className="text-sm text-red-600">{passwordMismatch ? "Hesla se neshodují." : error}</p>}
        <Button disabled={!firstName || !lastName || !birthDate || !username || !password || !confirmPassword || passwordMismatch} onClick={async () => {
          if (password !== confirmPassword) return setError("Hesla se neshodují.");
          const user = await registerUser({ firstName, lastName, birthDate, username, password });
          if (!user) return setError("Registrace se nezdařila (ověřte unikátnost údajů).");
          router.push("/");
          router.refresh();
        }}>Zaregistrovat</Button>
      </Card>
    </div>
  );
}
