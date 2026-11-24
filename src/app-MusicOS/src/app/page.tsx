'use client';

/**
 * MusicOS — Estúdio.
 *
 * Barra lateral com as áreas (Teoria, Instrumento, Prática) e uma área por vez
 * na tela. A barra de contexto no topo (tônica, escala, instrumento) vale para
 * todas as áreas. Funciona sem cadastro (modo grátis); recursos Pro aparecem
 * com selo e, ao clicar, abrem o modal de upgrade.
 *
 * A área atual fica no endereço (#braco, #acordes…).
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SCALES, SCALE_GROUP_LABELS, buildScale, harmonicField, type ScaleGroup } from '@/lib/music/escalas';
import { isScaleFree } from '@/lib/features';
import { INSTRUMENTS, INSTRUMENT_LABELS, INSTRUMENT_ORDER, isFreeInstrument, standardTuning, type InstrumentType } from '@/lib/music/tunings';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { UserMenu } from '@/components/layout/UserMenu';
import { LogoMark } from '@/components/ui/Logo';
import { Section } from '@/components/estudio/Section';
import { ScaleHeroCard } from '@/components/estudio/ScaleHeroCard';
import { IntervalTable } from '@/components/estudio/IntervalTable';
import { ScaleNotesPanel } from '@/components/estudio/ScaleNotesPanel';
import { PianoKeyboard } from '@/components/estudio/PianoKeyboard';
import { PianoChords } from '@/components/estudio/PianoChords';
import { FretboardSection } from '@/components/estudio/FretboardSection';
import { ChordFieldViewer } from '@/components/estudio/ChordFieldViewer';
import { CircleOfFifths } from '@/components/estudio/CircleOfFifths';
import { FloatingPanel } from '@/components/estudio/FloatingPanel';
import { MetronomePanel } from '@/components/estudio/MetronomePanel';
import { ScaleStructuresTable } from '@/components/estudio/ScaleStructuresTable';
import { TunerPanel } from '@/components/estudio/TunerPanel';
import { ExercisesSection } from '@/components/estudio/ExercisesSection';
import { ExtendedChordsSection } from '@/components/estudio/ExtendedChordsSection';
import { PracticeSection } from '@/components/estudio/PracticeSection';
import { StudioDrawer, StudioSidebar } from '@/components/estudio/shell/StudioSidebar';
import { MobileTabBar } from '@/components/estudio/shell/MobileTabBar';
import { ViewHeader } from '@/components/estudio/shell/ViewHeader';
import { getView, parseHash, type ViewId } from '@/components/estudio/shell/views';
import { ProGate, useProFeature } from '@/components/pro/ProGate';
import { ProBadge } from '@/components/pro/ProBadge';
import { useUpgrade } from '@/components/pro/UpgradeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { IconArrowRight, IconBook, IconClose, IconMenu, IconMetronome, IconMic, IconPrint } from '@/components/ui/icons';

const TONICS = ['C', 'C# / Db', 'D', 'D# / Eb', 'E', 'F', 'F# / Gb', 'G', 'G# / Ab', 'A', 'A# / Bb', 'B'];
const BANNER_KEY = 'musicos:free-banner-dismissed';

type Panel = 'metronomo' | 'estruturas' | 'afinador' | null;
type ChordTab = 'triades' | 'tetrades';

export default function EstudioPage() {
  const [rootPc, setRootPc] = useState(0);
  const [scaleKey, setScaleKey] = useState('maior');
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');
  const [tuning, setTuning] = useState<string[]>(standardTuning('guitar'));
  const [tetrads, setTetrads] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [view, setView] = useState<ViewId>('escala');
  const [chordTab, setChordTab] = useState<ChordTab>('triades');
  const [drawer, setDrawer] = useState(false);
  const [bannerHidden, setBannerHidden] = useState(true);

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
  const instrumentLabel = INSTRUMENT_LABELS[instrument];

  const groups = (Object.keys(SCALE_GROUP_LABELS) as ScaleGroup[]).map((g) => ({
    group: g,
    scales: SCALES.filter((s) => s.group === g),
  }));

  // ------------------------------------------------------------ rota por hash
  useEffect(() => {
    const apply = () => {
      const parsed = parseHash(window.location.hash);
      if (!parsed) return;
      setView(parsed.view);
      if (parsed.tab === 'tetrades') setChordTab('tetrades');
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  useEffect(() => {
    try {
      setBannerHidden(localStorage.getItem(BANNER_KEY) === '1');
    } catch {
      setBannerHidden(false);
    }
  }, []);

  const navigate = useCallback((v: ViewId) => {
    setView(v);
    if (window.location.hash !== `#${v}`) window.history.pushState(null, '', `#${v}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ------------------------------------------------------------ ações
  function pickScale(key: string) {
    if (!isScaleFree(key) && !scalesPro.gate()) return;
    setScaleKey(key);
  }

  function pickInstrument(value: InstrumentType) {
    if (!isFreeInstrument(value) && !instrumentsPro.gate()) return;
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

  function pickChordTab(t: ChordTab) {
    if (t === 'tetrades' && !tetradsPro.allowed) {
      tetradsPro.gate();
      return;
    }
    setChordTab(t);
  }

  function dismissBanner() {
    setBannerHidden(true);
    try {
      localStorage.setItem(BANNER_KEY, '1');
    } catch {
      /* sem armazenamento */
    }
  }

  const scaleName = `${scale.root} ${scale.def.label}`;

  // ------------------------------------------------------------ áreas
  function renderView(): ReactNode {
    switch (view) {
      case 'escala':
        return (
          <>
            <section id="escala" className="scroll-mt-28">
              <ScaleHeroCard scale={scale} rootPc={rootPc} />
            </section>
            <Section id="intervalos" icon="📊" title={`Tabela de Intervalos - ${scaleName}`}>
              <div className="card p-4 md:p-6">
                <IntervalTable scale={scale} />
              </div>
            </Section>
            <NextSteps
              items={[
                { view: 'braco', title: 'Ver no braço', text: `${scaleName} no ${instrumentLabel.toLowerCase()}, com CAGED` },
                { view: 'acordes', title: 'Acordes da escala', text: 'Tríades, tétrades e extensões prontas para tocar' },
                { view: 'pratica', title: 'Praticar', text: 'Riffs, arpejos e melodias com tablatura' },
              ]}
              onNavigate={navigate}
            />
          </>
        );

      case 'campo':
        return (
          <>
            <ViewHeader
              view="campo"
              title={`Notas e campo harmônico de ${scaleName}`}
              description="Os graus da escala, as notas e os acordes que nascem de cada grau. Ative as tétrades para ver os acordes com sétima."
              actions={!tetradsPro.allowed ? <span className="text-xs text-slate-400 inline-flex items-center gap-1.5">Tétrades <ProBadge /></span> : undefined}
            />
            <div id="transpositor" className="card p-5 md:p-6">
              <ScaleNotesPanel scale={scale} field={field} tetrads={useTetrads} onTetradsChange={toggleTetrads} />
            </div>
          </>
        );

      case 'ciclo':
        return (
          <>
            <ViewHeader
              view="ciclo"
              title="Ciclo de quintas"
              description="Clique numa tonalidade para aplicá-la ao estúdio inteiro. Vizinhas no círculo compartilham quase todas as notas."
            />
            <div id="ciclo" className="card p-5 md:p-8">
              <CircleOfFifths
                keyPc={keyPc}
                minor={scale.def.parentOffset === 3}
                onApply={(pcValue, key) => {
                  setRootPc(pcValue);
                  pickScale(key);
                }}
              />
            </div>
          </>
        );

      case 'braco':
        return (
          <>
            <ViewHeader
              view="braco"
              title={`${scaleName} no ${instrumentLabel.toLowerCase()}`}
              description="Notas da escala no braço, desenhos CAGED, pentatônica, acorde da tônica e afinações alternativas."
            />
            <section id="braco" className="scroll-mt-28">
              <FretboardSection scale={scale} instrument={instrument} tuning={tuning} onTuningChange={setTuning} />
            </section>
          </>
        );

      case 'acordes':
        return (
          <>
            <ViewHeader
              view="acordes"
              title={`Acordes de ${scaleName}`}
              description={`Diagramas para ${instrumentLabel.toLowerCase()} na afinação atual. Clique num acorde para ouvir.`}
              actions={
                <div className="seg" role="tablist" aria-label="Tipo de acorde">
                  <button role="tab" aria-selected={chordTab === 'triades'} onClick={() => pickChordTab('triades')} className="seg-item">
                    Tríades
                  </button>
                  <button
                    role="tab"
                    aria-selected={chordTab === 'tetrades'}
                    onClick={() => pickChordTab('tetrades')}
                    className="seg-item inline-flex items-center gap-1.5"
                  >
                    Tétrades e extensões {!tetradsPro.allowed && <ProBadge />}
                  </button>
                </div>
              }
            />
            {chordTab === 'triades' ? (
              <section id="acordes" className="card p-5 md:p-6">
                <ChordFieldViewer field={triadField} instrument={instrument} tuning={tuning} />
              </section>
            ) : (
              <section id="tetrades">
                <ProGate feature="tetrads">
                  <ExtendedChordsSection scale={scale} instrument={instrument} tuning={tuning} />
                </ProGate>
              </section>
            )}
          </>
        );

      case 'teclado':
        return (
          <>
            <ViewHeader
              view="teclado"
              title={`${scaleName} no teclado`}
              description="As notas da escala no piano e os acordes do campo harmônico com a posição das mãos."
            />
            <div id="teclado" className="card p-5 md:p-6">
              <PianoKeyboard scale={scale} />
            </div>
            <Section id="piano-acordes" icon="🎹" title={`Acordes no teclado — ${scaleName}`}>
              <div className="card p-5 md:p-6">
                <PianoChords scale={scale} triadField={triadField} />
              </div>
            </Section>
          </>
        );

      case 'pratica':
        return (
          <>
            <ViewHeader
              view="pratica"
              title="Prática com tablatura"
              description={`Técnica, riffs, arpejos e melodias para tocar junto, com tab calculada para ${instrumentLabel.toLowerCase()} na afinação atual.`}
              actions={!entitlement.isPro ? <span className="text-xs text-slate-400 inline-flex items-center gap-1.5">3 grátis · demais <ProBadge /></span> : undefined}
            />
            <section id="pratica">
              <PracticeSection instrument={instrument} tuning={tuning} />
            </section>
          </>
        );

      case 'treino':
        return (
          <>
            <ViewHeader
              view="treino"
              title="Treino auditivo e CAGED"
              description="Reconheça intervalos e acordes de ouvido, memorize as escalas pelos desenhos do CAGED e acompanhe seu progresso."
              actions={!entitlement.isPro ? <span className="text-xs text-slate-400 inline-flex items-center gap-1.5">Iniciante grátis · demais <ProBadge /></span> : undefined}
            />
            <section id="exercicios">
              <ExercisesSection />
            </section>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen lg:pl-[272px]">
      <StudioSidebar view={view} onNavigate={navigate} />
      <StudioDrawer open={drawer} onClose={() => setDrawer(false)} view={view} onNavigate={navigate} />

      {/* Barra de contexto: vale para todas as áreas */}
      <header className="glass sticky top-0 z-30 border-b no-print">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 lg:px-8">
          <button
            onClick={() => setDrawer(true)}
            className="lg:hidden -ml-1 rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-white"
            aria-label="Abrir menu"
          >
            <IconMenu />
          </button>
          <a href="#escala" onClick={(e) => {
              e.preventDefault();
              navigate('escala');
            }} className="lg:hidden" aria-label="MusicOS">
            <LogoMark className="h-8 w-8" />
          </a>

          <div className="order-last flex w-full gap-2 overflow-x-auto pb-0.5 sm:order-none sm:w-auto">
            <label className="chip-select shrink-0">
              <span>Tônica</span>
              <select id="tonica" value={rootPc} onChange={(e) => setRootPc(Number(e.target.value))}>
                {TONICS.map((t, i) => (
                  <option key={t} value={i}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="chip-select shrink-0">
              <span>Escala</span>
              <select id="tipoEscala" value={scaleKey} onChange={(e) => pickScale(e.target.value)} className="max-w-[190px]">
                {groups.map(({ group, scales }) => (
                  <optgroup key={group} label={`— ${SCALE_GROUP_LABELS[group]} —`}>
                    {scales.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                        {!isScaleFree(s.key) && !scalesPro.allowed ? '  ★ PRO' : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="chip-select shrink-0">
              <span>Instrumento</span>
              <select id="instrumento" value={instrument} onChange={(e) => pickInstrument(e.target.value as InstrumentType)}>
                {INSTRUMENT_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {INSTRUMENTS[id].emoji} {INSTRUMENTS[id].label}
                    {!isFreeInstrument(id) && !instrumentsPro.allowed ? '  ★ PRO' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => togglePanel('metronomo')}
              aria-pressed={panel === 'metronomo'}
              aria-label="Metrônomo"
              title="Metrônomo"
              className="tool-btn"
            >
              <IconMetronome width={18} height={18} />
              <span className="hidden 2xl:inline">Metrônomo</span>
            </button>
            <button
              onClick={() => togglePanel('afinador')}
              aria-pressed={panel === 'afinador'}
              aria-label="Afinador"
              title="Afinador"
              className="tool-btn"
            >
              <IconMic width={18} height={18} />
              <span className="hidden 2xl:inline">Afinador</span>
              {!tunerPro.allowed && <ProBadge className="hidden 2xl:inline-flex" />}
            </button>
            <button
              onClick={() => togglePanel('estruturas')}
              aria-pressed={panel === 'estruturas'}
              aria-label="Estruturas de escalas"
              title="Estruturas de escalas"
              className="tool-btn hidden sm:inline-flex"
            >
              <IconBook width={18} height={18} />
              <span className="hidden 2xl:inline">Estruturas</span>
            </button>
            <button onClick={handlePrint} aria-label="Exportar (imprimir ou PDF)" title="Imprimir ou salvar em PDF" className="tool-btn hidden sm:inline-flex">
              <IconPrint width={18} height={18} />
              {!exportPro.allowed && <ProBadge className="hidden 2xl:inline-flex" />}
            </button>
            <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-32 lg:px-8 lg:pb-12">
        {!entitlement.isPro && !bannerHidden && (
          <div className="no-print relative mb-6 flex flex-col gap-3 overflow-hidden rounded-2xl border border-pro-400/25 bg-gradient-to-r from-pro-400/[0.12] via-pro-400/[0.04] to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
            <p className="pr-8 text-sm text-slate-300">
              <strong className="text-white">Você está no modo grátis.</strong> Escalas essenciais, tríades, violão, cavaquinho, baixo e metrônomo.{' '}
              <span className="text-slate-400">Itens com</span> <ProBadge /> <span className="text-slate-400">são do plano Pro.</span>
            </p>
            <button onClick={() => openUpgrade()} className="btn-pro shrink-0">
              Conhecer o Pro
            </button>
            <button
              onClick={dismissBanner}
              aria-label="Fechar aviso"
              className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white sm:static sm:order-last"
            >
              <IconClose width={16} height={16} />
            </button>
          </div>
        )}

        <div key={view} className="view-enter space-y-8">
          {renderView()}
        </div>

        <PrevNext view={view} onNavigate={navigate} />
      </main>

      <div className="pb-20 lg:pb-0">
        <SiteFooter />
      </div>

      <MobileTabBar view={view} onNavigate={navigate} />

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

// ---------------------------------------------------------------- auxiliares

function NextSteps({
  items,
  onNavigate,
}: {
  items: { view: ViewId; title: string; text: string }[];
  onNavigate: (v: ViewId) => void;
}) {
  return (
    <section className="no-print">
      <p className="eyebrow mb-3">Próximos passos</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((it) => {
          const def = getView(it.view);
          return (
            <a
              key={it.view}
              href={`#${it.view}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(it.view);
              }}
              className="card card-hover group flex items-start gap-4 p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400/30 to-brand-700/30 text-brand-100 ring-1 ring-brand-400/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <def.Icon width={22} height={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-bold text-white">
                  {it.title}
                  <IconArrowRight width={16} height={16} className="text-brand-300 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="mt-1 block text-sm text-slate-400">{it.text}</span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/** Anterior / próxima área, no fim de cada página */
function PrevNext({ view, onNavigate }: { view: ViewId; onNavigate: (v: ViewId) => void }) {
  const order: ViewId[] = ['escala', 'campo', 'ciclo', 'braco', 'acordes', 'teclado', 'pratica', 'treino'];
  const i = order.indexOf(view);
  const prev = i > 0 ? getView(order[i - 1]) : null;
  const next = i < order.length - 1 ? getView(order[i + 1]) : null;
  const link = (v: ReturnType<typeof getView>, dir: 'prev' | 'next') => (
    <a
      href={`#${v.id}`}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(v.id);
      }}
      className={`card card-hover group flex flex-1 items-center gap-3 px-5 py-4 ${dir === 'next' ? 'justify-end text-right' : ''}`}
    >
      {dir === 'prev' && <IconArrowRight width={18} height={18} className="rotate-180 text-slate-500 transition-transform group-hover:-translate-x-1" />}
      <span>
        <span className="block text-[11px] uppercase tracking-wider text-slate-500">{dir === 'prev' ? 'Anterior' : 'Próxima'}</span>
        <span className="font-semibold text-white">{v.label}</span>
      </span>
      {dir === 'next' && <IconArrowRight width={18} height={18} className="text-brand-300 transition-transform group-hover:translate-x-1" />}
    </a>
  );
  return (
    <div className="no-print mt-12 flex flex-col gap-3 sm:flex-row">
      {prev ? link(prev, 'prev') : <span className="flex-1" />}
      {next ? link(next, 'next') : <span className="flex-1" />}
    </div>
  );
}
