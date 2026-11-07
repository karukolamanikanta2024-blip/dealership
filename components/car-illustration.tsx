export default function CarIllustration({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 320 140" role="img" aria-label={label} className="w-full">
      <rect width="320" height="140" className="fill-neutral-100" />
      <rect x="30" y="126" width="260" height="2" className="fill-neutral-200" />
      <rect x="36" y="70" width="248" height="38" rx="14" className="fill-neutral-300" />
      <path d="M96 72 L120 46 Q124 42 132 42 H196 Q204 42 208 46 L236 72 Z" className="fill-neutral-300" />
      <path d="M110 68 L128 50 H150 V68 Z" className="fill-neutral-100" />
      <path d="M160 68 V50 H194 L216 68 Z" className="fill-neutral-100" />
      <circle cx="90" cy="108" r="20" className="fill-neutral-700" />
      <circle cx="90" cy="108" r="8" className="fill-neutral-200" />
      <circle cx="230" cy="108" r="20" className="fill-neutral-700" />
      <circle cx="230" cy="108" r="8" className="fill-neutral-200" />
    </svg>
  );
}