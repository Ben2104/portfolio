type SectionHeadingProps = {
  accent: string;
  label: string;
};

export function SectionHeading({ accent, label }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div
        className="h-px w-12"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
      <span
        className="font-satoshi text-[12px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        {label}
      </span>
    </div>
  );
}
