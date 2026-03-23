"use client";

import Image from "next/image";
import { ChangeEvent, DragEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/Button";
import Card from "@/src/components/Card";
import ProjectCard from "@/src/components/ProjectCard";
import { getCurrentUser, listCampaigns, toAbsoluteImageUrl, updateMyProfile } from "@/src/lib/api";
import { getProfileGallery, setProfileGallery } from "@/src/lib/profilePreferences";
import { ApiCampaign, AuthUser } from "@/src/lib/types";

const supportedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

type DraftProfile = {
  firstName: string;
  lastName: string;
  category: string;
  bio: string;
  achievements: string;
  password: string;
  confirmPassword: string;
  profileImage: string | null;
  galleryImages: string[];
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<DraftProfile | null>(null);

  useEffect(() => {
    getCurrentUser().then((authUser) => {
      if (!authUser) {
        router.push("/");
        return;
      }
      const gallery = getProfileGallery(authUser.id);
      setUser(authUser);
      setDraft({
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        category: authUser.category ?? "",
        bio: authUser.bio ?? "",
        achievements: authUser.achievements ?? "",
        password: "",
        confirmPassword: "",
        profileImage: authUser.profileImageUrl ?? null,
        galleryImages: gallery,
      });
      listCampaigns({ ownerId: authUser.id }).then((items) => setCampaigns(items ?? []));
    });
  }, [router]);

  const totalRaised = useMemo(() => campaigns.reduce((sum, campaign) => sum + campaign.currentAmount, 0), [campaigns]);
  if (!user || !draft) return <div className="container-app py-10">Načítání profilu…</div>;

  const displayedFirstName = isEditing ? draft.firstName : user.firstName;
  const displayedLastName = isEditing ? draft.lastName : user.lastName;
  const displayedCategory = isEditing ? draft.category : (user.category ?? "");
  const displayedBio = isEditing ? draft.bio : (user.bio ?? "");
  const displayedAchievements = isEditing ? draft.achievements : (user.achievements ?? "");
  const displayedImage = isEditing ? draft.profileImage : (user.profileImageUrl ?? null);
  const displayedGallery = isEditing ? draft.galleryImages : getProfileGallery(user.id);

  const onProfileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => prev ? { ...prev, profileImage: String(reader.result ?? "") } : prev);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const onGalleryFiles = async (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);

    for (const file of selected) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!file.type.startsWith("image/") || !supportedExtensions.has(extension)) {
        setMessage("Do galerie lze přidat jen obrázky (JPG, PNG, WEBP, GIF, SVG).");
        return;
      }
    }

    const converted = await Promise.all(selected.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("read-failed"));
      reader.readAsDataURL(file);
    })));

    setDraft((prev) => prev ? { ...prev, galleryImages: [...prev.galleryImages, ...converted].slice(0, 12) } : prev);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const onDropGallery: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    void onGalleryFiles(event.dataTransfer.files);
  };

  const resetDraft = () => {
    setDraft({
      firstName: user.firstName,
      lastName: user.lastName,
      category: user.category ?? "",
      bio: user.bio ?? "",
      achievements: user.achievements ?? "",
      password: "",
      confirmPassword: "",
      profileImage: user.profileImageUrl ?? null,
      galleryImages: getProfileGallery(user.id),
    });
  };

  const onSaveProfile = async () => {
    if (draft.password && draft.password !== draft.confirmPassword) {
      setMessage("Hesla se neshodují.");
      return;
    }

    const updated = await updateMyProfile({
      firstName: draft.firstName,
      lastName: draft.lastName,
      password: draft.password || undefined,
      profileImageUrl: draft.profileImage,
      category: draft.category,
      bio: draft.bio,
      achievements: draft.achievements,
    });

    if (!updated) return setMessage("Profil se nepodařilo uložit.");

    const savedGallery = setProfileGallery(user.id, draft.galleryImages);
    if (!savedGallery) {
      setMessage("Profil byl uložen, ale galerie je příliš velká.");
    } else {
      setMessage("Profil byl uložen.");
    }

    setUser(updated);
    setIsEditing(false);
    setDraft({
      firstName: updated.firstName,
      lastName: updated.lastName,
      category: updated.category ?? "",
      bio: updated.bio ?? "",
      achievements: updated.achievements ?? "",
      password: "",
      confirmPassword: "",
      profileImage: updated.profileImageUrl ?? null,
      galleryImages: draft.galleryImages,
    });
    window.dispatchEvent(new Event("auth-changed"));
  };

  return (
    <div className="container-app space-y-8 py-10">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm text-zinc-500">Náhled profilu tak, jak ho vidí ostatní uživatelé.</p>
          <Button type="button" variant={isEditing ? "secondary" : "primary"} onClick={() => {
            if (isEditing) resetDraft();
            setMessage("");
            setIsEditing((prev) => !prev);
          }}>
            {isEditing ? "Zrušit úpravy" : "Edit"}
          </Button>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <Button type="button" onClick={onSaveProfile}>Uložit profil</Button>
          </div>
        )}
      </Card>

      <Card className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          {displayedImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={toAbsoluteImageUrl(displayedImage)} alt="Profilový obrázek" className="h-56 w-56 rounded-2xl object-cover" />
          ) : (
            <span className="inline-flex h-56 w-56 items-center justify-center rounded-2xl bg-zinc-200 text-5xl">👤</span>
          )}
          {isEditing && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onProfileImage} className="hidden" />
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>Nahrát avatar</Button>
            </>
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black">{`${displayedFirstName} ${displayedLastName}`.trim() || user.username}</h1>
          <p className="text-lg text-[#666]">{displayedCategory || "Talent"}</p>
          <p className="text-[#666]">{displayedBio || "Doplňte krátké představení svého talentu a cílů."}</p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-[#666]">Celkem vybráno</p><p className="text-2xl font-semibold">{totalRaised.toLocaleString("cs-CZ")} Kč</p></Card>
        <Card><p className="text-sm text-[#666]">Počet projektů</p><p className="text-2xl font-semibold">{campaigns.length}</p></Card>
        <Card><p className="text-sm text-[#666]">Počet podporovatelů</p><p className="text-2xl font-semibold">{Math.max(8, campaigns.length * 10)}</p></Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-2xl font-semibold">O talentu</h2>
        <p className="text-[#666]">{displayedAchievements || "Profil zatím neobsahuje detailní úspěchy. Sledujte další aktuality a nové projekty."}</p>
      </Card>

      {isEditing && (
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Editace profilu</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">Jméno<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={draft.firstName} onChange={(e) => setDraft((prev) => prev ? { ...prev, firstName: e.target.value } : prev)} /></label>
            <label className="text-sm">Příjmení<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={draft.lastName} onChange={(e) => setDraft((prev) => prev ? { ...prev, lastName: e.target.value } : prev)} /></label>
            <label className="text-sm">Kategorie<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={draft.category} onChange={(e) => setDraft((prev) => prev ? { ...prev, category: e.target.value } : prev)} placeholder="Např. Tenis" /></label>
            <label className="text-sm">Nové heslo<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={draft.password} onChange={(e) => setDraft((prev) => prev ? { ...prev, password: e.target.value } : prev)} type="password" /></label>
            <label className="text-sm md:col-span-2">Znovu nové heslo<input className="mt-1 w-full rounded-lg border border-zinc-300 p-2" value={draft.confirmPassword} onChange={(e) => setDraft((prev) => prev ? { ...prev, confirmPassword: e.target.value } : prev)} type="password" /></label>
          </div>
          <label className="text-sm">Bio<textarea className="mt-1 w-full rounded-lg border border-zinc-300 p-2" rows={3} value={draft.bio} onChange={(e) => setDraft((prev) => prev ? { ...prev, bio: e.target.value } : prev)} /></label>
          <label className="text-sm">Úspěchy<textarea className="mt-1 w-full rounded-lg border border-zinc-300 p-2" rows={3} value={draft.achievements} onChange={(e) => setDraft((prev) => prev ? { ...prev, achievements: e.target.value } : prev)} /></label>
        </Card>
      )}

      <Card className="space-y-4">
        <h2 className="text-2xl font-semibold">Galerie</h2>
        {isEditing && (
          <>
            <input ref={galleryInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.svg" multiple className="hidden" onChange={(event) => void onGalleryFiles(event.target.files)} />
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600 hover:border-[#F5A623] hover:bg-amber-50" onDrop={onDropGallery} onDragOver={(event) => event.preventDefault()} onClick={() => galleryInputRef.current?.click()}>
              Přetáhněte sem fotky ({displayedGallery.length}/12)
              <span className="mt-2 block text-xs text-zinc-500">nebo klikněte pro výběr souborů</span>
            </label>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayedGallery.map((url, index) => (
            <div key={`${url}-${index}`} className="space-y-2">
              <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-zinc-200">
                <Image src={url} alt={`Galerie ${index + 1}`} width={260} height={170} className="h-36 w-full object-cover" unoptimized />
              </a>
              {isEditing && (
                <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setDraft((prev) => prev ? { ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) } : prev)}>
                  Odebrat
                </button>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <Button type="button" onClick={onSaveProfile}>Uložit profil</Button>
          </div>
        )}
      </Card>

      {message && <p className="text-sm text-zinc-600">{message}</p>}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Projekty</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <ProjectCard key={campaign.id} id={campaign.id} imageUrl={campaign.coverImageUrl} title={campaign.title} description={campaign.shortDesc} raised={campaign.currentAmount} goal={campaign.goalAmount} rewards={campaign.rewards} />
          ))}
        </div>
      </section>
    </div>
  );
}
