export default function Progress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2.5 w-full rounded-full bg-zinc-200">
      <div className="h-2.5 rounded-full bg-[#F5A623] transition-all duration-300" style={{ width: `${clamped}%` }} />
    </div>
  );
}
