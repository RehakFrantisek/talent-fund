import { CampaignPayload, Category } from "@/src/lib/types";

export const campaignValidation = {
  title: { min: 5, max: 120 },
  shortDesc: { min: 20, max: 240 },
  story: { min: 1, max: 5000 },
  goalAmount: { min: 1000, max: 100000000 },
  image: { maxCount: 5, maxFileSizeBytes: 5 * 1024 * 1024, maxTotalBytes: 20 * 1024 * 1024 },
} as const;

const validCategories = new Set<Category>(["Sport", "Hudba", "Věda", "Umění", "Technologie"]);

export function validateCampaignPayload(payload: CampaignPayload): Partial<Record<keyof CampaignPayload, string>> {
  const errors: Partial<Record<keyof CampaignPayload, string>> = {};

  const title = payload.title.trim();
  if (title.length < campaignValidation.title.min || title.length > campaignValidation.title.max) {
    errors.title = `Název musí mít ${campaignValidation.title.min} až ${campaignValidation.title.max} znaků.`;
  }

  const shortDesc = payload.shortDesc.trim();
  if (shortDesc.length < campaignValidation.shortDesc.min || shortDesc.length > campaignValidation.shortDesc.max) {
    errors.shortDesc = `Krátký popis musí mít ${campaignValidation.shortDesc.min} až ${campaignValidation.shortDesc.max} znaků.`;
  }

  const story = payload.story.trim();
  if (!story.length) {
    errors.story = "Podrobný popis je povinný.";
  } else if (story.length > campaignValidation.story.max) {
    errors.story = `Podrobný popis může mít maximálně ${campaignValidation.story.max} znaků.`;
  }

  if (!Number.isInteger(payload.goalAmount)) {
    errors.goalAmount = "Cílová částka musí být celé číslo.";
  } else if (payload.goalAmount < campaignValidation.goalAmount.min || payload.goalAmount > campaignValidation.goalAmount.max) {
    errors.goalAmount = `Cílová částka musí být v rozsahu ${campaignValidation.goalAmount.min.toLocaleString("cs-CZ")} až ${campaignValidation.goalAmount.max.toLocaleString("cs-CZ")} Kč.`;
  }

  if (!validCategories.has(payload.category)) {
    errors.category = "Vyberte platnou kategorii projektu.";
  }

  if (!payload.imageUrls?.length) {
    errors.imageUrls = "Nahrajte alespoň jeden obrázek projektu.";
  }

  return errors;
}
