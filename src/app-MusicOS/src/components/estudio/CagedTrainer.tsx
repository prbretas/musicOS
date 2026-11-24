'use client';

/**
 * Escalas no CAGED: memorizar cada desenho da escala junto do acorde que
 * mora dentro dele.
 *
 *  - Estudar: escolha o tom e a forma; veja o acorde (anel branco) dentro da
 *    região da escala, só o acorde, ou só a escala.
 *  - Quiz: o app mostra um desenho e você responde qual forma é.
 *  - Improvisar: base em loop (baixo + acorde + metrônomo) com o desenho
 *    escolhido no braço e as notas do acorde da vez em destaque.
 *
 * Sempre violão/guitarra de 6 cordas na afinação padrão, que é onde o CAGED vale.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Fretboard } from '@/components/Fretboard';
import { SHAPE_ORDER, type CagedShape } from '@/lib/music/caged';
import {
  BACKING_PROGRESSIONS,
  STANDARD_GUITAR,
  backingVoicing,
  cagedPosition,
  gripMidis,
  type CagedQuality,
} from '@/lib/music/cagedGrips';
import { audioNow, playChordMidi, scheduleClick, scheduleNote } from '@/lib/audio/synth';
import type { NoteName } from '@/types/music';

const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_LABEL: Record<string, string> = { 'C#': 'C#/Db', 'D#': 'D#/Eb', 'F#': 'F#/Gb', 'G#': 'G#/Ab', 'A#': 'A#/Bb' };

type ScaleKind = 'full' | 'penta';
type Mode = 'study' | 'quiz' | 'improv';
type View = 'both' | 'chord' | 'scale';

const SCALE_OFFSETS: Record<CagedQuality, Record<ScaleKind, number[]>> = {
  major: { full: [0, 2, 4, 5, 7, 9, 11], penta: [0, 2, 4, 7, 9] },
  minor: { full: [0, 2, 3, 5, 7, 8, 10], penta: [0, 3, 5, 7, 10] },
};

function scaleNotes(keyPc: number, quality: CagedQuality, kind: ScaleKind): NoteName[] {
  return SCALE_OFFSETS[quality][kind].map((o) => NOTES[(keyPc + o) % 12]);
}

function shapeLabel(shape: CagedShape, quality: CagedQuality) {
  return quality === 'minor' ? `${shape}m` : shape;
}

function chordName(keyPc: number, quality: CagedQuality) {
  return NOTES[keyPc] + (quality === 'minor' ? 'm' : '');
}

const pill = (on: boolean) =>
  `px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
    on ? 'bg-brand-500 border-brand-400 text-white' : 'bg-ink-700 border-ink-600 text-slate-300 hover:border-ink-500'
  }`;

export function CagedTrainer() {
  const [mode, setMode] = useState<Mode>('study');
  const [keyPc, setKeyPc] = useState(0);
  const [quality, setQuality] = useState<CagedQuality>('major');
  const [kind, setKind] = useState<ScaleKind>('full');
  const [shape, setShape] = useState<CagedShape>('C');
  const [view, setView] = useState<View>('both');
  const [intervals, setIntervals] = useState(false);

  const pos = useMemo(() => cagedPosition(keyPc, quality, shape), [keyPc, quality, shape]);
  const notes = useMemo(() => scaleNotes(keyPc, quality, kind), [keyPc, quality, kind]);
  const endFret = Math.max(15, pos.window[1]);

  const keyLabel = `${FLAT_LABEL[NOTES[keyPc]] ?? NOTES[keyPc]} ${quality === 'major' ? 'maior' : 'menor'}`;

  return (
    <div className="card p-6 space-y-5">
      <div>
        <h3 className="text-xl font-bold text-white">Escalas no CAGED</h3>
        <p className="text-sm text-slate-400 mt-1">
          Cada desenho da escala fica em volta de um desenho de acorde. Grave os dois juntos: quando a música estiver num acorde com o desenho de C, você já sabe onde está a escala para improvisar.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Modo do treino CAGED">
        {(
          [
            ['study', '📖 Estudar'],
            ['quiz', '❓ Qual é a forma?'],
            ['improv', '🎸 Improvisar'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={mode === id} onClick={() => setMode(id)} className={pill(mode === id)}>
            {label}
          </button>
        ))}
      </div>

      {mode !== 'quiz' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-slate-400">
            Tom
            <select className="mt-1 block w-full" value={keyPc} onChange={(e) => setKeyPc(Number(e.target.value))}>
              {NOTES.map((n, i) => (
                <option key={n} value={i}>
                  {FLAT_LABEL[n] ?? n}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-400">
            Modo
            <select className="mt-1 block w-full" value={quality} onChange={(e) => setQuality(e.target.value as CagedQuality)}>
              <option value="major">Maior</option>
              <option value="minor">Menor</option>
            </select>
          </label>
          <label className="text-sm text-slate-400">
            Escala
            <select className="mt-1 block w-full" value={kind} onChange={(e) => setKind(e.target.value as ScaleKind)}>
              <option value="full">{quality === 'major' ? 'Maior (7 notas)' : 'Menor natural (7 notas)'}</option>
              <option value="penta">{quality === 'major' ? 'Pentatônica maior' : 'Pentatônica menor'}</option>
            </select>
          </label>
        </div>
      )}

      {mode !== 'quiz' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400 mr-1">Forma:</span>
          {SHAPE_ORDER.map((s) => (
            <button key={s} onClick={() => setShape(s)} className={pill(shape === s)}>
              {shapeLabel(s, quality)}
            </button>
          ))}
        </div>
      )}

      {mode === 'study' && (
        <StudyView
          pos={pos}
          notes={notes}
          keyPc={keyPc}
          quality={quality}
          keyLabel={keyLabel}
          view={view}
          setView={setView}
          intervals={intervals}
          setIntervals={setIntervals}
          endFret={endFret}
          onNext={() => setShape(SHAPE_ORDER[(SHAPE_ORDER.indexOf(shape) + 1) % SHAPE_ORDER.length])}
        />
      )}
      {mode === 'quiz' && <QuizView />}
      {mode === 'improv' && (
        <ImprovView pos={pos} notes={notes} keyPc={keyPc} quality={quality} keyLabel={keyLabel} endFret={endFret} intervals={intervals} setIntervals={setIntervals} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Estudar

function StudyView(props: {
  pos: ReturnType<typeof cagedPosition>;
  notes: NoteName[];
  keyPc: number;
  quality: CagedQuality;
  keyLabel: string;
  view: View;
  setView: (v: View) => void;
  intervals: boolean;
  setIntervals: (v: boolean) => void;
  endFret: number;
  onNext: () => void;
}) {
  const { pos, notes, keyPc, quality, keyLabel, view, setView, intervals, setIntervals, endFret, onNext } = props;
  const chord = chordName(keyPc, quality);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['both', 'Acorde + escala'],
            ['chord', 'Só o acorde'],
            ['scale', 'Só a escala'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} className={pill(view === id)}>
            {label}
          </button>
        ))}
        <label className="flex items-center gap-2 text-sm text-slate-300 ml-2 cursor-pointer">
          <input type="checkbox" checked={intervals} onChange={(e) => setIntervals(e.target.checked)} />
          Mostrar graus (R, 3, 5…)
        </label>
      </div>

      <Fretboard
        instrument="guitar"
        tuning={STANDARD_GUITAR}
        startFret={0}
        endFret={endFret}
        scale={{ root: notes[0], type: 'caged', notes }}
        fretWindows={[pos.window]}
        grip={view === 'scale' ? undefined : pos.grip}
        gripOnly={view === 'chord'}
        showIntervals={intervals}
      />

      <div className="rounded-xl bg-ink-700 border border-ink-600 p-4 text-sm text-slate-300 space-y-1">
        <p>
          <strong className="text-white">
            Forma {shapeLabel(pos.shape, quality)} de {keyLabel}
          </strong>
          : o acorde de <strong className="text-white">{chord}</strong> tocado com o desenho do {shapeLabel(pos.shape, quality)} aberto
          {pos.k > 0 ? `, com a “pestana” na casa ${pos.k}` : ' (posição aberta)'}. A escala ocupa as casas {pos.window[0]} a {pos.window[1]}.
        </p>
        <p className="text-slate-400">
          Como memorizar: toque o acorde, depois a escala só nessa região, voltando sempre às notas do acorde (anel branco). Repita nas 5 formas.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn-secondary" onClick={() => playChordMidi(gripMidis(pos), 1.6, 0.04)}>
          🔊 Ouvir o acorde
        </button>
        <button className="btn-secondary" onClick={onNext}>
          Próxima forma →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Quiz

type Difficulty = 'chord' | 'both' | 'scale';

interface Question {
  keyPc: number;
  quality: CagedQuality;
  shape: CagedShape;
}

function randomQuestion(prev: Question | null, allowMinor: boolean): Question {
  for (;;) {
    const q: Question = {
      keyPc: Math.floor(Math.random() * 12),
      quality: allowMinor && Math.random() < 0.4 ? 'minor' : 'major',
      shape: SHAPE_ORDER[Math.floor(Math.random() * SHAPE_ORDER.length)],
    };
    if (!prev || q.shape !== prev.shape || q.keyPc !== prev.keyPc) return q;
  }
}

function QuizView() {
  const [difficulty, setDifficulty] = useState<Difficulty>('both');
  const [minor, setMinor] = useState(false);
  const [q, setQ] = useState<Question>({ keyPc: 2, quality: 'major', shape: 'C' });
  const [answer, setAnswer] = useState<CagedShape | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 });

  // a primeira pergunta é sorteada só no navegador (evita diferença na hidratação)
  useEffect(() => setQ(randomQuestion(null, false)), []);

  const pos = useMemo(() => cagedPosition(q.keyPc, q.quality, q.shape), [q]);
  const notes = useMemo(() => scaleNotes(q.keyPc, q.quality, 'full'), [q]);

  function choose(s: CagedShape) {
    if (answer) return;
    setAnswer(s);
    const ok = s === q.shape;
    setScore((p) => ({ right: p.right + (ok ? 1 : 0), total: p.total + 1, streak: ok ? p.streak + 1 : 0 }));
  }

  function next() {
    setAnswer(null);
    setQ((prev) => randomQuestion(prev, minor));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400 mr-1">Dificuldade:</span>
        {(
          [
            ['chord', 'Fácil: só o acorde'],
            ['both', 'Médio: acorde + escala'],
            ['scale', 'Difícil: só a escala'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => setDifficulty(id)} className={pill(difficulty === id)}>
            {label}
          </button>
        ))}
        <label className="flex items-center gap-2 text-sm text-slate-300 ml-2 cursor-pointer">
          <input type="checkbox" checked={minor} onChange={(e) => setMinor(e.target.checked)} />
          Incluir tons menores
        </label>
      </div>

      <p className="text-white font-semibold">
        Tom de {chordName(q.keyPc, q.quality)}: qual forma do CAGED é esta?
      </p>

      <Fretboard
        instrument="guitar"
        tuning={STANDARD_GUITAR}
        startFret={0}
        endFret={15}
        scale={{ root: notes[0], type: 'caged', notes }}
        fretWindows={[pos.window]}
        grip={difficulty === 'scale' ? undefined : pos.grip}
        gripOnly={difficulty === 'chord'}
        showIntervals
      />

      <div className="flex flex-wrap gap-2">
        {SHAPE_ORDER.map((s) => {
          const isRight = answer && s === q.shape;
          const isWrong = answer === s && s !== q.shape;
          return (
            <button
              key={s}
              onClick={() => choose(s)}
              className={`px-5 py-2.5 rounded-lg font-bold border ${
                isRight
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : isWrong
                    ? 'bg-red-600 border-red-400 text-white'
                    : 'bg-ink-700 border-ink-600 text-slate-200 hover:border-brand-400'
              }`}
            >
              Forma {shapeLabel(s, q.quality)}
            </button>
          );
        })}
      </div>

      {answer && (
        <div className="flex flex-wrap items-center gap-3">
          <p className={answer === q.shape ? 'text-emerald-300' : 'text-red-300'}>
            {answer === q.shape
              ? 'Isso! '
              : `Era a forma ${shapeLabel(q.shape, q.quality)}. `}
            O acorde de {chordName(q.keyPc, q.quality)} está com o desenho do {shapeLabel(q.shape, q.quality)}
            {pos.k > 0 ? ` na casa ${pos.k}` : ' aberto'}.
          </p>
          <button className="btn-primary" onClick={next}>
            Próxima →
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Acertos: {score.right}/{score.total}
        {score.total > 0 && ` (${Math.round((score.right / score.total) * 100)}%)`} · Sequência: {score.streak}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- Improvisar

const LOOKAHEAD_MS = 25;
const AHEAD_S = 0.12;

function ImprovView(props: {
  pos: ReturnType<typeof cagedPosition>;
  notes: NoteName[];
  keyPc: number;
  quality: CagedQuality;
  keyLabel: string;
  endFret: number;
  intervals: boolean;
  setIntervals: (v: boolean) => void;
}) {
  const { pos, notes, keyPc, quality, keyLabel, endFret, intervals, setIntervals } = props;
  const progressions = BACKING_PROGRESSIONS[quality];
  const [progId, setProgId] = useState(progressions[0].id);
  const [bpm, setBpm] = useState(80);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const prog = progressions.find((p) => p.id === progId) ?? progressions[0];

  useEffect(() => {
    if (!progressions.some((p) => p.id === progId)) setProgId(progressions[0].id);
  }, [progressions, progId]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    if (!playing) return;
    const start = audioNow();
    if (start === null) return;
    const spb = 60 / bpm;
    const beatsPerChord = 4;
    let beat = 0;
    let next = start + 0.1;
    let stopped = false;
    let tick: ReturnType<typeof setTimeout> | null = null;

    const run = () => {
      const now = audioNow() ?? 0;
      while (next < now + AHEAD_S) {
        const chordIdx = Math.floor(beat / beatsPerChord) % prog.chords.length;
        const inBar = beat % beatsPerChord;
        const chord = prog.chords[chordIdx];
        const v = backingVoicing(keyPc, chord);
        scheduleClick(next, inBar === 0 ? 'accent' : 'beat', 0.35);
        if (inBar === 0 || inBar === 2) scheduleNote(v.bass, spb * 1.8, next, 0.3);
        if (inBar === 0) {
          v.triad.forEach((m) => scheduleNote(m, spb * 3.6, next, 0.12));
          const at = next;
          const id = setTimeout(() => !stopped && setCurrent(chordIdx), Math.max(0, (at - now) * 1000));
          timers.current.push(id);
        } else if (inBar === 2) {
          v.triad.forEach((m) => scheduleNote(m, spb * 1.6, next, 0.08));
        }
        beat += 1;
        next += spb;
      }
      tick = setTimeout(run, LOOKAHEAD_MS);
    };
    run();
    return () => {
      stopped = true;
      if (tick) clearTimeout(tick);
      stopAll();
    };
  }, [playing, bpm, prog, keyPc, stopAll]);

  const chord = prog.chords[current] ?? prog.chords[0];
  const chordRootPc = (keyPc + chord.degree) % 12;
  const chordTones: NoteName[] = [0, chord.quality === 'major' ? 4 : 3, 7].map((o) => NOTES[(chordRootPc + o) % 12]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={prog.id} onChange={(e) => setProgId(e.target.value)} aria-label="Progressão">
          {progressions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setPlaying((p) => !p)}
          className={`px-6 py-2.5 rounded-lg font-semibold text-white ${playing ? 'bg-red-600 hover:bg-red-500' : 'bg-brand-500 hover:bg-brand-400'}`}
        >
          {playing ? '■ Parar base' : '▶ Tocar base'}
        </button>
        <span className="text-sm text-slate-400 tabular-nums">{bpm} BPM</span>
        <input type="range" min={50} max={140} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} aria-label="Andamento da base" />
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={intervals} onChange={(e) => setIntervals(e.target.checked)} />
          Graus
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {prog.chords.map((c, i) => {
          const pcRoot = (keyPc + c.degree) % 12;
          return (
            <span
              key={i}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${
                playing && i === current ? 'bg-amber-400/15 border-amber-300 text-amber-200' : 'bg-ink-700 border-ink-600 text-slate-300'
              }`}
            >
              {c.label} · {NOTES[pcRoot]}
              {c.quality === 'minor' ? 'm' : ''}
            </span>
          );
        })}
      </div>

      <Fretboard
        instrument="guitar"
        tuning={STANDARD_GUITAR}
        startFret={0}
        endFret={endFret}
        scale={{ root: notes[0], type: 'caged', notes }}
        fretWindows={[pos.window]}
        chordNotes={chordTones}
        showIntervals={intervals}
      />

      <p className="text-sm text-slate-400">
        Improvise em {keyLabel} só dentro da forma {shapeLabel(pos.shape, quality)} (casas {pos.window[0]}–{pos.window[1]}). As notas com anel branco são do acorde que está tocando agora: termine as frases nelas. Quando estiver confortável, troque de forma sem parar a base.
      </p>
    </div>
  );
}
