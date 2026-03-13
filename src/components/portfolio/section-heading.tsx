type SectionHeadingProps = {
  accent: string;
  label: string;
};

export function SectionHeading({ accent, label }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div
        className="h-px w-8"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
      <span
        className="text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        {label}
      </span>
    </div>
  );
}

