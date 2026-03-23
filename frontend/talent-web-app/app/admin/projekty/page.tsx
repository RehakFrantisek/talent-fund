"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "@/src/components/Card";
import Button from "@/src/components/Button";
import { getCurrentUser, listCampaigns, updateCampaignStatus } from "@/src/lib/api";
import { ApiCampaign, CampaignStatus, Category } from "@/src/lib/types";

const statusOptions: Array<{ value: CampaignStatus; label: string }> = [
  { value: "DRAFT", label: "Rozpracováno" },
  { value: "PENDING_REVIEW", label: "Čeká na schválení" },
  { value: "CHANGES_REQUESTED", label: "Vráceno k úpravě" },
  { value: "APPROVED", label: "Schváleno" },
  { value: "REJECTED", label: "Zamítnuto" },
  { value: "COMPLETED", label: "Dokončeno" },
  { value: "DELETED", label: "Smazáno" },
];

const categoryOptions: Category[] = ["Sport", "Hudba", "Věda", "Umění", "Technologie"];

const statusLabels: Record<CampaignStatus, string> = {
  DRAFT: "Rozpracováno",
  PENDING_REVIEW: "Čeká na schválení",
  CHANGES_REQUESTED: "Vráceno k úpravě",
  APPROVED: "Schváleno",
  REJECTED: "Zamítnuto",
  COMPLETED: "Dokončeno",
  DELETED: "Smazáno",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ApiCampaign[]>([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CampaignStatus[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, CampaignStatus>>({});

  const reload = useCallback(async () => {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      setError("Tato stránka je jen pro admina.");
      return;
    }

    const items = await listCampaigns({ statuses: selectedStatuses, categories: selectedCategories, sort: "Nejnovější" });
    if (!items) {
      setError("Backend není dostupný.");
      return;
    }

    setProjects(items);
    setPendingStatuses({});
    setError("");
  }, [selectedCategories, selectedStatuses]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reload]);

  const filteredProjects = useMemo(
    () => projects.filter((project) => {
      const statusMatch = !selectedStatuses.length || selectedStatuses.includes(project.status);
      const categoryMatch = !selectedCategories.length || selectedCategories.includes(project.category) || (project.category === "Technologie" && selectedCategories.includes("Hudba"));
      return statusMatch && categoryMatch;
    }),
    [projects, selectedCategories, selectedStatuses],
  );

  const pendingCount = Object.keys(pendingStatuses).length;
  const hasChanges = pendingCount > 0;

  const toggleStatus = (status: CampaignStatus) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]));
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]));
  };

  return (
    <div className="container-app py-10 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black">Admin: Schvalování projektů</h1>
        <Button
          onClick={async () => {
            const entries = Object.entries(pendingStatuses);
            for (const [projectId, status] of entries) {
              await updateCampaignStatus(projectId, status);
            }
            setInfo(`Uloženo ${entries.length} změn.`);
            await reload();
          }}
          className={!hasChanges ? "opacity-60" : ""}
        >
          Uložit změny {hasChanges ? `(${pendingCount})` : ""}
        </Button>
      </div>

      <Card className="space-y-4">
        <p className="text-sm font-semibold">Filtry (lze vybrat více možností)</p>

        <details className="rounded-xl border border-zinc-200 p-3" open>
          <summary className="cursor-pointer text-sm font-medium">Stavy ({selectedStatuses.length || "vše"})</summary>
          <div className="mt-3 max-h-44 space-y-2 overflow-y-auto text-sm">
            {statusOptions.map((option) => (
              <label key={option.value} className="block cursor-pointer">
                <input type="checkbox" className="mr-2" checked={selectedStatuses.includes(option.value)} onChange={() => toggleStatus(option.value)} />
                {option.label}
              </label>
            ))}
          </div>
        </details>

        <details className="rounded-xl border border-zinc-200 p-3" open>
          <summary className="cursor-pointer text-sm font-medium">Kategorie ({selectedCategories.length || "vše"})</summary>
          <div className="mt-3 max-h-36 space-y-2 overflow-y-auto text-sm">
            {categoryOptions.map((option) => (
              <label key={option} className="block cursor-pointer">
                <input type="checkbox" className="mr-2" checked={selectedCategories.includes(option)} onChange={() => toggleCategory(option)} />
                {option}
              </label>
            ))}
          </div>
        </details>
      </Card>

      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{error}</p>}
      {info && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{info}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredProjects.map((project) => {
          const selectedStatus = pendingStatuses[project.id] ?? project.status;

          return (
            <Card key={project.id} className="space-y-3">
              <h2 className="text-xl font-semibold">{project.title}</h2>
              <p className="text-sm text-zinc-600">{project.shortDesc}</p>
              <p className="text-xs">Aktuální stav: <strong>{statusLabels[project.status]}</strong></p>
              <p className="text-xs">Zvolený stav: <strong>{statusLabels[selectedStatus]}</strong></p>

              <div className="grid grid-cols-2 gap-2">
                <Button href={`/projekty/${project.id}`} variant="secondary" className="px-3 py-2">Zobrazit</Button>
                <Button href={`/muj/projekty/${project.id}/edit`} variant="secondary" className="px-3 py-2">Edit</Button>
              </div>

              <label className="block text-sm">
                Změnit stav projektu
                <select
                  className="mt-1 w-full rounded-lg border border-zinc-300 p-2"
                  value={selectedStatus}
                  onChange={(e) => setPendingStatuses((prev) => ({ ...prev, [project.id]: e.target.value as CampaignStatus }))}
                >
                  {statusOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
