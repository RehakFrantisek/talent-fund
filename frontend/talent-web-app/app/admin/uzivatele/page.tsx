"use client";

import { useEffect, useState } from "react";
import Button from "@/src/components/Button";
import Card from "@/src/components/Card";
import { getCurrentUser, listUsersForAdmin, updateUserByAdmin } from "@/src/lib/api";
import { AuthUser, UserRole } from "@/src/lib/types";

type EditableUser = AuthUser & { password: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const current = await getCurrentUser();
    if (!current || current.role !== "ADMIN") {
      setError("Tato stránka je pouze pro admina.");
      return;
    }

    const items = await listUsersForAdmin();
    if (!items) {
      setError("Nepodařilo se načíst uživatele.");
      return;
    }

    setUsers(items.map((user) => ({ ...user, password: "" })));
    setError("");
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const updateField = <K extends keyof EditableUser>(id: string, field: K, value: EditableUser[K]) => {
    setUsers((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  return (
    <div className="container-app space-y-5 py-10">
      <h1 className="text-3xl font-black">Admin: Úprava profilů</h1>
      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm">Jméno<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={user.firstName} onChange={(e) => updateField(user.id, "firstName", e.target.value)} /></label>
              <label className="text-sm">Příjmení<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={user.lastName} onChange={(e) => updateField(user.id, "lastName", e.target.value)} /></label>
              <label className="text-sm">Login<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={user.username} onChange={(e) => updateField(user.id, "username", e.target.value)} /></label>
              <label className="text-sm">Role<select className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={user.role} onChange={(e) => updateField(user.id, "role", e.target.value as UserRole)}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></label>
              <label className="text-sm">Kategorie<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={user.category ?? ""} onChange={(e) => updateField(user.id, "category", e.target.value)} /></label>
              <label className="text-sm">Nové heslo<input type="password" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={user.password} onChange={(e) => updateField(user.id, "password", e.target.value)} placeholder="nechat prázdné = bez změny" /></label>
            </div>
            <label className="block text-sm">Bio<textarea className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={user.bio ?? ""} onChange={(e) => updateField(user.id, "bio", e.target.value)} /></label>
            <label className="block text-sm">Úspěchy<textarea className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={user.achievements ?? ""} onChange={(e) => updateField(user.id, "achievements", e.target.value)} /></label>
            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  const updated = await updateUserByAdmin(user.id, {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    role: user.role,
                    category: user.category ?? "",
                    bio: user.bio ?? "",
                    achievements: user.achievements ?? "",
                    password: user.password || undefined,
                  });
                  if (!updated) {
                    setMessage(`Uživatel ${user.username}: nepodařilo se uložit.`);
                    return;
                  }
                  setMessage(`Uživatel ${updated.username} byl uložen.`);
                  await load();
                }}
              >
                Uložit uživatele
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
