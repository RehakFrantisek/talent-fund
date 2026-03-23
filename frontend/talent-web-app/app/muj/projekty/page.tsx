"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/src/components/Button";
import Card from "@/src/components/Card";
import { getCurrentUser, listCampaigns, submitCampaign } from "@/src/lib/api";
import { ApiCampaign, AuthUser, CampaignStatus } from "@/src/lib/types";

const statusLabels: Record<CampaignStatus, string> = {
  DRAFT: "Rozpracováno",
  PENDING_REVIEW: "Čeká na schválení",
  CHANGES_REQUESTED: "Vráceno k úpravě",
  APPROVED: "Schváleno",
  REJECTED: "Zamítnuto",
  COMPLETED: "Dokončeno",
  DELETED: "Smazáno",
};

export default function MujProjektyPage() {
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const reload = useCallback(async (ownerId: string) => {
    const items = await listCampaigns({ ownerId });
    if (!items) {
      setError("Backend není dostupný.");
      return;
    }
    setCampaigns(items);
    setError("");
  }, []);

  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      if (!currentUser) {
        setError("Nejste přihlášeni.");
        return;
      }
      setUser(currentUser);
      await reload(currentUser.id);
    });
  }, [reload]);

  return (
    <div className="container-app space-y-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Moje kampaně</h1>
          <p className="text-[#666]">Přehled stavu vašich projektů a rychlé akce pro úpravy.</p>
        </div>
        <Button href="/muj/projekty/novy">Vytvořit nový projekt</Button>
      </div>

      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        {campaigns.map((campaign) => {
          const canSubmit = campaign.status === "DRAFT" || campaign.status === "CHANGES_REQUESTED" || campaign.status === "REJECTED";

          return (
            <Card key={campaign.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-medium">{campaign.title}</h2>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{statusLabels[campaign.status]}</span>
              </div>
              <p className="text-sm text-[#666]">{campaign.shortDesc}</p>
              <p className="text-sm font-semibold">{campaign.currentAmount.toLocaleString("cs-CZ")} Kč / {campaign.goalAmount.toLocaleString("cs-CZ")} Kč</p>
              <div className="flex flex-wrap gap-2">
                <Button href={`/projekty/${campaign.id}`} variant="secondary">Detail</Button>
                <Button href={`/muj/projekty/${campaign.id}/edit`} variant="secondary">Upravit</Button>
                {canSubmit && user && (
                  <Button
                    onClick={async () => {
                      const updated = await submitCampaign(campaign.id);
                      if (!updated) {
                        setMessage("Žádost o schválení se nepodařilo odeslat.");
                        return;
                      }
                      setMessage("Projekt byl odeslán ke schválení.");
                      await reload(user.id);
                    }}
                  >
                    Odeslat ke schválení
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
