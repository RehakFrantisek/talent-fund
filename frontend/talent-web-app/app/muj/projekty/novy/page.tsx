"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/Button";
import Card from "@/src/components/Card";
import ImageDropzone from "@/src/components/ImageDropzone";
import { campaignValidation, validateCampaignPayload } from "@/src/lib/campaignValidation";
import { createCampaign, getCurrentUser, uploadCampaignImage } from "@/src/lib/api";
import { AuthUser, CampaignPayload, CampaignRewardPayload, Category } from "@/src/lib/types";

const categories: Category[] = ["Sport", "Hudba", "Věda", "Umění", "Technologie"]
const supportedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);
type RewardFormItem = CampaignRewardPayload & { formId: string };
const createRewardFormItem = (): RewardFormItem => ({ formId: crypto.randomUUID(), title: "", description: "", amount: 500, imageUrl: null });

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [story, setStory] = useState("");
  const [goalAmount, setGoalAmount] = useState<number>(50000);
  const [category, setCategory] = useState<Category>("Sport");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [localPreviewUrls, setLocalPreviewUrls] = useState<string[]>([]);
  const [rewards, setRewards] = useState<RewardFormItem[]>([createRewardFormItem()]);
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignPayload, string>>>({});
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const onRewardImageSelected = async (index: number, file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("K odměně lze přidat pouze obrázek.");
      return;
    }

    const uploadedUrl = await uploadCampaignImage(file);
    if (!uploadedUrl) {
      setError("Obrázek odměny se nepodařilo nahrát.");
      return;
    }

    setError("");
    setRewards((prev) => prev.map((item, i) => i === index ? { ...item, imageUrl: uploadedUrl } : item));
  };

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user);
      if (!user) setError("Pro vytvoření projektu se musíte přihlásit.");
      if (user?.role === "ADMIN") setError("Administrátorský účet nemůže vytvářet projekty. Přihlaste se prosím jako běžný uživatel.");
    });
  }, []);

  const onFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (imageUrls.length + selected.length > campaignValidation.image.maxCount) return setError(`Můžete nahrát maximálně ${campaignValidation.image.maxCount} obrázků.`);
    if (selected.reduce((sum, file) => sum + file.size, 0) > campaignValidation.image.maxTotalBytes) return setError("Celková velikost nově nahrávaných obrázků přesahuje 20 MB.");

    for (const file of selected) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!file.type.startsWith("image/") || !supportedExtensions.has(extension)) return setError("Nahrát lze pouze obrázky ve formátu JPG, PNG, WEBP, GIF nebo SVG.");
      if (file.size > campaignValidation.image.maxFileSizeBytes) return setError("Každý obrázek může mít maximálně 5 MB.");
    }

    setError("");
    const uploadedUrls: string[] = [];
    const previewUrls: string[] = [];
    for (const file of selected) {
      const uploadedUrl = await uploadCampaignImage(file);
      if (!uploadedUrl) return setError("Některé obrázky se nepodařilo nahrát.");
      uploadedUrls.push(uploadedUrl);
      previewUrls.push(URL.createObjectURL(file));
    }
    setImageUrls((prev) => [...prev, ...uploadedUrls]);
    setLocalPreviewUrls((prev) => [...prev, ...previewUrls]);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === "ADMIN") {
      setError("Administrátorský účet nemůže vytvářet projekty. Přihlaste se prosím jako běžný uživatel.");
      return;
    }

    const payload: CampaignPayload = {
      title,
      shortDesc,
      story,
      goalAmount,
      category,
      coverImageUrl: imageUrls[0] ?? null,
      imageUrls,
      rewards: rewards
        .filter((reward) => reward.title.trim() && reward.description.trim() && reward.amount > 0)
        .map(({ title: rewardTitle, description, amount, imageUrl }) => ({ title: rewardTitle, description, amount, imageUrl })),
    };
    const validationErrors = validateCampaignPayload(payload);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const created = await createCampaign(payload);
    if (!created) return setError("Projekt nebyl vytvořen (nejspíš nejste přihlášeni, nemáte oprávnění, nebo backend není dostupný).");
    router.push(`/projekty/${created.id}`);
  };

  return (
    <div className="container-app py-10">
      <Card>
        <h1 className="text-3xl font-black">Vytvořit projekt</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium">Název projektu <span className="text-red-600">*</span><input required minLength={campaignValidation.title.min} maxLength={campaignValidation.title.max} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          <label className="block text-sm font-medium">Krátký popis <span className="text-red-600">*</span><textarea required minLength={campaignValidation.shortDesc.min} maxLength={campaignValidation.shortDesc.max} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} /></label>
          {errors.shortDesc && <p className="text-sm text-red-600">{errors.shortDesc}</p>}
          <label className="block text-sm font-medium">Podrobný popis <span className="text-red-600">*</span><textarea required rows={5} maxLength={campaignValidation.story.max} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={story} onChange={(e) => setStory(e.target.value)} /></label>
          {errors.story && <p className="text-sm text-red-600">{errors.story}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium">Cílová částka <span className="text-red-600">*</span><input type="number" min={campaignValidation.goalAmount.min} max={campaignValidation.goalAmount.max} step={1000} required className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={goalAmount} onFocus={(e) => { if (e.target.value === "0") e.target.value = ""; }} onChange={(e) => setGoalAmount(Number(e.target.value))} /></label>
            <label className="block text-sm font-medium">Kategorie <span className="text-red-600">*</span><select required className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={category} onChange={(e) => setCategory(e.target.value as Category)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          {errors.goalAmount && <p className="text-sm text-red-600">{errors.goalAmount}</p>}

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Odměny pro podporovatele</h2>
              <Button type="button" variant="secondary" onClick={() => setRewards((prev) => [...prev, createRewardFormItem()])}>Přidat odměnu</Button>
            </div>
            <p className="text-sm text-zinc-500">Přidejte odměny, které se zobrazí podporovatelům při výběru příspěvku.</p>
            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <div key={reward.formId} className="rounded-xl border border-zinc-200 p-3">
                  <div className="mb-2 flex justify-end">
                    <button type="button" disabled={rewards.length === 1} className="text-xs text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline" onClick={() => setRewards((prev) => prev.filter((_, i) => i !== index))}>Odebrat</button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                    <label className="text-sm">Název odměny <span className="text-red-600">*</span><input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={reward.title} onChange={(e) => setRewards((prev) => prev.map((item, i) => i === index ? { ...item, title: e.target.value } : item))} /></label>
                    <label className="text-sm">Částka (Kč) <span className="text-red-600">*</span><input type="number" min={0} step={100} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={reward.amount} onFocus={(e) => { if (e.target.value === "0") e.target.value = ""; }} onChange={(e) => setRewards((prev) => prev.map((item, i) => i === index ? { ...item, amount: Number(e.target.value) } : item))} /></label>
                  </div>
                  <label className="mt-2 block text-sm">Popis odměny <span className="text-red-600">*</span><textarea rows={2} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={reward.description} onChange={(e) => setRewards((prev) => prev.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} /></label>
                  <div className="mt-2 space-y-2">
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 px-3 py-1 text-sm transition hover:border-amber-300 hover:bg-amber-50">
                      Přidat obrázek odměny
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          void onRewardImageSelected(index, event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                    {reward.imageUrl && (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={reward.imageUrl} alt={`Obrázek odměny ${reward.title || index + 1}`} className="h-16 w-16 rounded-lg border border-zinc-200 object-cover" />
                        <button
                          type="button"
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => setRewards((prev) => prev.map((item, i) => i === index ? { ...item, imageUrl: null } : item))}
                        >
                          Odebrat obrázek
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <ImageDropzone imageUrls={imageUrls} localPreviewUrls={localPreviewUrls} error={errors.imageUrls ?? ""} onFilesSelected={onFilesSelected} onRemoveImage={(index) => { setImageUrls((prev) => prev.filter((_, i) => i !== index)); setLocalPreviewUrls((prev) => prev.filter((_, i) => i !== index)); }} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3"><Button type="submit" disabled={currentUser?.role === "ADMIN"}>Vytvořit projekt</Button><Button variant="secondary" href="/muj">Zrušit</Button></div>
        </form>
      </Card>
    </div>
  );
}
