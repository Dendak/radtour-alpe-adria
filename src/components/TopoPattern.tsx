/** Dekorativní vrstevnicový vzor do pozadí hera. */
export function TopoPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 400"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M0,320 C200,280 380,360 600,300 C820,240 1000,320 1200,270" />
        <path d="M0,290 C200,250 380,330 600,270 C820,210 1000,290 1200,240" />
        <path d="M0,260 C200,220 380,300 600,240 C820,180 1000,260 1200,210" />
        <path d="M0,230 C200,190 380,270 600,210 C820,150 1000,230 1200,180" />
        <path d="M0,200 C200,160 380,240 600,180 C820,120 1000,200 1200,150" />
        <path d="M0,170 C200,130 380,210 600,150 C820,90 1000,170 1200,120" />
        <path d="M0,140 C200,100 380,180 600,120 C820,60 1000,140 1200,90" />
      </g>
    </svg>
  );
}
