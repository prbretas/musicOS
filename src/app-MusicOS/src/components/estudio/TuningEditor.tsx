'use client';

/**
 * Editor de afinação: escolha uma afinação pronta ou ajuste corda por corda
 * (meio tom acima/abaixo). Atalhos: baixar/subir tudo meio tom, "drop" na
 * corda mais grave e voltar ao padrão. O braço, os acordes e o afinador
 * acompanham a afinação escolhida.
 */

import {
  INSTRUMENTS,
  findTuning,
  pitchClassOf,
  pitchToMidi,
  transposePitch,
  type InstrumentType,
} from '@/lib/music/tunings';
import { playMidi } from '@/lib/audio/synth';
import { ProBadge } from '@/components/pro/ProBadge';

export function TuningEditor({
  instrument,
  tuning,
  onChange,
  locked,
}: {
  instrument: InstrumentType;
  tuning: string[];
  /** Recebe a nova afinação; o pai decide se pode (recurso Pro) */
  onChange: (pitches: string[]) => void;
  /** Mostra o selo PRO (usuário ainda não pode usar afinações alternativas) */
  locked: boolean;
}) {
  const def = INSTRUMENTS[instrument];
  const current = findTuning(instrument, tuning);
  const n = tuning.length;

  const shiftAll = (semis: number) => onChange(tuning.map((p) => transposePitch(p, semis)));
  const shiftOne = (index: number, semis: number) =>
    onChange(tuning.map((p, i) => (i === index ? transposePitch(p, semis) : p)));

  // "Drop": a corda mais grave desce um tom
  const lowestIndex = tuning.reduce((best, p, i) => (pitchToMidi(p) < pitchToMidi(tuning[best]) ? i : best), 0);

  const btn =
    'px-3 py-1.5 rounded-lg text-xs font-semibold bg-ink-600 text-slate-200 hover:bg-ink-500 border border-ink-500 transition-colors';

  return (
    <div className="rounded-xl border border-ink-600 bg-ink-900/40 p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-300 inline-flex items-center gap-2">
          Afinação {locked && <ProBadge />}
          <select
            value={current?.id ?? 'custom'}
            onChange={(e) => {
              const t = def.tunings.find((x) => x.id === e.target.value);
              if (t) onChange(t.pitches);
            }}
            aria-label="Afinação"
          >
            {def.tunings.map((t, i) => (
              <option key={t.id} value={t.id}>
                {t.label}
                {i > 0 && locked ? ' · PRO' : ''}
              </option>
            ))}
            {!current && <option value="custom">Personalizada</option>}
          </select>
        </label>

        <div className="flex flex-wrap gap-2 ml-auto">
          <button className={btn} onClick={() => shiftAll(-1)} title="Todas as cordas meio tom abaixo">
            − ½ tom (todas)
          </button>
          <button className={btn} onClick={() => shiftAll(1)} title="Todas as cordas meio tom acima">
            + ½ tom (todas)
          </button>
          <button className={btn} onClick={() => shiftOne(lowestIndex, -2)} title="A corda mais grave desce um tom">
            Drop (grave −1 tom)
          </button>
          <button className={btn} onClick={() => onChange(def.tunings[0].pitches)} disabled={current?.id === def.tunings[0].id}>
            Restaurar padrão
          </button>
        </div>
      </div>

      {/* Corda por corda: da mais aguda (1ª) à mais grave, como no instrumento */}
      <div className="flex flex-wrap gap-2">
        {tuning
          .map((pitch, i) => ({ pitch, i }))
          .reverse()
          .map(({ pitch, i }) => {
            const changed = pitchToMidi(pitch) !== pitchToMidi(def.tunings[0].pitches[i] ?? pitch);
            return (
              <div
                key={i}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 ${
                  changed ? 'border-pro-400/60 bg-pro-400/10' : 'border-ink-500 bg-ink-700'
                }`}
              >
                <span className="text-[10px] text-slate-500 w-5 text-right">{n - i}ª</span>
                <button
                  className="w-6 h-6 rounded text-slate-300 hover:bg-ink-500"
                  onClick={() => shiftOne(i, -1)}
                  aria-label={`Baixar a ${n - i}ª corda meio tom`}
                >
                  ▼
                </button>
                <button
                  className="min-w-[44px] text-center font-bold text-white text-sm hover:text-brand-300"
                  onClick={() => playMidi(pitchToMidi(pitch), 1)}
                  title="Ouvir a corda"
                >
                  {pitchClassOf(pitch)}
                  <span className="text-[10px] text-slate-500 align-top">{pitch.replace(/^[A-G]#?/, '')}</span>
                </button>
                <button
                  className="w-6 h-6 rounded text-slate-300 hover:bg-ink-500"
                  onClick={() => shiftOne(i, 1)}
                  aria-label={`Subir a ${n - i}ª corda meio tom`}
                >
                  ▲
                </button>
              </div>
            );
          })}
      </div>
      <p className="text-xs text-slate-500">
        Cordas em dourado estão fora da afinação padrão. Clique na nota para ouvir a corda.
      </p>
    </div>
  );
}
