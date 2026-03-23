export default function Badge({ text }: { text: string }) {
  return <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">{text}</span>;
}
