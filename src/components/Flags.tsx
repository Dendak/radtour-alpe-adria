// Malé SVG vlajky AT/IT — emoji vlajky (🇦🇹🇮🇹) se na Windows
// vykreslují jako holý text „AT IT", proto vlastní vektory.

export function FlagAT({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} role="img" aria-label="Rakousko">
      <defs>
        <clipPath id="flag-at-round">
          <rect width="24" height="16" rx="2.5" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-at-round)">
        <rect width="24" height="16" fill="#ffffff" />
        <rect width="24" height="5.34" fill="#C8102E" />
        <rect y="10.66" width="24" height="5.34" fill="#C8102E" />
      </g>
      <rect width="24" height="16" rx="2.5" fill="none" stroke="rgba(15,23,42,0.15)" />
    </svg>
  );
}

export function FlagIT({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} role="img" aria-label="Itálie">
      <defs>
        <clipPath id="flag-it-round">
          <rect width="24" height="16" rx="2.5" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-it-round)">
        <rect width="24" height="16" fill="#ffffff" />
        <rect width="8" height="16" fill="#009246" />
        <rect x="16" width="8" height="16" fill="#CE2B37" />
      </g>
      <rect width="24" height="16" rx="2.5" fill="none" stroke="rgba(15,23,42,0.15)" />
    </svg>
  );
}
