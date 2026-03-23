"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Card from "@/src/components/Card";
import { toAbsoluteImageUrl } from "@/src/lib/api";

type Props = {
  id: string;
  fullName: string;
  category: string;
  bio: string;
  avatarUrl: string | null;
};

export default function TalentCard({ id, fullName, category, bio, avatarUrl }: Props) {
  const router = useRouter();
  const goToProfile = () => router.push(`/talenty/${id}`);

  return (
    <Card
      className="space-y-4 cursor-pointer"
      onClick={goToProfile}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goToProfile();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Otevřít profil ${fullName}`}
    >
      <Image src={toAbsoluteImageUrl(avatarUrl)} alt={fullName} width={320} height={220} className="h-44 w-full rounded-2xl object-cover" unoptimized />
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-[#1a1a1a]">{fullName}</h3>
        <p className="text-sm text-[#666]">{category}</p>
        <p className="text-sm text-[#666] line-clamp-3">{bio}</p>
      </div>
    </Card>
  );
}
