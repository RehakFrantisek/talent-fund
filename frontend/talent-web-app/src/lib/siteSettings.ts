export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  benefits: string[];
  howItWorks: string[];
}

const SITE_SETTINGS_KEY = "talent-fund-site-settings";

const defaults: SiteSettings = {
  heroTitle: "Podpořte Mladé Talenty",
  heroSubtitle: "Spojujeme talentované mladé lidi s komunitou, která jim pomáhá růst.",
  heroImageUrl: "/placeholders/hero.svg",
  benefits: ["Jednoduché financování", "Podpora mládeže", "Projekty, co inspirují"],
  howItWorks: ["Vytvořte projekt", "Získejte podporu", "Sledujte úspěch"],
};

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 6);
  return cleaned.length ? cleaned : fallback;
}

export function getSiteSettings(): SiteSettings {
  if (!isBrowser()) return defaults;
  const raw = localStorage.getItem(SITE_SETTINGS_KEY);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return {
      heroTitle: parsed.heroTitle?.trim() || defaults.heroTitle,
      heroSubtitle: parsed.heroSubtitle?.trim() || defaults.heroSubtitle,
      heroImageUrl: parsed.heroImageUrl?.trim() || defaults.heroImageUrl,
      benefits: normalizeList(parsed.benefits, defaults.benefits),
      howItWorks: normalizeList(parsed.howItWorks, defaults.howItWorks),
    };
  } catch {
    return defaults;
  }
}

export function setSiteSettings(next: SiteSettings) {
  if (!isBrowser()) return;
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(next));
}
