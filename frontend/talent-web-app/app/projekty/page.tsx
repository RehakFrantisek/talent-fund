"use client";

import { useEffect, useMemo, useState } from "react";
import FilterPanel from "@/src/components/FilterPanel";
import ProjectCard from "@/src/components/ProjectCard";
import { getCampaignGoalBounds, listCampaigns } from "@/src/lib/api";
import { ApiCampaign, CampaignFilters } from "@/src/lib/types";

const fallbackProjects: ApiCampaign[] = [
  {
    id: "p1",
    title: "Nákup houslí pro studium na konzervatoři",
    shortDesc: "Podpora nákupu profesionálních houslí pro studium na Pražské konzervatoři.",
    story: "",
    category: "Hudba",
    goalAmount: 120000,
    currentAmount: 82000,
    status: "APPROVED",
    coverImageUrl: "/placeholders/project-2.svg",
    imageUrls: [],
    images: [],
    rewards: [],
    ownerKey: "anna-kovarova",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


function formatTalentName(ownerKey: string) {
  const map: Record<string, string> = {
    "anna-kovarova": "Anna Kovářová",
    "filip-novotny": "Filip Novotný",
    "jan-filip": "Jan Filip",
    "karolina-kralova": "Karolína Králová",
  };
  return map[ownerKey] ?? ownerKey.replace(/[-_]/g, " ").split(" ").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default function ProjektyPage() {
  const [filters, setFilters] = useState<CampaignFilters>({ sort: "Nejpopulárnější", categories: [] });
  const [searchText, setSearchText] = useState("");
  const [projects, setProjects] = useState<ApiCampaign[]>([]);
  const [goalBounds, setGoalBounds] = useState({ minGoal: 0, maxGoal: 0 });

  useEffect(() => {
    const nextFilters = { ...filters, q: searchText || undefined };
    getCampaignGoalBounds(nextFilters).then((bounds) => bounds && setGoalBounds(bounds));
    listCampaigns(nextFilters).then((items) => setProjects(items ?? fallbackProjects));
  }, [filters, searchText]);

  const visibleProjects = useMemo(() => projects.filter((project) => {
    const categoryMatch = !filters.categories?.length || filters.categories.includes(project.category);
    return categoryMatch;
  }), [filters.categories, projects]);

  return (
    <div className="container-app space-y-8 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-black">Objevte projekty mladých talentů</h1>
        <p className="text-[#666]">Vyberte si projekt, který vám dává smysl, a pomozte talentům na cestě za jejich cílem.</p>
        <input
          className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
          placeholder="Hledat projekty nebo talenty"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel filters={filters} onChange={setFilters} minGoalBound={goalBounds.minGoal} maxGoalBound={goalBounds.maxGoal} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              imageUrl={project.coverImageUrl}
              title={project.title}
              talentName={formatTalentName(project.ownerKey)}
              description={project.shortDesc}
              raised={project.currentAmount}
              goal={project.goalAmount}
              rewards={project.rewards}
              daysLeft={45}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
