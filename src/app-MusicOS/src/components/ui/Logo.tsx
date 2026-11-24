/** Marca do MusicOS: símbolo + wordmark. */

export function LogoMark({ className = 'w-8 h-8', animated = false }: { className?: string; animated?: boolean }) {
  const bar = animated ? 'eq-bar' : undefined;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mos-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a79ff" />
          <stop offset="1" stopColor="#5a48e6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#mos-g)" />
      {/* três barras = equalizador / notas da tríade */}
      <rect className={bar} x="12" y="26" width="6" height="12" rx="2" fill="#fff" opacity=".9" />
      <rect className={bar} x="21" y="16" width="6" height="22" rx="2" fill="#fff" />
      <rect className={bar} x="30" y="10" width="6" height="28" rx="2" fill="#f5b942" />
    </svg>
  );
}

export function Logo({ size = 'md', animated = false }: { size?: 'sm' | 'md' | 'lg'; animated?: boolean }) {
  const mark = size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-xl';
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={mark} animated={animated} />
      <span className={`${text} font-black tracking-tight text-white font-display`}>
        Music<span className="text-brand-300">OS</span>
      </span>
    </span>
  );
}
