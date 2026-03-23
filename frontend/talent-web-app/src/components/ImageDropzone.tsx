"use client";

import Image from "next/image";
import type { DragEventHandler } from "react";
import { campaignValidation } from "@/src/lib/campaignValidation";
import { toAbsoluteImageUrl } from "@/src/lib/api";

type Props = {
  imageUrls: string[];
  localPreviewUrls: string[];
  error: string;
  onFilesSelected: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
};

export default function ImageDropzone({ imageUrls, localPreviewUrls, error, onFilesSelected, onRemoveImage }: Props) {
  const maxCount = campaignValidation.image.maxCount;

  const onDrop: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    onFilesSelected(event.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <label
        className="block rounded-xl border-2 border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600 transition hover:border-amber-300 hover:bg-amber-50"
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
          multiple
          className="hidden"
          onChange={(event) => {
            onFilesSelected(event.target.files);
            event.target.value = "";
          }}
        />
        Přetáhněte obrázky sem nebo klikněte pro výběr ({imageUrls.length}/{maxCount})
      </label>
      <p className="text-xs text-zinc-500">První obrázek je hlavní. Podporované formáty: JPG, PNG, WEBP, GIF, SVG. Max {maxCount} obrázků, 5 MB na soubor a 20 MB celkem.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {imageUrls.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {imageUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="space-y-2 rounded-xl border border-zinc-200 p-2">
              <Image
                src={localPreviewUrls[index] ?? toAbsoluteImageUrl(url)}
                alt={`Náhled obrázku ${index + 1}`}
                width={220}
                height={140}
                className="h-28 w-full rounded-lg object-cover"
                unoptimized
              />
              <div className="flex items-center justify-between gap-2 text-xs">
                {index === 0 && <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-900">Hlavní obrázek</span>}
                <button type="button" onClick={() => onRemoveImage(index)} className="text-red-600 hover:underline">Odebrat</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
