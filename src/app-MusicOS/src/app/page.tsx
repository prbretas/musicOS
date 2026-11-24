'use client';

/**
 * MusicOS — Estúdio.
 *
 * É o app inteiro numa página: um seletor de tônica/escala no topo controla
 * todas as seções. Funciona sem cadastro (modo grátis). Os recursos Pro
 * aparecem com selo e, ao clicar, abrem o modal de upgrade.
 */

import { useMemo, useState } from 'react';
import { SCALES, SCALE_GROUP_LABELS, buildScale, harmonicField, type ScaleGroup } from '@/lib/music/escalas';
import { isScaleFree } from '@/lib/features';
import { INSTRUMENTS, INSTRUMENT_LABELS, INSTRUMENT_ORDER, FREE_INSTRUMENT, standardTuning, type InstrumentType } from '@/lib/music/tunings';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Section } from '@/components/estudio/Section';
import { ScaleHeroCard } from '@/components/estudio/ScaleHeroCard';
import { IntervalTable } from '@/components/estudio/IntervalTable';
import { ScaleNotesPanel } from '@/components/estudio/ScaleNotesPanel';
import { PianoKeyboard } from '@/components/estudio/PianoKeyboard';
import { FretboardSection } from '@/components/estudio/FretboardSection';
import { ChordFieldViewer } from '@/components/estudio/ChordFieldViewer';
import { CircleOfFifths } from '@/components/estudio/CircleOfFifths';
import { FloatingPanel } from '@/components/estudio/FloatingPanel';
import { MetronomePanel } from '@/components/estudio/MetronomePanel';
import { ScaleStructuresTable } from '@/components/estudio/ScaleStructuresTable';
import { TunerPanel } from '@/components/estudio/TunerPanel';
import { ExercisesSection } from '@/components/estudio/ExercisesSection';
import { ExtendedChordsSection } from '@/components/estudio/ExtendedChordsSection';
import { ProGate, useProFeature } from '@/components/pro/ProGate';
import { ProBadge } from '@/components/pro/ProBadge';
import { useUpgrade } from '@/components/pro/UpgradeProvider';
import { useAuth } from '@/components/providers/AuthProvider';

const TONICS = ['C', 'C# / Db', 'D', 'D# / Eb', 'E', 'F', 'F# / Gb', 'G', 'G# / Ab', 'A', 'A# / Bb', 'B'];

const NAV = [
  ['escala', 'Escala'],
  ['intervalos', 'Intervalos'],
  ['transpositor', 'Notas e Campo'],
  ['teclado', 'Teclado'],
  ['braco', 'Braço'],
  ['acordes', 'Acordes'],
  ['tetrades', 'Tétrades'],
  ['ciclo', 'Ciclo de Quintas'],
  ['exercicios', 'Exercícios'],
] as const;

type Panel = 'metronomo' | 'estruturas' | 'afinador' | null;

