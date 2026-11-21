'use client';

/**
 * MusicOS - Estudio de Escalas.
 * Layout e conteudo portados do MusicPages (src/musicpages): um seletor de
 * tonica/escala no topo controla todas as secoes da pagina.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SCALES, SCALE_GROUP_LABELS, buildScale, harmonicField, type ScaleGroup } from '@/lib/music/escalas';
import { Section } from '@/components/estudio/Section';
import { ScaleHeroCard } from '@/components/estudio/ScaleHeroCard';
import { IntervalTable } from '@/components/estudio/IntervalTable';
import { ScaleNotesPanel } from '@/components/estudio/ScaleNotesPanel';
import { PianoKeyboard } from '@/components/estudio/PianoKeyboard';
import { FretboardSection, type InstrumentType } from '@/components/estudio/FretboardSection';
import { ChordFieldViewer } from '@/components/estudio/ChordFieldViewer';
import { CircleOfFifths } from '@/components/estudio/CircleOfFifths';
import { FloatingPanel } from '@/components/estudio/FloatingPanel';
import { MetronomePanel } from '@/components/estudio/MetronomePanel';
import { ScaleStructuresTable } from '@/components/estudio/ScaleStructuresTable';

const TONICS = ['C', 'C# / Db', 'D', 'D# / Eb', 'E', 'F', 'F# / Gb', 'G', 'G# / Ab', 'A', 'A# / Bb', 'B'];

const NAV = [
  ['escala', 'Escala'],
  ['intervalos', 'Intervalos'],
  ['transpositor', 'Notas e Campo'],
  ['teclado', 'Teclado'],
  ['braco', 'Braço'],
  ['acordes', 'Acordes'],
  ['ciclo', 'Ciclo de Quintas'],
] as const;

const OTHER_SCREENS = [
  ['/dashboard', 'Dashboard'],
  ['/dashboard/exercises', 'Exercícios'],
  ['/dashboard/tools', 'Ferramentas'],
  ['/pricing', 'Planos'],
  ['/login', 'Login'],
  ['/signup', 'Cadastro'],
];

export default function EstudioPage() {
  const [rootPc, setRootPc] = useState(0);
  const [scaleKey, setScaleKey] = useState('maior');
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');
  const [tetrads, setTetrads] = useState(true);
  const [panel, setPanel] = useState<'metronomo' | 'estruturas' | null>(null);

  const scale = useMemo(() => buildScale(rootPc, scaleKey), [rootPc, scaleKey]);
  const field = useMemo(() => harmonicField(scale, tetrads), [scale, tetrads]);
  const keyPc = scale.def.parentOffset !== undefined ? (rootPc + scale.def.parentOffset) % 12 : null;

  const groups = (Object.keys(SCALE_GROUP_LABELS) as ScaleGroup[]).map((g) => ({
    group: g,
    scales: SCALES.filter((s) => s.group === g),
  }));

  const select = 'bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm';
  const toolBtn = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-semibold ${active ? 'bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`;

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-slate-200 flex flex-col">
      {/* Topbar fixa: tonica, escala, instrumento e ferramentas */}
      <header className="sticky top-0 z-40 bg-[#141414]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Link href="/" className="text-xl font-black text-white mr-auto">
            🎵 MusicOS
          </Link>

          <label className="sr-only" htmlFor="tonica">
            Tônica
          </label>
          <select id="tonica" value={rootPc} onChange={(e) => setRootPc(Number(e.target.value))} className={select}>
            {TONICS.map((t, i) => (
              <option key={t} value={i}>
                {t}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="tipoEscala">
            Escala
          </label>
          <select id="tipoEscala" value={scaleKey} onChange={(e) => setScaleKey(e.target.value)} className={select}>
            {groups.map(({ group, scales }) => (
              <optgroup key={group} label={`- ${SCALE_GROUP_LABELS[group]} -`}>
                {scales.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <label className="sr-only" htmlFor="instrumento">
            Instrumento
          </label>
          <select
            id="instrumento"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value as InstrumentType)}
            className={select}
          >
            <option value="guitar">🎸 Guitarra / Violão</option>
            <option value="ukulele">🪕 Ukulele</option>
          </select>

          <button onClick={() => setPanel(panel === 'metronomo' ? null : 'metronomo')} className={toolBtn(panel === 'metronomo')}>
            ⏱ Metrônomo
          </button>
          <button onClick={() => setPanel(panel === 'estruturas' ? null : 'estruturas')} className={toolBtn(panel === 'estruturas')}>
            📖 Estruturas
          </button>
        </div>

        <nav className="max-w-6xl mx-auto px-4 pb-2 flex gap-4 overflow-x-auto text-sm" aria-label="Seções">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-slate-400 hover:text-white whitespace-nowrap">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-8 space-y-14 flex-1">
        <section id="escala" className="scroll-mt-28">
          <ScaleHeroCard scale={scale} rootPc={rootPc} />
        </section>

        <Section id="intervalos" icon="📊" title={`Tabela de Intervalos - ${scale.root} ${scale.def.label}`}>
          <IntervalTable scale={scale} />
        </Section>

        <Section id="transpositor" icon="🎹" title="Transpositor de Escalas Musicais">
          <ScaleNotesPanel scale={scale} field={field} tetrads={tetrads} onTetradsChange={setTetrads} />
        </Section>

        <Section id="teclado" icon="🎹" title="Teclado">
          <PianoKeyboard scale={scale} />
        </Section>

        <Section id="braco" icon="🎸" title={`Braço do Instrumento — ${instrument === 'guitar' ? 'Guitarra' : 'Ukulele'}`}>
          <FretboardSection scale={scale} instrument={instrument} />
        </Section>

        <Section id="acordes" icon="🎸" title={`Visualizador de Acordes — ${tetrads ? 'tétrades' : 'tríades'}`}>
          <ChordFieldViewer field={field} />
        </Section>

        <Section id="ciclo" icon="⭕" title="Ciclo de Quintas">
          <CircleOfFifths
            keyPc={keyPc}
            minor={scale.def.parentOffset === 3}
            onApply={(pcValue, key) => {
              setRootPc(pcValue);
              setScaleKey(key);
            }}
          />
        </Section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500 space-x-4">
        {OTHER_SCREENS.map(([href, label]) => (
          <Link key={href} href={href} className="hover:text-slate-300">
            {label}
          </Link>
        ))}
      </footer>

      {panel === 'metronomo' && (
        <FloatingPanel title="Metrônomo Digital" onClose={() => setPanel(null)}>
          <MetronomePanel />
        </FloatingPanel>
      )}
      {panel === 'estruturas' && (
        <FloatingPanel title="📖 Estruturas de Escalas" onClose={() => setPanel(null)} wide>
          <ScaleStructuresTable
            current={scaleKey}
            onSelect={(k) => {
              setScaleKey(k);
              setPanel(null);
            }}
          />
        </FloatingPanel>
      )}
    </div>
  );
}
