'use client';

import { useState, useMemo } from 'react';
import { Fretboard } from '@/components/Fretboard';
import { InfoButton } from '@/components/ui/InfoButton';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

const SCALES = [
  { type: 'maior', name: 'Maior', pattern: [0, 2, 4, 5, 7, 9, 11] },
  { type: 'menor_natural', name: 'Menor Natural', pattern: [0, 2, 3, 5, 7, 8, 10] },
  { type: 'pentatonica_maior', name: 'Pentatônica Maior', pattern: [0, 2, 4, 7, 9] },
  { type: 'pentatonica_menor', name: 'Pentatônica Menor', pattern: [0, 3, 5, 7, 10] },
  { type: 'blues', name: 'Blues', pattern: [0, 3, 5, 6, 7, 10] },
  { type: 'mixolidio', name: 'Mixolídio', pattern: [0, 2, 4, 5, 7, 9, 10] },
  { type: 'dorico', name: 'Dórico', pattern: [0, 2, 3, 5, 7, 9, 10] },
  { type: 'frigio', name: 'Frígio', pattern: [0, 1, 3, 5, 7, 8, 10] },
  { type: 'lidio', name: 'Lídio', pattern: [0, 2, 4, 6, 7, 9, 11] },
  { type: 'locrio', name: 'Lócrio', pattern: [0, 1, 3, 5, 6, 8, 10] },
  { type: 'jonico', name: 'Jônio', pattern: [0, 2, 4, 5, 7, 9, 11] },
  { type: 'eolio', name: 'Eólio', pattern: [0, 2, 3, 5, 7, 8, 10] },
] as const;

type ScaleType = typeof SCALES[number]['type'];

export default function ScalesPage() {
  const [selectedRoot, setSelectedRoot] = useState<typeof NOTES[number]>('C');
  const [selectedScale, setSelectedScale] = useState<ScaleType>('maior');
  const [instrument, setInstrument] = useState<'guitar' | 'ukulele'>('guitar');
  const [showIntervals, setShowIntervals] = useState(false);
  const [fretRange, setFretRange] = useState({ start: 0, end: 12 });

  const currentScale = useMemo(() => {
    return SCALES.find(s => s.type === selectedScale) || SCALES[0];
  }, [selectedScale]);

  const scaleNotes = useMemo(() => {
    const rootIndex = NOTES.indexOf(selectedRoot);
    return currentScale.pattern.map((interval) => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTES[noteIndex];
    });
  }, [selectedRoot, currentScale]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Explorador de Escalas
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            visualize e aprenda escalas no braço do instrumento
          </p>
        </div>
        <InfoButton
          content={`
            ### O que é uma escala?
            Uma escala é uma sequência de notas organizadas por altura (frequência). 
            As escalas são a base da harmonia e melodia na música ocidental.

            ### Como usar esta ferramenta?
            1. Escolha a nota raiz (tônica)
            2. Selecione o tipo de escala (maior, menor, pentatônica, etc.)
            3. Veja as notas destacadas no braço do instrumento
            4. As cores indicam o grau da escala:
              - 🔴 Tônica (1)
              - 🟠 2ª maior (2)
              - 🟡 3ª maior/menor (3)
              - 🟢 4ª justa (4)
              - 🔵 5ª justa (5)
              - 🟣 6ª maior (6)
              - ⚫ 7ª maior/menor (7)
          `}
          title="Guia de Escalas"
        />
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
        {/* Note selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Nota Raiz
          </label>
          <div className="flex flex-wrap gap-2">
            {NOTES.map((note) => (
              <button
                key={note}
                onClick={() => setSelectedRoot(note)}
                className={`
                  w-10 h-10 rounded-xl font-semibold transition-all
                  ${
                    selectedRoot === note
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                {note.replace('#', '♯')}
              </button>
            ))}
          </div>
        </div>

        {/* Scale selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Tipo de Escala
          </label>
          <div className="flex flex-wrap gap-2">
            {SCALES.map((scale) => (
              <button
                key={scale.type}
                onClick={() => setSelectedScale(scale.type)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-all
                  ${
                    selectedScale === scale.type
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                {scale.name}
              </button>
            ))}
          </div>
        </div>

        {/* Instrument selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Instrumento
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setInstrument('guitar')}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all
                ${
                  instrument === 'guitar'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              🎸 Guitarra
            </button>
            <button
              onClick={() => setInstrument('ukulele')}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all
                ${
                  instrument === 'ukulele'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              🎺 Ukulele
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showIntervals}
              onChange={(e) => setShowIntervals(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Mostrar intervalos
            </span>
          </label>
        </div>
      </div>

      {/* Scale info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Escala de {currentScale.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {scaleNotes.map((note, idx) => (
              <span
                key={note}
                className={`
                  px-3 py-1.5 rounded-lg font-semibold
                  ${
                    idx === 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }
                `}
              >
                {note.replace('#', '♯')}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Intervalos
          </h3>
          <div className="flex flex-wrap gap-2">
            {['1J', '2J', '3J', '4J', '5J', '6J', '7J'].map((interval, idx) => (
              <span
                key={interval}
                className={`
                  px-3 py-1.5 rounded-lg font-medium text-sm
                  ${
                    idx === 0 || idx === 3 || idx === 4
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }
                `}
              >
                {interval}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Graus
          </h3>
          <div className="flex flex-wrap gap-2">
            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].map((degree, idx) => (
              <span
                key={degree}
                className={`
                  px-3 py-1.5 rounded-lg font-medium text-sm
                  ${
                    [0, 3, 4].includes(idx)
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }
                `}
              >
                {degree}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fretboard */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Braço do {instrument === 'guitar' ? 'Guitarra' : 'Ukulele'}
        </h2>
        <div className="overflow-x-auto">
          <Fretboard
            instrument={instrument}
            scale={{ root: selectedRoot, type: selectedScale, notes: scaleNotes }}
            showIntervals={showIntervals}
          />
        </div>
      </div>
    </div>
  );
}