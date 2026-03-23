"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Card from "@/src/components/Card";
import ProjectCard from "@/src/components/ProjectCard";
import { useParams } from "next/navigation";
import { getPublicProfile, toAbsoluteImageUrl } from "@/src/lib/api";
import { getProfileGallery } from "@/src/lib/profilePreferences";
import { PublicProfile } from "@/src/lib/types";

export default function TalentProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const galleryImages = useMemo(() => getProfileGallery(params.id), [params.id]);

  useEffect(() => {
    getPublicProfile(params.id).then((item) => setProfile(item));
  }, [params.id]);

  if (!profile) return <div className="container-app py-10">Profil nebyl nalezen.</div>;

  const totalRaised = profile.campaigns.reduce((sum, campaign) => sum + campaign.currentAmount, 0);

  return (
    <div className="container-app space-y-8 py-10">
      <Card className="grid gap-6 md:grid-cols-[220px_1fr]">
        <Image src={toAbsoluteImageUrl(profile.profileImageUrl)} alt={`${profile.firstName} ${profile.lastName}`} width={220} height={220} className="h-56 w-56 rounded-2xl object-cover" unoptimized />
        <div className="space-y-3">
          <h1 className="text-4xl font-black">{profile.firstName} {profile.lastName}</h1>
          <p className="text-lg text-[#666]">{profile.category || "Talent"}</p>
          <p className="text-[#666]">{profile.bio || "Talentovaný mladý člověk pracující na vlastním rozvoji."}</p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-[#666]">Celkem vybráno</p><p className="text-2xl font-semibold">{totalRaised.toLocaleString("cs-CZ")} Kč</p></Card>
        <Card><p className="text-sm text-[#666]">Počet projektů</p><p className="text-2xl font-semibold">{profile.campaigns.length}</p></Card>
        <Card><p className="text-sm text-[#666]">Počet podporovatelů</p><p className="text-2xl font-semibold">{Math.max(12, profile.campaigns.length * 14)}</p></Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-2xl font-semibold">O talentu</h2>
        <p className="text-[#666]">{profile.achievements || "Profil zatím neobsahuje detailní úspěchy. Sledujte další aktuality a nové projekty."}</p>
      </Card>

      {galleryImages.length > 0 && (
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Galerie</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {galleryImages.map((url, index) => (
              <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-zinc-200">
                <Image src={url} alt={`Galerie ${index + 1}`} width={260} height={180} className="h-40 w-full object-cover transition hover:scale-[1.03]" unoptimized />
              </a>
            ))}
          </div>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Projekty</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {profile.campaigns.map((campaign) => (
            <ProjectCard
              key={campaign.id}
              id={campaign.id}
              imageUrl={campaign.coverImageUrl}
              title={campaign.title}
              description={campaign.shortDesc}
              raised={campaign.currentAmount}
              goal={campaign.goalAmount}
              rewards={campaign.rewards}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
