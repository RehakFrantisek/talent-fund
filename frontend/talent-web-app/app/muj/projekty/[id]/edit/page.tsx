"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Button from "@/src/components/Button";
import Card from "@/src/components/Card";
import ImageDropzone from "@/src/components/ImageDropzone";
import { campaignValidation, validateCampaignPayload } from "@/src/lib/campaignValidation";
import { getCampaign, updateCampaign, uploadCampaignImage } from "@/src/lib/api";
import { ApiCampaign, CampaignRewardPayload, Category, CampaignPayload } from "@/src/lib/types";

const categories: Category[] = ["Sport", "Hudba", "Věda", "Umění", "Technologie"];
const supportedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

type RewardFormItem = CampaignRewardPayload & { formId: string };
const emptyReward = (): RewardFormItem => ({ formId: crypto.randomUUID(), title: "", description: "", amount: 500, imageUrl: null });

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<ApiCampaign | null>(null);
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [story, setStory] = useState("");
  const [goalAmount, setGoalAmount] = useState<number>(0);
  const [category, setCategory] = useState<Category>("Sport");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [localPreviewUrls, setLocalPreviewUrls] = useState<string[]>([]);
  const [rewards, setRewards] = useState<RewardFormItem[]>([emptyReward()]);
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignPayload, string>>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getCampaign(params.id).then((item) => {
      if (!item) {
        setCampaign(null);
        return;
      }

      setCampaign(item);
      setTitle(item.title);
      setShortDesc(item.shortDesc);
      setStory(item.story);
      setGoalAmount(item.goalAmount);
      setCategory(item.category);
      setImageUrls(item.imageUrls);
      setRewards(item.rewards.length ? item.rewards.map((reward) => ({ formId: crypto.randomUUID(), title: reward.title, description: reward.description, amount: reward.amount, imageUrl: reward.imageUrl ?? null })) : [emptyReward()]);
    });
  }, [params.id]);

  if (!campaign) {
    return <div className="container-app py-10">Projekt nenalezen nebo backend není dostupný.</div>;
  }

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selected = Array.from(files);
    if (imageUrls.length + selected.length > campaignValidation.image.maxCount) {
      setError(`Můžete nahrát maximálně ${campaignValidation.image.maxCount} obrázků.`);
      return;
    }

    const totalBytes = selected.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > campaignValidation.image.maxTotalBytes) {
      setError("Celková velikost nově nahrávaných obrázků přesahuje 20 MB.");
      return;
    }

    for (const file of selected) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!file.type.startsWith("image/") || !supportedExtensions.has(extension)) {
        setError("Nahrát lze pouze obrázky ve formátu JPG, PNG, WEBP, GIF nebo SVG.");
        return;
      }
      if (file.size > campaignValidation.image.maxFileSizeBytes) {
        setError("Každý obrázek může mít maximálně 5 MB.");
        return;
      }
    }

    setError("");

    const uploadedUrls: string[] = [];
    const previewUrls: string[] = [];

    for (const file of selected) {
      const uploadedUrl = await uploadCampaignImage(file);
      if (!uploadedUrl) {
        setError("Některé obrázky se nepodařilo nahrát.");
        return;
      }
      uploadedUrls.push(uploadedUrl);
      previewUrls.push(URL.createObjectURL(file));
    }

    setImageUrls((prev) => [...prev, ...uploadedUrls]);
    setLocalPreviewUrls((prev) => [...prev, ...previewUrls]);
  };

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const filteredRewards = rewards
      .filter((reward) => reward.title.trim() && reward.description.trim())
      .map(({ title: rewardTitle, description, amount, imageUrl }) => ({ title: rewardTitle, description, amount, imageUrl }));

    const payload: CampaignPayload = {
      title,
      shortDesc,
      story,
      goalAmount,
      category,
      coverImageUrl: imageUrls[0] ?? null,
      imageUrls,
      rewards: filteredRewards,
    };

    const validationErrors = validateCampaignPayload(payload);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setError("");
    const updated = await updateCampaign(campaign.id, payload);

    if (!updated) {
      setNotice("Backend není dostupný. Změny nebyly uloženy.");
      return;
    }

    setNotice("Projekt byl úspěšně uložen.");
    setCampaign(updated);
    setImageUrls(updated.imageUrls);
    setRewards(updated.rewards.map((reward) => ({ formId: crypto.randomUUID(), title: reward.title, description: reward.description, amount: reward.amount, imageUrl: reward.imageUrl ?? null })));
    setLocalPreviewUrls([]);
  };

  return (
    <div className="container-app py-10">
      <Card>
        <h1 className="text-3xl font-black">Úprava projektu</h1>
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
              <Button type="button" variant="secondary" onClick={() => setRewards((prev) => [...prev, emptyReward()])}>Přidat odměnu</Button>
            </div>
            <p className="text-sm text-zinc-600">Každou odměnu můžeš kdykoliv upravit, přidat nebo odebrat.</p>
            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <div key={reward.formId} className="rounded-xl border border-zinc-200 p-3">
                  <div className="mb-2 flex justify-end">
                    <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setRewards((prev) => prev.filter((_, i) => i !== index))}>Odebrat</button>
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
          {notice && <p className="text-sm text-zinc-600">{notice}</p>}
          <div className="flex gap-3"><Button type="submit">Uložit změny</Button><Button variant="secondary" href="/muj/projekty">Zrušit</Button></div>
        </form>
      </Card>
    </div>
  );
}
