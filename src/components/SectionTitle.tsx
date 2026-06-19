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
    <div className="mb-6 md:mb-8">
      <div className="eyebrow">
        <span className="inline-block w-6 h-px bg-sea/60" />
        {eyebrow}
      </div>
      <h2 className="section-title mt-2">{title}</h2>
      {hint && <p className="mt-2 text-slate-500 text-sm md:text-[1.02rem] max-w-2xl">{hint}</p>}
    </div>
  );
}
