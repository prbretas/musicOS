'use client';

import { useState, useMemo } from 'react';
import { ChordDiagram } from '@/components/ChordDiagram';
import { InfoButton } from '@/components/ui/InfoButton';
import type { Chord } from '@/types/music';

// Common chords data - will be expanded in full implementation
const CHORDS: Chord[] = [
  // Major chords
  { name: 'C', root: 'C', type: 'major', notes: ['C', 'E', 'G'], positions: [-1, 3, 2, 0, 1, 0], fingering: [-1, 3, 2, 0, 1, 0] },
  { name: 'C#', root: 'C#', type: 'major', notes: ['C#', 'F', 'G#'], positions: [-1, 4, 3, 1, 2, 1], fingering: [-1, 4, 3, 1, 2, 1] },
  { name: 'D', root: 'D', type: 'major', notes: ['D', 'F#', 'A'], positions: [-1, -1, 0, 2, 3, 2], fingering: [-1, -1, 0, 2, 3, 2] },
  { name: 'D#', root: 'D#', type: 'major', notes: ['D#', 'G', 'A#'], positions: [-1, -1, 1, 3, 4, 3], fingering: [-1, -1, 1, 3, 4, 3] },
  { name: 'E', root: 'E', type: 'major', notes: ['E', 'G#', 'B'], positions: [0, 2, 2, 1, 0, 0], fingering: [0, 2, 2, 1, 0, 0] },
  { name: 'F', root: 'F', type: 'major', notes: ['F', 'A', 'C'], positions: [1, 3, 3, 2, 1, 1], fingering: [1, 3, 3, 2, 1, 1] },
  { name: 'F#', root: 'F#', type: 'major', notes: ['F#', 'A#', 'C#'], positions: [2, 4, 4, 3, 2, 2], fingering: [2, 4, 4, 3, 2, 2] },
  { name: 'G', root: 'G', type: 'major', notes: ['G', 'B', 'D'], positions: [3, 2, 0, 0, 0, 3], fingering: [2, 1, 0, 0, 0, 3] },
  { name: 'G#', root: 'G#', type: 'major', notes: ['G#', 'C', 'D#'], positions: [4, 3, 1, 1, 2, 4], fingering: [4, 3, 1, 1, 2, 4] },
  { name: 'A', root: 'A', type: 'major', notes: ['A', 'C#', 'E'], positions: [-1, 0, 2, 2, 2, 0], fingering: [-1, 0, 2, 2, 2, 0] },
  { name: 'A#', root: 'A#', type: 'major', notes: ['A#', 'D', 'F'], positions: [-1, 1, 3, 3, 3, 1], fingering: [-1, 1, 3, 3, 3, 1] },
  { name: 'B', root: 'B', type: 'major', notes: ['B', 'D#', 'F#'], positions: [-1, 2, 4, 4, 4, 2], fingering: [-1, 2, 4, 4, 4, 2] },
  // Minor chords
  { name: 'Cm', root: 'C', type: 'minor', notes: ['C', 'D#', 'G'], positions: [-1, 3, 5, 5, 4, 3], fingering: [-1, 3, 5, 5, 4, 3] },
  { name: 'Dm', root: 'D', type: 'minor', notes: ['D', 'F', 'A'], positions: [-1, -1, 0, 2, 3, 1], fingering: [-1, -1, 0, 2, 3, 1] },
  { name: 'Em', root: 'E', type: 'minor', notes: ['E', 'G', 'B'], positions: [0, 2, 2, 0, 0, 0], fingering: [0, 2, 2, 0, 0, 0] },
  { name: 'Fm', root: 'F', type: 'minor', notes: ['F', 'G#', 'C'], positions: [1, 3, 3, 1, 1, 1], fingering: [1, 3, 3, 1, 1, 1] },
  { name: 'Gm', root: 'G', type: 'minor', notes: ['G', 'A#', 'D'], positions: [3, 5, 5, 3, 3, 3], fingering: [3, 5, 5, 3, 3, 3] },
  { name: 'Am', root: 'A', type: 'minor', notes: ['A', 'C', 'E'], positions: [-1, 0, 2, 2, 1, 0], fingering: [-1, 0, 2, 2, 1, 0] },
  { name: 'Bm', root: 'B', type: 'minor', notes: ['B', 'D', 'F#'], positions: [-1, 2, 4, 4, 3, 2], fingering: [-1, 2, 4, 4, 3, 2] },
];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const CHORD_TYPES = ['all', 'major', 'minor', '7', 'm7', 'maj7'] as const;

export default function ChordsPage() {
  const [selectedRoot, setSelectedRoot] = useState<typeof NOTES[number] | 'all'>('all');
  const [selectedType, setSelectedType] = useState<typeof CHORD_TYPES[number]>('all');
  const [instrument, setInstrument] = useState<'guitar' | 'ukulele'>('guitar');

  const filteredChords = useMemo(() => {
    return CHORDS.filter((chord) => {
      if (selectedRoot !== 'all' && chord.root !== selectedRoot) return false;
      if (selectedType !== 'all' && chord.type !== selectedType) return false;
      return true;
    });
  }, [selectedRoot, selectedType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Biblioteca de Acordes
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            visualização de diagramas de acordes para guitarra e ukulele
          </p>
        </div>
        <InfoButton
          content={`
            ### Como ler um diagrama de acorde
            
            O diagrama representa o braço do instrumento visto de frente:
            - As linhas verticais são as cordas (da esquerda para direita: mais grave para mais aguda)
            - As linhas horizontais são as casas
            - Os números dentro dos círculos indicam qual dedo usar
            - "X" indica corda não tocada
            - "O" indica corda solta (ao ar)
            
            ### Fingeração padrão (guitarra)
            1 = indicador | 2 = médio | 3 = anelar | 4 = mínimo | 5 = polegar
            
            ### Cores das notas
            - 🔴 Tônica (nota principal do acorde)
            - 🟡 Terça (determina se é maior ou menor)
            - 🔵 Quinta
            - 🟣 Sétima (acordes 7, m7, maj7)
          `}
          title="Guia de Acordes"
        />
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
        {/* Root selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Nota Fundamental
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRoot('all')}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all
                ${selectedRoot === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}
              `}
            >
              Todas
            </button>
            {NOTES.map((note) => (
              <button
                key={note}
                onClick={() => setSelectedRoot(note)}
                className={`
                  w-10 h-10 rounded-xl font-semibold transition-all
                  ${selectedRoot === note ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}
                `}
              >
                {note.replace('#', '♯')}
              </button>
            ))}
          </div>
        </div>

        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Tipo de Acorde
          </label>
          <div className="flex flex-wrap gap-2">
            {CHORD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-all capitalize
                  ${selectedType === type ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}
                `}
              >
                {type === 'all' ? 'Todos' : type}
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
                ${instrument === 'guitar' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}
              `}
            >
              🎸 Guitarra
            </button>
            <button
              onClick={() => setInstrument('ukulele')}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all
                ${instrument === 'ukulele' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}
              `}
            >
              🎺 Ukulele
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {filteredChords.length} acorde{filteredChords.length !== 1 ? 's' : ''} encontrado{filteredChords.length !== 1 ? 's' : ''}
      </div>

      {/* Chord grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredChords.map((chord) => (
          <div
            key={chord.name}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
          >
            <ChordDiagram
              chord={chord}
              instrument={instrument}
              size="sm"
            />
          </div>
        ))}
      </div>

      {filteredChords.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Nenhum acorde encontrado com os filtros selecionados.
        </div>
      )}
    </div>
  );
}