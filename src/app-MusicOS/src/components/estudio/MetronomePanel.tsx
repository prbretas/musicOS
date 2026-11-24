'use client';

/**
 * Metronomo Digital - portado de script-metronome.js: agenda os cliques no
 * relogio do AudioContext (lookahead de 25 ms, 100 ms a frente) para nao atrasar.
 * Compasso 4/4 com o primeiro tempo acentuado.
 */

import { useEffect, useRef, useState } from 'react';
import { audioNow, scheduleClick } from '@/lib/audio/synth';

const PRESETS: { label: string; bpm: number; tone: string }[] = [
  { label: 'Grave (20-40)', bpm: 30, tone: 'border-emerald-500' },
  { label: 'Largo (45-50)', bpm: 45, tone: 'border-emerald-500' },
  { label: 'Adagio (55-65)', bpm: 55, tone: 'border-amber-500' },
  { label: 'Andante (75-107)', bpm: 75, tone: 'border-amber-500' },
  { label: 'Allegro (120)', bpm: 120, tone: 'border-rose-500' },
  { label: 'Vivace (144)', bpm: 144, tone: 'border-rose-500' },
  { label: 'Presto (180-200)', bpm: 180, tone: 'border-rose-500' },
  { label: 'Prestissimo (200+)', bpm: 200, tone: 'border-rose-500' },
];

const LOOKAHEAD_MS = 25;
const AHEAD_S = 0.1;

export function MetronomePanel() {
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);

  const bpmRef = useRef(bpm);
  const nextTime = useRef(0);
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  bpmRef.current = bpm;

  useEffect(() => {
    if (!playing) return;
    const start = audioNow();
    if (start === null) return;
    nextTime.current = start + 0.05;
    count.current = 0;

    const tick = () => {
      const now = audioNow() ?? 0;
      while (nextTime.current < now + AHEAD_S) {
        const b = count.current % 4;
        scheduleClick(nextTime.current, b === 0);
        const delay = Math.max(0, (nextTime.current - now) * 1000);
        setTimeout(() => setBeat(b + 1), delay);
        nextTime.current += 60 / bpmRef.current;
        count.current += 1;
      }
      timer.current = setTimeout(tick, LOOKAHEAD_MS);
    };
    tick();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      setBeat(0);
    };
  }, [playing]);

  const changeBpm = (v: number) => setBpm(Math.min(300, Math.max(20, Math.round(v) || 120)));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-4">
        <label htmlFor="bpm" className="text-slate-300">
          Tempo (BPM):
        </label>
        <input
          id="bpm"
          type="number"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          onBlur={(e) => changeBpm(Number(e.target.value))}
          className="w-20 bg-ink-700 border border-ink-500 rounded-lg px-2 py-2 text-xl font-bold text-center text-white"
        />
        <span className="text-xl font-bold text-brand-300">{bpm} BPM</span>
      </div>

      <input
        type="range"
        min={20}
        max={300}
        value={bpm}
        onChange={(e) => changeBpm(Number(e.target.value))}
        className="w-full"
        aria-label="Ajustar BPM"
      />

      <div className="flex justify-center gap-3" aria-hidden="true">
        {[1, 2, 3, 4].map((b) => (
          <span
            key={b}
            className={`w-4 h-4 rounded-full transition-colors ${
              beat === b ? (b === 1 ? 'bg-rose-500' : 'bg-brand-400') : 'bg-ink-600'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setPlaying((p) => !p)}
          className={`px-8 py-3 rounded-lg font-semibold text-white ${playing ? 'bg-red-600 hover:bg-red-500' : 'bg-brand-500 hover:bg-brand-400'}`}
        >
          {playing ? '■ Parar' : '▶ Iniciar'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => changeBpm(p.bpm)}
            className={`border ${p.tone} rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-ink-700`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
