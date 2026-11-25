'use client';

/**
 * Metrônomo: agenda os cliques no relógio do AudioContext (lookahead de 25 ms,
 * 100 ms à frente) para não atrasar.
 *
 * - andamento de 20 a 300 BPM: campo, controle deslizante, ±1/±5 e tap tempo
 * - andamentos clássicos (Grave a Prestissimo)
 * - compassos simples e compostos (2/4 a 12/8), com acento no 1º tempo
 * - subdivisões (colcheia, tercina, semicolcheia) com clique mais suave
 * - volume
 */

import { useEffect, useRef, useState } from 'react';
import { audioNow, scheduleClick } from '@/lib/audio/synth';
import { useProFeature } from '@/components/pro/ProGate';
import { ProBadge } from '@/components/pro/ProBadge';

/** Compassos liberados no grátis */
const FREE_METERS = new Set(['1/4', '2/4', '3/4', '4/4']);

const TEMPOS: { label: string; range: string; bpm: number; tone: string }[] = [
  { label: 'Grave', range: '20–40', bpm: 35, tone: 'border-emerald-500' },
  { label: 'Largo', range: '40–60', bpm: 50, tone: 'border-emerald-500' },
  { label: 'Larghetto', range: '60–66', bpm: 63, tone: 'border-emerald-500' },
  { label: 'Adagio', range: '66–76', bpm: 70, tone: 'border-amber-500' },
  { label: 'Andante', range: '76–108', bpm: 92, tone: 'border-amber-500' },
  { label: 'Moderato', range: '108–120', bpm: 112, tone: 'border-amber-500' },
  { label: 'Allegretto', range: '112–120', bpm: 116, tone: 'border-amber-500' },
  { label: 'Allegro', range: '120–156', bpm: 132, tone: 'border-rose-500' },
  { label: 'Vivace', range: '156–176', bpm: 164, tone: 'border-rose-500' },
  { label: 'Presto', range: '168–200', bpm: 184, tone: 'border-rose-500' },
  { label: 'Prestissimo', range: '200+', bpm: 208, tone: 'border-rose-500' },
];

interface Meter {
  id: string;
  label: string;
  /** Pulsos que o metrônomo marca por compasso */
  beats: number;
  /** Acentos secundários (compassos compostos e irregulares) */
  accents: number[];
  /** Compasso composto: o pulso é a semínima pontuada, dividida em 3 */
  compound?: boolean;
}

const METERS: Meter[] = [
  { id: '1/4', label: 'Sem compasso', beats: 1, accents: [] },
  { id: '2/4', label: '2/4', beats: 2, accents: [] },
  { id: '3/4', label: '3/4', beats: 3, accents: [] },
  { id: '4/4', label: '4/4', beats: 4, accents: [] },
  { id: '5/4', label: '5/4', beats: 5, accents: [3] },
  { id: '6/8', label: '6/8', beats: 2, accents: [], compound: true },
  { id: '7/8', label: '7/8 (2+2+3)', beats: 7, accents: [2, 4] },
  { id: '9/8', label: '9/8', beats: 3, accents: [], compound: true },
  { id: '12/8', label: '12/8', beats: 4, accents: [], compound: true },
];

const SUBDIVISIONS: { id: number; label: string }[] = [
  { id: 1, label: 'Só o pulso' },
  { id: 2, label: 'Colcheias (2)' },
  { id: 3, label: 'Tercinas (3)' },
  { id: 4, label: 'Semicolcheias (4)' },
];

const LOOKAHEAD_MS = 25;
const AHEAD_S = 0.1;
const MIN_BPM = 20;
const MAX_BPM = 300;

const clampBpm = (v: number) => Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(v) || 120));

