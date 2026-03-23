"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/src/components/Button";
import ProjectCard from "@/src/components/ProjectCard";
import Section from "@/src/components/Section";
import TalentCard from "@/src/components/TalentCard";
import { getCurrentUser, listCampaigns, listPublicProfiles } from "@/src/lib/api";
import { ApiCampaign, AuthUser, PublicProfile } from "@/src/lib/types";

const trustItems = [
  { icon: "💡", title: "Jednoduché financování" },
  { icon: "🤝", title: "Podpora mladých talentů" },
  { icon: "🔎", title: "Transparentní projekty" },
];


const fallbackTalents = [
  { id: "ft1", firstName: "Filip", lastName: "Novotný", category: "Tenis", bio: "Talentovaný juniorský tenista hledající podporu na evropské turnaje.", profileImageUrl: "/placeholders/talent-1.svg" },
  { id: "ft2", firstName: "Anna", lastName: "Kovářová", category: "Hudba", bio: "Mladá houslistka připravující se na studium na konzervatoři.", profileImageUrl: "/placeholders/talent-2.svg" },
  { id: "ft3", firstName: "Jan", lastName: "Filip", category: "Robotika", bio: "Student robotiky pracující na vlastním výzkumném projektu.", profileImageUrl: "/placeholders/talent-3.svg" },
  { id: "ft4", firstName: "Karolína", lastName: "Králová", category: "Atletika", bio: "Mladá běžkyně připravující se na reprezentační soustředění.", profileImageUrl: "/placeholders/talent-5.svg" },
];

const fallbackProjects = [
  { id: "fp1", title: "Cesta na evropský tenisový turnaj", shortDesc: "Podpora účasti na turnajích a tréninkového kempu.", currentAmount: 68000, goalAmount: 110000, coverImageUrl: "/placeholders/project-1.svg" },
  { id: "fp2", title: "Nákup profesionálních houslí", shortDesc: "Kvalitní nástroj pro studium na konzervatoři.", currentAmount: 82000, goalAmount: 120000, coverImageUrl: "/placeholders/project-2.svg" },
  { id: "fp3", title: "Start robotického projektu", shortDesc: "Vývoj robotického prototypu pro středoškolskou soutěž.", currentAmount: 54000, goalAmount: 90000, coverImageUrl: "/placeholders/project-3.svg" },
  { id: "fp4", title: "Podpora atletického soustředění", shortDesc: "Příprava na sezónu včetně tréninkového vybavení.", currentAmount: 47000, goalAmount: 80000, coverImageUrl: "/placeholders/project-4.svg" },
];

const steps = [
  { title: "Vytvořte projekt", text: "Popište svůj talent a stanovte cílovou částku." },
  { title: "Získejte podporu", text: "Sdílejte projekt a získejte podporu komunity." },
  { title: "Sledujte úspěch", text: "Dosáhněte cíle a realizujte svůj projekt." },
];

export default function Home() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [projects, setProjects] = useState<ApiCampaign[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

  const successfulProjects = projects.filter((project) => project.status === "COMPLETED" || project.currentAmount >= project.goalAmount).slice(0, 4);

  useEffect(() => {
    listPublicProfiles().then((items) => setProfiles((items ?? []).slice(0, 6)));
    listCampaigns({ sort: "Nejpopulárnější" }).then((items) => setProjects((items ?? []).slice(0, 4)));
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="space-y-16 py-10">
      <section className="container-app overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 md:p-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-black leading-tight md:text-6xl">Podpořte mladé talenty</h1>
            <p className="max-w-xl text-lg text-[#666]">Pomáháme mladým sportovcům, umělcům a vědcům získat podporu na jejich projekty a sny.</p>
            <div className="flex flex-wrap gap-3">
              <Button href="/projekty">Objevit projekty</Button>
              <Button href={user ? "/muj/projekty/novy" : "/login"} variant="secondary">Spustit vlastní projekt</Button>
            </div>
          </div>
          <Image src="/placeholders/hero.svg" alt="Mladý talent" width={640} height={460} className="h-full w-full rounded-2xl object-cover" unoptimized />
        </div>
      </section>

      <section className="container-app grid gap-4 md:grid-cols-3">
        {trustItems.map((item) => (
          <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <p className="text-2xl">{item.icon}</p>
            <p className="mt-3 text-lg font-semibold">{item.title}</p>
          </div>
        ))}
      </section>

      <Section title="Jak to funguje" subtitle="Ve třech jednoduchých krocích získáte podporu pro svůj projekt.">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
              <p className="text-sm font-semibold text-[#F5A623]">Krok {index + 1}</p>
              <h3 className="mt-2 text-xl font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-[#666]">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Doporučené talenty">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(profiles.length ? profiles : fallbackTalents as unknown as PublicProfile[]).map((profile) => (
            <TalentCard
              key={profile.id}
              id={profile.id}
              fullName={`${profile.firstName} ${profile.lastName}`}
              category={profile.category || "Talent"}
              bio={profile.bio || "Talentovaný mladý člověk rozvíjející svůj projekt."}
              avatarUrl={profile.profileImageUrl ?? null}
            />
          ))}
        </div>
      </Section>

      <Section title="Úspěšné projekty" subtitle="Inspirujte se projekty, kterým se podařilo dosáhnout cíle.">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {(successfulProjects.length ? successfulProjects : (projects.length ? projects.filter((project) => project.currentAmount >= project.goalAmount) : fallbackProjects as unknown as ApiCampaign[])).slice(0, 4).map((project) => (
            <article key={`success-${project.id}`} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
              <Image src={project.coverImageUrl ?? "/placeholders/project-1.svg"} alt={project.title} width={540} height={320} className="h-44 w-full object-cover" unoptimized />
              <div className="space-y-2 p-4">
                <h3 className="text-base font-semibold">{project.title}</h3>
                <p className="text-sm text-zinc-500">Talent: {project.ownerKey || "Mladý talent"}</p>
                <p className="text-sm font-semibold text-zinc-700">Vybráno: {project.currentAmount.toLocaleString("cs-CZ")} Kč</p>
                <p className="text-sm text-zinc-600">{project.shortDesc}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Doporučené projekty">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {(projects.length ? projects : fallbackProjects as unknown as ApiCampaign[]).map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              imageUrl={project.coverImageUrl}
              title={project.title}
              description={project.shortDesc}
              raised={project.currentAmount}
              goal={project.goalAmount}
              rewards={project.rewards}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