export default function EstudioPage() {
  const [rootPc, setRootPc] = useState(0);
  const [scaleKey, setScaleKey] = useState('maior');
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');
  const [tuning, setTuning] = useState<string[]>(standardTuning('guitar'));
  const [tetrads, setTetrads] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  const { entitlement } = useAuth();
  const { openUpgrade } = useUpgrade();
  const scalesPro = useProFeature('scales-advanced');
  const tetradsPro = useProFeature('tetrads');
  const instrumentsPro = useProFeature('instruments');
  const tunerPro = useProFeature('tuner');
  const exportPro = useProFeature('export');

  const scale = useMemo(() => buildScale(rootPc, scaleKey), [rootPc, scaleKey]);
  const useTetrads = tetrads && tetradsPro.allowed;
  const field = useMemo(() => harmonicField(scale, useTetrads), [scale, useTetrads]);
  const triadField = useMemo(() => harmonicField(scale, false), [scale]);
  const keyPc = scale.def.parentOffset !== undefined ? (rootPc + scale.def.parentOffset) % 12 : null;

  const groups = (Object.keys(SCALE_GROUP_LABELS) as ScaleGroup[]).map((g) => ({
    group: g,
    scales: SCALES.filter((s) => s.group === g),
  }));

  function pickScale(key: string) {
    if (!isScaleFree(key) && !scalesPro.gate()) return;
    setScaleKey(key);
  }

  function pickInstrument(value: InstrumentType) {
    if (value !== FREE_INSTRUMENT && !instrumentsPro.gate()) return;
    setInstrument(value);
    setTuning(standardTuning(value));
  }

  function toggleTetrads(v: boolean) {
    if (v && !tetradsPro.gate()) return;
    setTetrads(v);
  }

  function togglePanel(p: Exclude<Panel, null>) {
    if (p === 'afinador' && !tunerPro.gate()) return;
    setPanel(panel === p ? null : p);
  }

  function handlePrint() {
    if (!exportPro.gate()) return;
    window.print();
  }

  const toolBtn = (active: boolean) =>
    `btn ${active ? 'bg-brand-500 text-white' : 'bg-ink-600 text-slate-200 hover:bg-ink-500 border border-ink-500'}`;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        nav={
          <nav className="pb-2 -mt-1 flex gap-1 overflow-x-auto text-sm no-print" aria-label="Seções">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-ink-600 whitespace-nowrap transition-colors"
              >
                {label}
                {id === 'exercicios' && !entitlement.isPro && <ProBadge className="ml-1.5" />}
              </a>
            ))}
          </nav>
        }
      >
        <label className="sr-only" htmlFor="tonica">
          Tônica
        </label>
        <select id="tonica" value={rootPc} onChange={(e) => setRootPc(Number(e.target.value))}>
          {TONICS.map((t, i) => (
            <option key={t} value={i}>
              {t}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="tipoEscala">
          Escala
        </label>
        <select id="tipoEscala" value={scaleKey} onChange={(e) => pickScale(e.target.value)} className="max-w-[240px]">
          {groups.map(({ group, scales }) => (
            <optgroup key={group} label={`— ${SCALE_GROUP_LABELS[group]} —`}>
              {scales.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                  {!isScaleFree(s.key) && !scalesPro.allowed ? ' · PRO' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <label className="sr-only" htmlFor="instrumento">
          Instrumento
        </label>
        <select id="instrumento" value={instrument} onChange={(e) => pickInstrument(e.target.value as InstrumentType)}>
          {INSTRUMENT_ORDER.map((id) => (
            <option key={id} value={id}>
              {INSTRUMENTS[id].emoji} {INSTRUMENTS[id].label}
              {id !== FREE_INSTRUMENT && !instrumentsPro.allowed ? ' · PRO' : ''}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 ml-auto no-print">
          <button onClick={() => togglePanel('metronomo')} className={toolBtn(panel === 'metronomo')}>
            ⏱ Metrônomo
          </button>
          <button onClick={() => togglePanel('estruturas')} className={toolBtn(panel === 'estruturas')}>
            📖 Estruturas
          </button>
          <button onClick={() => togglePanel('afinador')} className={toolBtn(panel === 'afinador')}>
            🎤 Afinador
            {!tunerPro.allowed && <ProBadge />}
          </button>
          <button onClick={handlePrint} className={toolBtn(false)} title="Imprimir ou salvar em PDF">
            🖨 Exportar
            {!exportPro.allowed && <ProBadge />}
          </button>
        </div>
      </SiteHeader>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-14 flex-1">
        {!entitlement.isPro && (
          <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-pro-400/30 bg-gradient-to-r from-pro-400/10 to-transparent px-5 py-4">
            <p className="text-sm text-slate-300">
              <strong className="text-white">Modo grátis.</strong> Use escalas, acordes, braço e metrônomo à vontade.{' '}
              <span className="text-slate-400">Os itens com selo</span> <ProBadge />{' '}
              <span className="text-slate-400">fazem parte do Pro: todas as escalas, tétrades, CAGED, afinador e treino auditivo.</span>
            </p>
            <button onClick={() => openUpgrade()} className="btn-pro shrink-0">
              Conhecer o Pro
            </button>
          </div>
        )}

        <section id="escala" className="scroll-mt-36">
          <ScaleHeroCard scale={scale} rootPc={rootPc} />
        </section>

        <Section id="intervalos" icon="📊" title={`Tabela de Intervalos - ${scale.root} ${scale.def.label}`}>
          <IntervalTable scale={scale} />
        </Section>

        <Section
          id="transpositor"
          icon="🎹"
          title="Transpositor de Escalas Musicais"
          actions={!tetradsPro.allowed ? <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">Tétrades <ProBadge /></span> : undefined}
        >
          <ScaleNotesPanel scale={scale} field={field} tetrads={useTetrads} onTetradsChange={toggleTetrads} />
        </Section>

        <Section id="teclado" icon="🎹" title="Teclado">
          <PianoKeyboard scale={scale} />
        </Section>

        <Section id="braco" icon="🎸" title={`Braço do Instrumento — ${INSTRUMENT_LABELS[instrument]}`}>
          <FretboardSection scale={scale} instrument={instrument} tuning={tuning} onTuningChange={setTuning} />
        </Section>

        <Section id="acordes" icon="🎸" title={`Visualizador de Acordes — tríades (${INSTRUMENT_LABELS[instrument]})`}>
          <ChordFieldViewer field={triadField} instrument={instrument} tuning={tuning} />
        </Section>

        <Section
          id="tetrades"
          icon="🎼"
          title="Tétrades e extensões"
          actions={!tetradsPro.allowed ? <ProBadge /> : undefined}
        >
          <ProGate feature="tetrads">
            <ExtendedChordsSection scale={scale} instrument={instrument} tuning={tuning} />
          </ProGate>
        </Section>

        <Section id="ciclo" icon="⭕" title="Ciclo de Quintas">
          <CircleOfFifths
            keyPc={keyPc}
            minor={scale.def.parentOffset === 3}
            onApply={(pcValue, key) => {
              setRootPc(pcValue);
              pickScale(key);
            }}
          />
        </Section>

        <Section
          id="exercicios"
          icon="🎧"
          title="Treino Auditivo"
          actions={!entitlement.isPro ? <ProBadge /> : undefined}
        >
          <ProGate feature="exercises">
            <ExercisesSection />
          </ProGate>
        </Section>
      </main>

      <SiteFooter />

      {panel === 'metronomo' && (
        <FloatingPanel title="Metrônomo" onClose={() => setPanel(null)}>
          <MetronomePanel />
        </FloatingPanel>
      )}
      {panel === 'estruturas' && (
        <FloatingPanel title="📖 Estruturas de Escalas" onClose={() => setPanel(null)} wide>
          <ScaleStructuresTable
            current={scaleKey}
            onSelect={(k) => {
              pickScale(k);
              setPanel(null);
            }}
          />
        </FloatingPanel>
      )}
      {panel === 'afinador' && (
        <FloatingPanel title="🎤 Afinador" onClose={() => setPanel(null)}>
          <TunerPanel instrument={instrument} tuning={tuning} />
        </FloatingPanel>
      )}
    </div>
  );
}
