'use client';

/**
 * Prática no instrumento: técnica, riffs e melodias com tablatura para tocar junto.
 *
 * A tab é calculada para o instrumento e a afinação escolhidos. O player toca a
 * frase (ou só o metrônomo), com contagem, loop e andamento ajustável, e
 * destaca a nota atual na tab.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORY_LABEL,
  FREE_PRACTICE_IDS,
  LEVEL_LABEL,
  PRACTICE,
  totalBeats,
  type PracticeCategory,
  type PracticeExercise,
} from '@/lib/music/practice';
import { computeTab } from '@/lib/music/tablature';
import { INSTRUMENTS, type InstrumentType } from '@/lib/music/tunings';
import { audioNow, scheduleClick, scheduleNote } from '@/lib/audio/synth';
import { useProFeature } from '@/components/pro/ProGate';
import { ProBadge } from '@/components/pro/ProBadge';
import { TabView } from './TabView';

const LOOKAHEAD_MS = 25;
const AHEAD_S = 0.12;
const STORAGE_KEY = 'musicos:practice:v1';

type Done = Record<string, { count: number; bestBpm: number }>;

function loadDone(): Done {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Done;
  } catch {
    return {};
  }
}

const LEVEL_COLOR: Record<string, string> = {
  iniciante: 'text-emerald-300',
  intermediario: 'text-amber-300',
  avancado: 'text-rose-300',
};

export function PracticeSection({ instrument, tuning }: { instrument: InstrumentType; tuning: string[] }) {
  const practicePro = useProFeature('practice');
  const def = INSTRUMENTS[instrument];

  const [selectedId, setSelectedId] = useState(PRACTICE.find((p) => p.free)!.id);
  const [bpm, setBpm] = useState(PRACTICE.find((p) => p.free)!.bpm);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [melodyOn, setMelodyOn] = useState(true);
  const [clickOn, setClickOn] = useState(true);
  const [loop, setLoop] = useState(true);
  const [countIn, setCountIn] = useState(true);
  const [showNames, setShowNames] = useState(false);
  const [done, setDone] = useState<Done>({});

  useEffect(() => setDone(loadDone()), []);

  const exercise = PRACTICE.find((p) => p.id === selectedId)!;

  // Notas e tab para o instrumento/afinação atual
  const prepared = useMemo(() => {
    if (exercise.build) {
      const built = exercise.build(tuning, def.stringStartFret);
      return { notes: built.notes, positions: built.positions, shift: 0 };
    }
    const notes = exercise.notes!;
    const tab = computeTab(
      notes.map((x) => x.m),
      { tuning, stringStartFret: def.stringStartFret, maxFret: def.frets, position: exercise.position, preferLowOctave: def.bass }
    );
    return tab ? { notes, positions: tab.positions, shift: tab.shift } : null;
  }, [exercise, tuning, def]);

  function select(ex: PracticeExercise) {
    if (!FREE_PRACTICE_IDS.has(ex.id) && !practicePro.gate()) return;
    setPlaying(false);
    setSelectedId(ex.id);
    setBpm(ex.bpm);
    setCurrent(null);
  }

  // ------------------------------------------------------------ player
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (!playing || !prepared) return;
    const start = audioNow();
    if (start === null) return;

    const spb = 60 / bpm;
    const meter = exercise.meter;
    const total = totalBeats(prepared.notes);
    const offset = exercise.pickup ? meter - exercise.pickup : 0;

    // eventos de uma passada: cliques em cada tempo + notas
    type Ev = { beat: number; kind: 'click'; accent: boolean } | { beat: number; kind: 'note'; i: number; midi: number; dur: number };
    const events: Ev[] = [];
    for (let b = 0; b < Math.ceil(total - 1e-9); b++) events.push({ beat: b, kind: 'click', accent: (b + offset) % meter === 0 });
    let t = 0;
    prepared.notes.forEach((note, i) => {
      if (note.m !== null) events.push({ beat: t, kind: 'note', i, midi: note.m + prepared.shift, dur: note.d });
      t += note.d;
    });
    events.sort((a, b) => a.beat - b.beat || (a.kind === 'click' ? -1 : 1));

    let passStart = start + 0.1;
    if (countIn) {
      for (let k = 0; k < meter; k++) scheduleClick(passStart + k * spb, k === 0 ? 'accent' : 'beat', 0.9);
      passStart += meter * spb;
    }
    let idx = 0;
    let stopped = false;
    let tick: ReturnType<typeof setTimeout> | null = null;

    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, Math.max(0, ms));
      timers.current.push(id);
    };

    const loopFn = () => {
      const now = audioNow() ?? 0;
      for (;;) {
        if (idx >= events.length) {
          if (!loop) {
            later(() => {
              setPlaying(false);
              setCurrent(null);
            }, (passStart + total * spb - now) * 1000);
            return;
          }
          passStart += total * spb;
          idx = 0;
        }
        const ev = events[idx];
        const at = passStart + ev.beat * spb;
        if (at > now + AHEAD_S) break;
        if (ev.kind === 'click') {
          if (clickOn) scheduleClick(at, ev.accent ? 'accent' : 'beat', melodyOn ? 0.5 : 0.9);
        } else {
          if (melodyOn) scheduleNote(ev.midi, ev.dur * spb * 0.95, at, 0.22);
          const i = ev.i;
          later(() => !stopped && setCurrent(i), (at - now) * 1000);
        }
        idx += 1;
      }
      tick = setTimeout(loopFn, LOOKAHEAD_MS);
    };
    loopFn();

    return () => {
      stopped = true;
      if (tick) clearTimeout(tick);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setCurrent(null);
    };
  }, [playing, bpm, melodyOn, clickOn, loop, countIn, prepared, exercise]);

  function markDone() {
    const prev = done[exercise.id] ?? { count: 0, bestBpm: 0 };
    const next = { ...done, [exercise.id]: { count: prev.count + 1, bestBpm: Math.max(prev.bestBpm, bpm) } };
    setDone(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sem armazenamento: segue */
    }
  }

  const categories = Object.keys(CATEGORY_LABEL) as PracticeCategory[];
  const pct = Math.round((bpm / exercise.bpm) * 100);
  const stat = done[exercise.id];

  return (
    <div className="card p-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Lista */}
      <div className="space-y-4 lg:max-h-[640px] lg:overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">{CATEGORY_LABEL[cat]}</p>
            <div className="space-y-1.5">
              {PRACTICE.filter((p) => p.category === cat).map((p) => {
                const locked = !FREE_PRACTICE_IDS.has(p.id) && !practicePro.allowed;
                const active = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    onClick={() => select(p)}
                    className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${
                      active ? 'bg-brand-500/15 border-brand-400' : 'bg-ink-700 border-ink-600 hover:border-ink-500'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${locked ? 'text-slate-400' : 'text-white'}`}>{p.title}</span>
                      {done[p.id] && <span className="text-emerald-400 text-xs" title="Praticado">✓</span>}
                      {locked && <ProBadge className="ml-auto" />}
                      {!locked && p.free && !practicePro.allowed && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider text-emerald-300">grátis</span>
                      )}
                    </span>
                    <span className={`text-[11px] ${LEVEL_COLOR[p.level]}`}>{LEVEL_LABEL[p.level]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Exercício */}
      <div className="space-y-4 min-w-0">
        <div>
          <h3 className="text-xl font-bold text-white">{exercise.title}</h3>
          <p className="text-sm text-slate-400 mt-1">{exercise.description}</p>
          <p className="text-xs text-slate-500 mt-1">
            {exercise.source === 'original' ? 'Composição original MusicOS' : `Domínio público · ${exercise.credit}`} ·{' '}
            {exercise.meter}/4 · {LEVEL_LABEL[exercise.level]}
            {prepared && prepared.shift !== 0 && ` · transposta ${prepared.shift > 0 ? '+' : ''}${prepared.shift / 12} oitava(s) para caber no ${def.label.toLowerCase()}`}
          </p>
        </div>

        {prepared ? (
          <TabView
            notes={prepared.notes}
            positions={prepared.positions}
            tuning={tuning}
            meter={exercise.meter}
            pickup={exercise.pickup}
            shift={prepared.shift}
            current={current}
            showNames={showNames}
          />
        ) : (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            Este exercício não cabe na extensão do {def.label.toLowerCase()} nesta afinação. Escolha outro exercício ou outro instrumento.
          </div>
        )}

        {exercise.tip && <p className="text-sm text-slate-300">💡 {exercise.tip}</p>}

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={!prepared}
            className={`px-6 py-2.5 rounded-lg font-semibold text-white disabled:opacity-40 ${
              playing ? 'bg-red-600 hover:bg-red-500' : 'bg-brand-500 hover:bg-brand-400'
            }`}
          >
            {playing ? '■ Parar' : '▶ Tocar junto'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 tabular-nums w-24">{bpm} BPM ({pct}%)</span>
            <input
              type="range"
              min={Math.max(30, Math.round(exercise.bpm * 0.4))}
              max={Math.round(exercise.bpm * 1.5)}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              aria-label="Andamento"
            />
          </div>
          <div className="flex gap-1">
            {[50, 75, 100].map((p) => (
              <button
                key={p}
                onClick={() => setBpm(Math.round((exercise.bpm * p) / 100))}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border ${
                  pct === p ? 'bg-ink-500 border-ink-500 text-white' : 'border-ink-500 text-slate-300 hover:bg-ink-600'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={melodyOn} onChange={(e) => setMelodyOn(e.target.checked)} />
            Ouvir a frase
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={clickOn} onChange={(e) => setClickOn(e.target.checked)} />
            Metrônomo
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={countIn} onChange={(e) => setCountIn(e.target.checked)} />
            Contagem antes
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
            Repetir
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} />
            Nomes das notas
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-ink-600">
          <button onClick={markDone} className="btn-secondary">
            ✓ Toquei sem errar
          </button>
          <span className="text-xs text-slate-500">
            {stat
              ? `Praticado ${stat.count}× · melhor andamento ${stat.bestBpm} BPM (meta: ${exercise.bpm})`
              : `Meta: tocar limpo a ${exercise.bpm} BPM. Comece devagar.`}
          </span>
        </div>
      </div>
    </div>
  );
}
