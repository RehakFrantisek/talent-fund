"use client";

import { CampaignFilters, Category } from "@/src/lib/types";

type Props = {
  filters: CampaignFilters;
  onChange: (next: CampaignFilters) => void;
  minGoalBound: number;
  maxGoalBound: number;
};

const categoryOptions: Category[] = ["Sport", "Hudba", "Věda", "Umění", "Technologie"];

export default function FilterPanel({ filters, onChange, minGoalBound, maxGoalBound }: Props) {
  const selectedCategories = filters.categories ?? [];
  const hasBounds = minGoalBound < maxGoalBound;
  const selectedMin = filters.minGoal ?? minGoalBound;
  const selectedMax = filters.maxGoal ?? maxGoalBound;

  const toggleCategory = (category: Category) => {
    const next = selectedCategories.includes(category) ? selectedCategories.filter((item) => item !== category) : [...selectedCategories, category];
    onChange({ ...filters, categories: next });
  };

  return (
    <aside className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
      <h3 className="text-lg font-semibold">Filtry</h3>

      <div className="space-y-3">
        <p className="text-sm font-medium">Kategorie</p>
        <div className="space-y-2 text-sm">
          {categoryOptions.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={selectedCategories.includes(option)} onChange={() => toggleCategory(option)} />
              {option}
            </label>
          ))}
        </div>
      </div>

      <label className="block text-sm">Řazení
        <select className="mt-1 w-full rounded-lg border border-zinc-300 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]" value={filters.sort ?? "Nejpopulárnější"} onChange={(e) => onChange({ ...filters, sort: e.target.value as CampaignFilters["sort"] })}>
          <option>Nejpopulárnější</option>
          <option>Nejnovější</option>
          <option>Cíl vzestupně</option>
          <option>Cíl sestupně</option>
        </select>
      </label>

      <div className="space-y-2 text-sm">
        <p>Cílová částka: {selectedMin.toLocaleString("cs-CZ")} Kč – {selectedMax.toLocaleString("cs-CZ")} Kč</p>
        {!hasBounds && <p className="text-xs text-zinc-500">Rozsah částek bude dostupný po načtení dat.</p>}
        {hasBounds && (
          <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <input type="range" min={minGoalBound} max={maxGoalBound} step={5000} value={selectedMin} onChange={(e) => onChange({ ...filters, minGoal: Math.min(Number(e.target.value), selectedMax), maxGoal: selectedMax })} className="w-full" />
            <input type="range" min={minGoalBound} max={maxGoalBound} step={5000} value={selectedMax} onChange={(e) => onChange({ ...filters, maxGoal: Math.max(Number(e.target.value), selectedMin), minGoal: selectedMin })} className="w-full" />
          </div>
        )}
      </div>
    </aside>
  );
}
