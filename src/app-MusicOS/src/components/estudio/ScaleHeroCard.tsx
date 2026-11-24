'use client';

/**
 * Cartao principal da escala (portado de script-scale-hero.js):
 * tonica em letra grande, sonoridade, sentimentos, uso e musicas.
 */

import { SCALE_INFO } from '@/lib/music/scale-info';
import { pc, type BuiltScale } from '@/lib/music/escalas';
import { RichText } from './Section';
import { ScaleCircle } from './ScaleCircle';
import { Spotlight } from '@/components/ui/Spotlight';

function examplesFor(scale: BuiltScale): string[] {
  const info = SCALE_INFO[scale.def.key];
  if (!info) return [];
  const byTonic =
    info.exemplos[scale.root] ??
    Object.entries(info.exemplos).find(([k]) => k !== 'default' && pc(k) === pc(scale.root))?.[1];
  return byTonic ?? info.exemplos.default ?? [];
}

export function ScaleHeroCard({ scale, rootPc }: { scale: BuiltScale; rootPc: number }) {
  const info = SCALE_INFO[scale.def.key] ?? SCALE_INFO.maior;
  const examples = examplesFor(scale);
  const tiles = [
    { label: 'Sonoridade', text: info.sonoridade, icon: '🔊' },
    { label: 'Sentimentos despertados', text: info.sentimentos, icon: '💫' },
    { label: 'Uso comum', text: info.uso, icon: '🎼' },
  ];

  return (
    <Spotlight className="card gradient-border relative overflow-hidden p-6 md:p-10">
      {/* luzes de fundo */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-pro-400/10 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="eyebrow">Teoria · Escala</p>
          <div className="mt-3 mb-6 flex flex-wrap items-end gap-x-5 gap-y-2">
            <span key={scale.root} className="glow-pulse text-gradient font-display text-8xl md:text-9xl font-black leading-[0.85] tracking-tighter animate-pop-in">
              {scale.root}
            </span>
            <span className="pb-2 text-3xl md:text-4xl font-bold text-slate-100 font-display">{info.label}</span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {scale.notes.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className={`grid h-10 min-w-10 place-items-center rounded-xl px-2.5 text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5 ${
                  i === 0
                    ? 'bg-gradient-to-br from-pro-200 to-pro-500 text-ink-900 shadow-glow-pro'
                    : 'bg-white/[0.05] text-white ring-1 ring-white/10'
                }`}
              >
                {n}
              </span>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 transition-colors hover:border-brand-400/30 hover:bg-brand-500/[0.06]">
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span aria-hidden="true">{t.icon}</span>
                  {t.label}
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  <RichText text={t.text} />
                </p>
              </div>
            ))}
          </div>

          {examples.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <span key={ex} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                  🎵 {ex}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="justify-self-center rounded-3xl border border-white/[0.06] bg-ink-950/40 p-4">
          <ScaleCircle rootPc={rootPc} scaleKey={scale.def.key} />
        </div>
      </div>
    </Spotlight>
  );
}