export function MetronomePanel() {
  const [bpm, setBpm] = useState(120);
  const [draft, setDraft] = useState('120');
  const [meterId, setMeterId] = useState('4/4');
  const [subdivision, setSubdivision] = useState(1);
  const [accentOn, setAccentOn] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const taps = useRef<number[]>([]);
  const metroPro = useProFeature('metronome-pro');

  const meter = METERS.find((m) => m.id === meterId) ?? METERS[3];
  // Compasso composto: pulso dividido em 3 (a subdivisão vira o grupo ternário)
  const subs = meter.compound ? Math.max(3, subdivision === 2 ? 3 : subdivision) : subdivision;

  const settings = useRef({ bpm, meter, subs, accentOn, volume });
  settings.current = { bpm, meter, subs, accentOn, volume };

  const nextTime = useRef(0);
  const tick = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    const start = audioNow();
    if (start === null) return;
    nextTime.current = start + 0.05;
    tick.current = 0;

    const loop = () => {
      const now = audioNow() ?? 0;
      while (nextTime.current < now + AHEAD_S) {
        const { bpm: b, meter: m, subs: sd, accentOn: acc, volume: vol } = settings.current;
        const perBar = m.beats * sd;
        const pos = tick.current % perBar;
        const beatIndex = Math.floor(pos / sd);
        const isBeat = pos % sd === 0;
        const level = !isBeat ? 'sub' : beatIndex === 0 && acc && m.beats > 1 ? 'accent' : m.accents.includes(beatIndex) && acc ? 'accent' : 'beat';
        scheduleClick(nextTime.current, level, beatIndex === 0 || !m.accents.includes(beatIndex) ? vol : vol * 0.8);
        if (isBeat) {
          const delay = Math.max(0, (nextTime.current - now) * 1000);
          setTimeout(() => setBeat(beatIndex + 1), delay);
        }
        nextTime.current += 60 / b / sd;
        tick.current += 1;
      }
      timer.current = setTimeout(loop, LOOKAHEAD_MS);
    };
    loop();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      setBeat(0);
    };
  }, [playing]);

  const changeBpm = (v: number) => {
    const next = clampBpm(v);
    setBpm(next);
    setDraft(String(next));
  };

  const tap = () => {
    const now = performance.now();
    const recent = taps.current.filter((t) => now - t < 2500);
    recent.push(now);
    taps.current = recent.slice(-6);
    if (taps.current.length >= 2) {
      const gaps = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      changeBpm(60000 / avg);
    }
  };

  const currentTempo = [...TEMPOS].reverse().find((t) => bpm >= t.bpm - 8) ?? TEMPOS[0];

  const stepBtn = 'w-11 h-10 rounded-lg bg-ink-600 hover:bg-ink-500 border border-ink-500 text-slate-200 font-bold';

  return (
    <div className="space-y-5">
      {/* Andamento */}
      <div className="text-center">
        <div className="text-5xl font-black text-white font-display tabular-nums">{bpm}</div>
        <div className="text-xs uppercase tracking-widest text-slate-500">BPM · {currentTempo.label}</div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button className={stepBtn} onClick={() => changeBpm(bpm - 5)} aria-label="Menos 5 BPM">
          −5
        </button>
        <button className={stepBtn} onClick={() => changeBpm(bpm - 1)} aria-label="Menos 1 BPM">
          −1
        </button>
        <input
          id="bpm"
          type="number"
          min={MIN_BPM}
          max={MAX_BPM}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => changeBpm(Number(draft))}
          onKeyDown={(e) => e.key === 'Enter' && changeBpm(Number(draft))}
          className="w-20 text-xl font-bold text-center"
          aria-label="Tempo em BPM"
        />
        <button className={stepBtn} onClick={() => changeBpm(bpm + 1)} aria-label="Mais 1 BPM">
          +1
        </button>
        <button className={stepBtn} onClick={() => changeBpm(bpm + 5)} aria-label="Mais 5 BPM">
          +5
        </button>
      </div>

      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        onChange={(e) => changeBpm(Number(e.target.value))}
        className="w-full"
        aria-label="Ajustar BPM"
      />

      {/* Pulsos do compasso */}
      <div className="flex justify-center gap-2 flex-wrap" aria-hidden="true">
        {Array.from({ length: meter.beats }).map((_, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full transition-colors ${
              beat === i + 1
                ? i === 0 && accentOn && meter.beats > 1
                  ? 'bg-rose-500'
                  : meter.accents.includes(i) && accentOn
                    ? 'bg-pro-400'
                    : 'bg-brand-400'
                : 'bg-ink-600'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          className={`px-8 py-3 rounded-lg font-semibold text-white ${playing ? 'bg-red-600 hover:bg-red-500' : 'bg-brand-500 hover:bg-brand-400'}`}
        >
          {playing ? '■ Parar' : '▶ Iniciar'}
        </button>
        <button onClick={tap} className="px-5 py-3 rounded-lg font-semibold bg-ink-600 hover:bg-ink-500 border border-ink-500 text-slate-200" title="Toque no ritmo para definir o andamento">
          Tap
        </button>
      </div>

      {/* Compasso, subdivisão, acento, volume */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-slate-400 space-y-1">
          <span className="flex items-center gap-1.5">Compasso {!metroPro.allowed && <ProBadge />}</span>
          <select
            value={meterId}
            onChange={(e) => {
              if (!FREE_METERS.has(e.target.value) && !metroPro.gate()) return;
              setMeterId(e.target.value);
            }}
            className="w-full"
          >
            {METERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
                {!FREE_METERS.has(m.id) && !metroPro.allowed ? '  ★ PRO' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400 space-y-1">
          <span className="flex items-center gap-1.5">Subdivisão {!metroPro.allowed && <ProBadge />}</span>
          <select
            value={subdivision}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v !== 1 && !metroPro.gate()) return;
              setSubdivision(v);
            }}
            className="w-full"
          >
            {SUBDIVISIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
                {s.id !== 1 && !metroPro.allowed ? '  ★ PRO' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={accentOn} onChange={(e) => setAccentOn(e.target.checked)} />
          Acentuar o 1º tempo
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Volume
          <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="flex-1" aria-label="Volume" />
        </label>
      </div>
      {meter.compound && <p className="text-xs text-slate-500">Compasso composto: o pulso é a semínima pontuada, dividida em 3.</p>}

      {/* Andamentos clássicos */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Andamentos clássicos</p>
        <div className="grid grid-cols-3 gap-2">
          {TEMPOS.map((t) => (
            <button
              key={t.label}
              onClick={() => changeBpm(t.bpm)}
              className={`border ${t.tone} rounded-lg px-2 py-1.5 text-left hover:bg-ink-700 ${currentTempo.label === t.label ? 'bg-ink-700' : ''}`}
            >
              <span className="block text-sm text-slate-200">{t.label}</span>
              <span className="block text-[10px] text-slate-500">{t.range}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
