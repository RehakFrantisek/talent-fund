"use client";

import { useEffect, useMemo, useState } from "react";
import TalentCard from "@/src/components/TalentCard";
import { listPublicProfiles } from "@/src/lib/api";
import { PublicProfile } from "@/src/lib/types";

const categories = ["Vše", "Sport", "Hudba", "Věda", "Umění", "Technologie"];

export default function TalentsPage() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Vše");

  useEffect(() => {
    listPublicProfiles().then((items) => setProfiles(items ?? []));
  }, []);

  const visibleProfiles = useMemo(() => profiles.filter((profile) => {
    const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
    const text = `${fullName} ${profile.bio ?? ""} ${profile.category ?? ""}`.toLowerCase();
    const searchMatch = !search.trim() || text.includes(search.trim().toLowerCase());
    const categoryMatch = category === "Vše" || (profile.category ?? "").toLowerCase().includes(category.toLowerCase());
    return searchMatch && categoryMatch;
  }), [profiles, search, category]);

  return (
    <div className="container-app space-y-8 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-black">Talenty</h1>
        <p className="text-[#666]">Objevte mladé talenty a jejich projekty.</p>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
            placeholder="Hledat talent podle jména, kategorie nebo popisu"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="rounded-xl border border-zinc-300 bg-white p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProfiles.map((profile) => (
          <TalentCard
            key={profile.id}
            id={profile.id}
            fullName={`${profile.firstName} ${profile.lastName}`}
            category={profile.category || "Talent"}
            bio={profile.bio || "Talentovaný mladý člověk rozvíjející svůj projekt."}
            avatarUrl={profile.profileImageUrl ?? null}
          />
        ))}
      </div>

      {!visibleProfiles.length && <p className="text-sm text-zinc-500">Pro zadané filtry jsme nenašli žádné talenty.</p>}
    </div>
  );
}
