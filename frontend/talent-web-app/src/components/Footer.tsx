export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white">
      <div className="container-app grid gap-8 py-10 text-sm text-zinc-500 md:grid-cols-2">
        <div>© {new Date().getFullYear()} Talent Fund · Platforma pro podporu mladých talentů.</div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-800">Provozovatel platformy</h3>
          <p className="text-zinc-700">Talent Support Platform</p>
          <p>Email: <a href="mailto:info@talentsupport.cz" className="text-zinc-700 underline">info@talentsupport.cz</a></p>
          <p>Telefon: <a href="tel:+420777123456" className="text-zinc-700 underline">+420 777 123 456</a></p>
          <p>V případě dotazů nás neváhejte kontaktovat.</p>
        </div>
      </div>
    </footer>
  );
}
