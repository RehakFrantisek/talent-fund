"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/src/components/Button";
import Card from "@/src/components/Card";
import Progress from "@/src/components/Progress";
import { getCurrentUser, listCampaigns, updateMyProfile } from "@/src/lib/api";
import { ApiCampaign, AuthUser } from "@/src/lib/types";

export default function MujPage() {
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    getCurrentUser().then((authUser) => {
      if (!authUser) {
        setError("Nejste přihlášeni.");
        return;
      }
      setUser(authUser);
      setFirstName(authUser.firstName);
      setLastName(authUser.lastName);
      listCampaigns({ ownerId: authUser.id }).then((items) => {
        if (!items) return setError("Backend není dostupný.");
        setCampaigns(items);
        setError("");
      });
    });
  }, []);

  const current = campaigns[0];
  const totalRaised = useMemo(() => campaigns.reduce((a, c) => a + c.currentAmount, 0), [campaigns]);

  if (!user) {
    return (
      <div className="container-app py-10">
        <Card>
          <h1 className="text-2xl font-bold">Můj profil</h1>
          <p className="mt-2 text-zinc-600">Pro správu profilu se přihlaste.</p>
          {error && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{error}</p>}
        </Card>
      </div>
    );
  }

  return (
    <div className="container-app space-y-8 py-10">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Můj profil</h1>
          <p className="text-zinc-500">Uživatel: {user?.username ?? "-"}</p>
        </div>
        {user.role !== "ADMIN" && <Button href="/muj/projekty/novy">Vytvořit projekt</Button>}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-bold">Správa profilu</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">Jméno<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
          <label className="text-sm">Příjmení<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
          <label className="text-sm">Datum narození<input type="date" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
          <label className="text-sm">Nové heslo<input type="password" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <label className="text-sm">Znovu nové heslo<input type="password" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        </div>
        {saveMessage && <p className="text-sm text-zinc-600">{saveMessage}</p>}
        {confirmPassword && password !== confirmPassword && <p className="text-sm text-red-600">Hesla se neshodují.</p>}
        <Button
          disabled={Boolean(confirmPassword && password !== confirmPassword)}
          onClick={async () => {
            if (password !== confirmPassword) return setSaveMessage("Hesla se neshodují.");
            const updated = await updateMyProfile({ firstName, lastName, birthDate: birthDate || undefined, password: password || undefined });
            if (!updated) return setSaveMessage("Uložení se nepodařilo.");
            setUser(updated);
            setPassword("");
            setConfirmPassword("");
            setSaveMessage("Profil byl uložen.");
          }}
        >
          Uložit profil
        </Button>
      </Card>

      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{error}</p>}

      <div className={`grid gap-6 ${user.role !== "ADMIN" ? "lg:grid-cols-[250px_1fr]" : ""}`}>
        {user.role !== "ADMIN" && (
          <Card className="space-y-3 text-sm">
            <p className="font-semibold">Moje projekty</p>
            <Button href="/muj/projekty" variant="secondary" className="w-full">Přehled kampaní</Button>
          </Card>
        )}

        <div className="space-y-6">
          {current && (
            <Card>
              <h2 className="text-xl font-bold">Aktuální projekt</h2>
              <p className="mt-1">{current.title}</p>
              <p className="my-2 text-sm text-zinc-600">{current.currentAmount.toLocaleString("cs-CZ")} Kč z {current.goalAmount.toLocaleString("cs-CZ")} Kč</p>
              <Progress value={(current.currentAmount / current.goalAmount) * 100} />
              <Button href={`/muj/projekty/${current.id}/edit`} className="mt-4">Spravovat projekt</Button>
            </Card>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <Card><p className="text-sm text-zinc-500">Vybráno celkem</p><p className="text-2xl font-bold">{totalRaised.toLocaleString("cs-CZ")} Kč</p></Card>
            <Card><p className="text-sm text-zinc-500">Počet projektů</p><p className="text-2xl font-bold">{campaigns.length}</p></Card>
            <Card><p className="text-sm text-zinc-500">Stav</p><p className="text-2xl font-bold">{current?.status ?? "-"}</p></Card>
          </div>
        </div>
      </div>
    </div>
  );
}
