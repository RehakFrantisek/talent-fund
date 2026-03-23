"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Button from "@/src/components/Button";
import Card from "@/src/components/Card";
import Progress from "@/src/components/Progress";
import { getCampaign, getCurrentUser, listDonations, toAbsoluteImageUrl } from "@/src/lib/api";
import { ApiCampaign, AuthUser } from "@/src/lib/types";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<ApiCampaign | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    getCampaign(params.id).then((item) => setCampaign(item));
    getCurrentUser().then((authUser) => setUser(authUser));
  }, [params.id]);

  if (!campaign) return <div className="container-app py-10">Projekt nebyl nalezen.</div>;

  const percentage = (campaign.currentAmount / campaign.goalAmount) * 100;
  const donationItems = listDonations(campaign.id).filter((donation) => typeof donation.amount === "number" && donation.amount > 0);

  return (
    <div className="container-app space-y-8 py-10">
      <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 md:grid-cols-[1.15fr_0.85fr]">
        <Image src={toAbsoluteImageUrl(campaign.coverImageUrl)} alt={campaign.title} width={800} height={480} className="h-full w-full rounded-2xl object-cover" unoptimized />
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#666]">{campaign.category}</p>
          <h1 className="text-3xl font-black">{campaign.title}</h1>
          <p className="text-[#666]">{campaign.shortDesc}</p>
          <p className="text-sm font-semibold">{campaign.currentAmount.toLocaleString("cs-CZ")} Kč / {campaign.goalAmount.toLocaleString("cs-CZ")} Kč</p>
          <Progress value={percentage} />
          {user && (
            <div className="space-y-2">
              <Button className="w-full" disabled title="Podpora projektů bude dostupná v další fázi vývoje.">Podpořit projekt</Button>
              <p className="text-xs text-zinc-500">Podpora projektů bude dostupná v další fázi vývoje.</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Card className="space-y-3">
            <h2 className="text-2xl font-semibold">O projektu</h2>
            <p className="text-[#666]">{campaign.story}</p>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-2xl font-semibold">Aktuality</h2>
            <p className="text-[#666]">Projekt je aktivní a průběžně získává podporu komunity. Novinky budou přibývat podle vývoje kampaně.</p>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-2xl font-semibold">Odměny za příspěvek</h2>
            <p className="text-sm text-zinc-600">Odměny za příspěvek představují poděkování od autora projektu. Výběrem konkrétní odměny přispějete danou částkou a zároveň získáte uvedené poděkování nebo benefit.</p>
            {campaign.rewards.length ? (
              <div className="space-y-3">
                {campaign.rewards.map((reward) => (
                  <div key={reward.id} className="rounded-xl border border-zinc-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-[#1a1a1a]">{reward.title}</p>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{reward.amount.toLocaleString("cs-CZ")} Kč</p>
                    </div>
                    <p className="mt-1 text-sm text-[#666]">{reward.description}</p>
                    <button type="button" className="mt-3 block w-full" onClick={() => setPreviewImage(toAbsoluteImageUrl(reward.imageUrl ?? campaign.coverImageUrl))}>
                      <Image
                        src={toAbsoluteImageUrl(reward.imageUrl ?? campaign.coverImageUrl)}
                        alt={`Odměna ${reward.title}`}
                        width={720}
                        height={420}
                        className="h-auto max-h-72 w-full rounded-lg border border-zinc-200 object-contain"
                        unoptimized
                      />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#666]">Projekt zatím nemá vypsané konkrétní odměny, ale podpora pomáhá posunout talent dál.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-3">
            <h2 className="text-2xl font-semibold">O talentu</h2>
            <p className="text-[#666]">Autor projektu rozvíjí svůj talent v oblasti {campaign.category.toLowerCase()} a hledá podporu na další posun.</p>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-2xl font-semibold">Podpora</h2>
            <div className="space-y-3 text-sm">
              {donationItems.map((donation) => (
                <div key={donation.id} className="rounded-xl border border-zinc-200 p-3">
                  <p className="font-semibold">{donation.donorName} · {donation.amount} Kč</p>
                  {donation.message && <p className="text-[#666]">„{donation.message}“</p>}
                </div>
              ))}
              {!donationItems.length && <p className="text-sm text-zinc-500">Zatím zde nejsou žádné veřejné příspěvky.</p>}
            </div>
          </Card>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewImage(null)}>
          <div className="max-h-[90vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={previewImage} alt="Náhled odměny" width={1400} height={900} className="max-h-[85vh] w-full rounded-xl object-contain" unoptimized />
          </div>
        </div>
      )}
    </div>
  );
}
