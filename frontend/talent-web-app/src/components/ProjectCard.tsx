"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Card from "@/src/components/Card";
import Progress from "@/src/components/Progress";
import { ApiCampaignReward } from "@/src/lib/types";
import { toAbsoluteImageUrl } from "@/src/lib/api";

type Props = {
  id: string;
  imageUrl: string | null;
  title: string;
  talentName?: string;
  description: string;
  raised: number;
  goal: number;
  daysLeft?: number;
  rewards?: ApiCampaignReward[];
};

export default function ProjectCard({ id, imageUrl, title, talentName, description, raised, goal, daysLeft, rewards = [] }: Props) {
  const percentage = goal > 0 ? (raised / goal) * 100 : 0;
  const router = useRouter();
  const lowestReward = rewards.length ? Math.min(...rewards.map((reward) => reward.amount)) : null;

  const goToDetail = () => router.push(`/projekty/${id}`);

  return (
    <Card
      className="space-y-4 cursor-pointer"
      onClick={goToDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goToDetail();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Otevřít projekt ${title}`}
    >
      <Image src={toAbsoluteImageUrl(imageUrl)} alt={title} width={420} height={220} className="h-44 w-full rounded-2xl object-cover" unoptimized />
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-[#1a1a1a]">{title}</h3>
        {talentName && <p className="text-sm text-[#666]">Talent: {talentName}</p>}
        <p className="text-sm text-[#666] line-clamp-3">{description}</p>
      </div>
      <div className="space-y-2">
        <Progress value={percentage} />
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-[#1a1a1a]">{raised.toLocaleString("cs-CZ")} Kč / {goal.toLocaleString("cs-CZ")} Kč</p>
          {typeof daysLeft === "number" && <p className="text-[#666]">{daysLeft} dní</p>}
        </div>
      </div>
      {rewards.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-[#5b4a1f]">
          <p className="font-semibold">Odměny za příspěvek: {rewards.length}</p>
          {lowestReward !== null && <p>Od {lowestReward.toLocaleString("cs-CZ")} Kč</p>}
        </div>
      )}
    </Card>
  );
}
