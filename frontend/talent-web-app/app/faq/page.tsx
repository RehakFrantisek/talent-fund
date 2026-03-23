import Accordion from "@/src/components/Accordion";

const faqItems = [
  { title: "Jak mohu podpořit projekt?", content: "Stačí si vybrat projekt a kliknout na tlačítko Podpořit. Poté zvolíte částku a potvrdíte podporu." },
  { title: "Je podpora bezpečná?", content: "Ano, všechny platby jsou zabezpečené a projekty procházejí základní kontrolou před zveřejněním." },
  { title: "Kdo může vytvořit projekt?", content: "Talentovaní mladí lidé s projektem, který chtějí rozvíjet – sportovci, hudebníci, vědci i tvůrci." },
  { title: "Co když projekt nedosáhne cílové částky?", content: "Podpora zůstává projektu a talent může finance využít na klíčové kroky uvedené v popisu kampaně." },
  { title: "Mohu sledovat průběh projektu?", content: "Ano, na detailu projektu najdete aktuality, průběžně vybranou částku a informace od talentu." },
  { title: "Mohu projekt sdílet?", content: "Ano, každý projekt má vlastní veřejnou stránku, kterou můžete snadno sdílet na sociálních sítích." },
];

export default function FaqPage() {
  return (
    <div className="container-app space-y-6 py-10">
      <h1 className="text-4xl font-black">Často kladené otázky</h1>
      <p className="max-w-3xl text-[#666]">Odpovědi na nejčastější dotazy podporovatelů i talentů na platformě Talent Fund.</p>
      <Accordion items={faqItems} />
    </div>
  );
}
