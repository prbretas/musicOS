// REFERENCIA DE LAYOUT APROVADO PELO USUARIO (nao e codigo ativo).
// Copia exata de src/app-MusicOS/src/app/page.tsx antes da troca pelo layout
// do MusicPages. O usuario pediu para voltar a este visual (header com logo e
// seletor de instrumento, links de outras telas, abas, cartoes slate, rodape).
// Usar como base visual na spec estrutura-do-app (Requisito 6).

'use client';

import React, { useState } from 'react';
import { ChordDiagram } from '@/components/ChordDiagram';
import { Fretboard } from '@/components/Fretboard';
import { ScaleDisplay } from '@/components/ScaleDisplay';
import Link from 'next/link';
import { DEGREE_FILL } from '@/components/Fretboard';
import { getScaleNotes, getAvailableScaleTypes } from '@/lib/music/theory';
import type { NoteName as TheoryNote, ScaleType } from '@/lib/music/theory';
import {
  SHAPE_ORDER,
  getCagedKey,
  getCagedWindows,
  getPentatonicNotes,
  getTonicTriad,
} from '@/lib/music/caged';
import type { CagedShape } from '@/lib/music/caged';
import type { Chord } from '@/types/music';

const ROOTS: TheoryNote[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAX_FRET = 15;

const SCALE_LABELS: Record<string, string> = {
  major: 'Maior',
  minor: 'Menor natural',
  'harmonic-minor': 'Menor harmônica',
  'melodic-minor': 'Menor melódica',
  'major-pentatonic': 'Pentatônica maior',
  'minor-pentatonic': 'Pentatônica menor',
  blues: 'Blues',
  ionian: 'Jônio',
  dorian: 'Dórico',
  phrygian: 'Frígio',
  lydian: 'Lídio',
  mixolydian: 'Mixolídio',
  aeolian: 'Eólio',
  locrian: 'Lócrio',
};

type Tab = 'chords' | 'scales' | 'fretboard';
type InstrumentType = 'guitar' | 'ukulele';

// Acordes prontos para demonstração
const CHORDS: Record<string, Chord> = {
  C: {
    name: 'C',       root: 'C',  type: 'major',
    notes: ['C', 'E', 'G'],
    positions: [-1, 3, 2, 0, 1, 0],
    fingering:  [0,  3, 2, 0, 1, 0],
  },
  G: {
    name: 'G',       root: 'G',  type: 'major',
    notes: ['G', 'B', 'D'],
    positions: [3, 2, 0, 0, 0, 3],
    fingering:  [2, 1, 0, 0, 0, 3],
  },
  Am: {
    name: 'Am',      root: 'A',  type: 'minor',
    notes: ['A', 'C', 'E'],
    positions: [-1, 0, 2, 2, 1, 0],
    fingering:  [0,  0, 2, 3, 1, 0],
  },
  Em: {
    name: 'Em',      root: 'E',  type: 'minor',
    notes: ['E', 'G', 'B'],
    positions: [0, 2, 2, 0, 0, 0],
    fingering:  [0, 2, 3, 0, 0, 0],
  },
  F: {
    name: 'F',       root: 'F',  type: 'major',
    notes: ['F', 'A', 'C'],
    positions: [1, 1, 2, 3, 3, 1],
    fingering:  [1, 1, 2, 3, 4, 1],
  },
  D: {
    name: 'D',       root: 'D',  type: 'major',
    notes: ['D', 'F#', 'A'],
    positions: [-1, -1, 0, 2, 3, 2],
    fingering:  [0,   0, 0, 1, 3, 2],
  },
};

const CHORD_KEYS = Object.keys(CHORDS);

export default function MusicOSPage() {
  const [activeTab,   setActiveTab]   = useState<Tab>('chords');
  const [instrument,  setInstrument]  = useState<InstrumentType>('guitar');
  const [selectedChord, setSelectedChord] = useState<string>('C');
  const [fbRoot, setFbRoot] = useState<TheoryNote>('C');
  const [fbScale, setFbScale] = useState<ScaleType>('major');
  const [fbCaged, setFbCaged] = useState<CagedShape | null>(null);
  const [fbIntervals, setFbIntervals] = useState(false);

  const fbNotes = getScaleNotes(fbRoot, fbScale);
  const cagedWindows = getCagedWindows(fbRoot, fbScale, MAX_FRET);
  const cagedKey = getCagedKey(fbRoot, fbScale);
  const cagedEnabled = instrument === 'guitar';

  const [fbPenta, setFbPenta] = useState(false);
  const [fbChord, setFbChord] = useState(false);
  const pentaNotes = getPentatonicNotes(fbRoot, fbNotes);
  const triad = getTonicTriad(fbRoot, fbNotes);
  const pentaActive = fbPenta && pentaNotes !== null;
  const chordActive = fbChord && triad !== null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🎵 MusicOS</h1>
            <p className="text-slate-400 text-sm">Plataforma de Educação Musical</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-sm">Instrumento:</label>
            <select
              value={instrument}
              onChange={e => setInstrument(e.target.value as InstrumentType)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="guitar">🎸 Guitarra / Violão</option>
              <option value="ukulele">🪕 Ukulele</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── Outras telas ── */}
      <div className="max-w-5xl mx-auto px-6 pt-4 w-full flex flex-wrap gap-4 text-sm">
        <span className="text-slate-500">Outras telas:</span>
        {[
          ['/dashboard', 'Dashboard'],
          ['/dashboard/chords', 'Acordes'],
          ['/dashboard/scales', 'Escalas'],
          ['/dashboard/exercises', 'Exercícios'],
          ['/dashboard/tools', 'Ferramentas'],
          ['/pricing', 'Planos'],
          ['/login', 'Login'],
          ['/signup', 'Cadastro'],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="text-purple-400 hover:text-purple-300">
            {label}
          </Link>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6 w-full">
        <div className="flex gap-2 border-b border-slate-700 pb-0">
          {([
            { id: 'chords',    label: '🎸 Acordes'  },
            { id: 'scales',    label: '🎼 Escalas'  },
            { id: 'fretboard', label: '🎵 Braço'    },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-700 text-white border border-b-0 border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <main className="max-w-5xl mx-auto px-6 py-8 w-full flex-1">

        {/* ACORDES */}
        {activeTab === 'chords' && (
          <div className="space-y-6">
            {/* Seletor de acorde */}
            <div>
              <p className="text-slate-400 text-sm mb-3">Selecione um acorde:</p>
              <div className="flex flex-wrap gap-2">
                {CHORD_KEYS.map(key => (
                  <button
                    key={key}
                    onClick={() => setSelectedChord(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      selectedChord === key
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagrama */}
            <div className="bg-slate-800 rounded-xl p-6 inline-block">
              <ChordDiagram
                chord={CHORDS[selectedChord]}
                instrument={instrument}
                size="lg"
                showFingering
              />
            </div>

            {/* Info do acorde */}
            <div className="bg-slate-800 rounded-xl p-5">
              <h3 className="font-semibold text-slate-300 mb-3">
                Acorde {CHORDS[selectedChord].name} — notas
              </h3>
              <div className="flex gap-3 flex-wrap">
                {CHORDS[selectedChord].notes.map((note, i) => (
                  <span
                    key={note}
                    className={`px-4 py-2 rounded-full font-bold text-sm ${
                      i === 0
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-slate-700 text-slate-300 border border-slate-600'
                    }`}
                  >
                    {note} {i === 0 ? '(raiz)' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ESCALAS */}
        {activeTab === 'scales' && (
          <ScaleDisplay
            root="C"
            scaleType="major"
            showDegrees
            showHarmonicField
          />
        )}

        {/* BRAÇO */}
        {activeTab === 'fretboard' && (
          <div className="bg-slate-800 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-200">
              Braço do Instrumento — {instrument === 'guitar' ? 'Guitarra' : 'Ukulele'}
            </h2>

            {/* Tônica */}
            <div>
              <p className="text-slate-400 text-sm mb-2">Tônica:</p>
              <div className="flex flex-wrap gap-2">
                {ROOTS.map(r => (
                  <button
                    key={r}
                    onClick={() => setFbRoot(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      fbRoot === r ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Escala + opções */}
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Escala:</p>
                <select
                  value={fbScale}
                  onChange={e => { setFbScale(e.target.value as ScaleType); }}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                >
                  {getAvailableScaleTypes().map(t => (
                    <option key={t} value={t}>{SCALE_LABELS[t] ?? t}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fbIntervals}
                  onChange={e => setFbIntervals(e.target.checked)}
                />
                Mostrar intervalos (R, 3, 5...)
              </label>
              <label
                className={`flex items-center gap-2 text-sm cursor-pointer ${
                  pentaNotes ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={pentaActive}
                  disabled={!pentaNotes}
                  onChange={e => setFbPenta(e.target.checked)}
                />
                Só pentatônica
                {pentaNotes ? ` (${pentaNotes.join(' ')})` : ' (a escala já é pentatônica/blues)'}
              </label>
              <label
                className={`flex items-center gap-2 text-sm cursor-pointer ${
                  triad ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={chordActive}
                  disabled={!triad}
                  onChange={e => setFbChord(e.target.checked)}
                />
                Destacar acorde{triad ? ` ${triad.name} (${triad.notes.join(' ')})` : ''}
              </label>
            </div>

            {/* CAGED */}
            <div>
              <p className="text-slate-400 text-sm mb-2">
                Desenhos CAGED{!cagedEnabled && ' (disponível só para guitarra)'}:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={!cagedEnabled}
                  onClick={() => setFbCaged(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${
                    fbCaged === null || !cagedEnabled ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Braço todo
                </button>
                {SHAPE_ORDER.map(shape => (
                  <button
                    key={shape}
                    disabled={!cagedEnabled}
                    onClick={() => setFbCaged(shape)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${
                      cagedEnabled && fbCaged === shape ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Forma {shape}
                  </button>
                ))}
              </div>
              {cagedEnabled && (
                <p className="text-slate-500 text-xs mt-2">
                  Desenhos calculados na tonalidade de {cagedKey} maior
                  {cagedKey !== fbRoot && ` (relativa de ${fbRoot} ${SCALE_LABELS[fbScale] ?? fbScale})`}.
                  {fbCaged && ` Forma ${fbCaged}: casas ${cagedWindows[fbCaged].map(([a, b]) => `${a}–${b}`).join(' e ')}.`}
                  {' '}As formas F e B completam as 7 posições da escala; não fazem parte do CAGED tradicional.
                </p>
              )}
            </div>

            {/* Braço */}
            <Fretboard
              instrument={instrument}
              startFret={0}
              endFret={MAX_FRET}
              scale={{ root: fbRoot, type: fbScale, notes: fbNotes }}
              fretWindows={cagedEnabled && fbCaged ? cagedWindows[fbCaged] : undefined}
              showIntervals={fbIntervals}
              focusNotes={pentaActive ? pentaNotes! : undefined}
              chordNotes={chordActive ? triad!.notes : undefined}
            />

            {/* Legenda */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-slate-400 text-sm">Notas da escala:</span>
              {fbNotes.map((n, i) => (
                <span
                  key={`${n}-${i}`}
                  className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                    pentaActive && !pentaNotes!.includes(n) ? 'opacity-25' : ''
                  } ${chordActive && triad!.notes.includes(n) ? 'ring-2 ring-white' : ''}`}
                  style={{ background: DEGREE_FILL[i % DEGREE_FILL.length] }}
                >
                  {n}{i === 0 ? ' (tônica)' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-4 text-center text-slate-600 text-xs">
        MusicOS v1.0 — CORE-001 ✅ CORE-002 ✅ CORE-003 ✅ CMP-004 ✅ CMP-005 ✅ INT-001 ✅
      </footer>
    </div>
  );
}
