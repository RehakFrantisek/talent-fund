import { Donation, Talent } from "@/src/lib/types";

export const talents: Talent[] = [
  { id: "t1", name: "Filip Novotný", age: 16, category: "Sport", region: "Praha", bio: "Talentovaný juniorský tenista hledající podporu na evropské turnaje.", avatar: "/placeholders/talent-1.svg" },
  { id: "t2", name: "Anna Kovářová", age: 17, category: "Hudba", region: "Brno", bio: "Mladá houslistka připravující se na studium na Pražské konzervatoři.", avatar: "/placeholders/talent-2.svg" },
  { id: "t3", name: "Jan Filip", age: 18, category: "Technologie", region: "Ostrava", bio: "Student robotiky vyvíjející autonomní robotický projekt.", avatar: "/placeholders/talent-3.svg" },
  { id: "t4", name: "Karolína Králová", age: 15, category: "Sport", region: "Liberec", bio: "Atletka zaměřená na střední tratě a reprezentační přípravu.", avatar: "/placeholders/talent-5.svg" },
];

export const donations: Donation[] = [
  { id: "d1", campaignId: "sample", donorName: "Jan Král", amount: 1000, message: "Držím palce na turnaji!", createdAt: "2026-01-09" },
  { id: "d2", campaignId: "sample", donorName: "Petra Malá", amount: 1500, message: "Skvělý projekt, fandím!", createdAt: "2026-01-11" },
];
