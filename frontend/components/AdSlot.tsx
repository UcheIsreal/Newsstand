type AdSlotProps = {
  label?: string;
  slot?: string;
  className?: string;
};

export default function AdSlot({ label = "Advertisement", slot, className = "" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!client || !slot) {
    return (
      <aside className={`flex min-h-28 items-center justify-center border border-dashed border-ink/20 bg-white/60 px-4 py-6 text-xs font-semibold uppercase tracking-[0.18em] text-ink/35 ${className}`}>
        {label}
      </aside>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
