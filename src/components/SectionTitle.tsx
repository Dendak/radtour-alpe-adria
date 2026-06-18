export function SectionTitle({
  eyebrow,
  title,
  hint,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-5 md:mb-6">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-sea">{eyebrow}</div>
      <h2 className="section-title mt-1">{title}</h2>
      {hint && <p className="mt-1.5 text-slate-500 text-sm md:text-base">{hint}</p>}
    </div>
  );
}
