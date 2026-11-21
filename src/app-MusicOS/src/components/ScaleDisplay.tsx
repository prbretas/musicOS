/**
 * ScaleDisplay - Componente para exibir notas de uma escala
 * Dependência: CORE-001 (Music Theory Engine)
 */

'use client';

import { useState } from 'react';
import { 
  getScaleNotes, 
  getScaleDegrees, 
  getHarmonicField,
  getAvailableScaleTypes,
  type NoteName,
  type ScaleType 
} from '@/lib/music/theory';

interface ScaleDisplayProps {
  /** Nota raiz da escala */
  root?: NoteName;
  /** Tipo da escala */
  scaleType?: ScaleType;
  /** Se verdadeiro, mostra os graus da escala */
  showDegrees?: boolean;
  /** Se verdadeiro, mostra o campo harmônico */
  showHarmonicField?: boolean;
  /** Callback quando a nota raiz é alterada */
  onRootChange?: (root: NoteName) => void;
  /** Callback quando o tipo da escala é alterado */
  onScaleTypeChange?: (scaleType: ScaleType) => void;
}

export function ScaleDisplay({
  root = 'C',
  scaleType = 'major',
  showDegrees = true,
  showHarmonicField = false,
  onRootChange,
  onScaleTypeChange,
}: ScaleDisplayProps) {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>(root);
  const [selectedScaleType, setSelectedScaleType] = useState<ScaleType>(scaleType);
  
  // Obter dados da escala
  const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
  const scaleDegrees = getScaleDegrees(selectedScaleType);
  const harmonicField = showHarmonicField ? getHarmonicField(selectedRoot, selectedScaleType) : [];
  const availableScaleTypes = getAvailableScaleTypes();
  const allNotes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const handleRootChange = (newRoot: NoteName) => {
    setSelectedRoot(newRoot);
    if (onRootChange) onRootChange(newRoot);
  };

  const handleScaleTypeChange = (newScaleType: ScaleType) => {
    setSelectedScaleType(newScaleType);
    if (onScaleTypeChange) onScaleTypeChange(newScaleType);
  };

  // Função para formatar nome da escala
  const formatScaleName = (root: NoteName, type: ScaleType): string => {
    const scaleNames: Record<ScaleType, string> = {
      'major': 'Major',
      'minor': 'Minor',
      'harmonic-minor': 'Harmonic Minor',
      'melodic-minor': 'Melodic Minor',
      'major-pentatonic': 'Major Pentatonic',
      'minor-pentatonic': 'Minor Pentatonic',
      'blues': 'Blues',
      'ionian': 'Ionian',
      'dorian': 'Dorian',
      'phrygian': 'Phrygian',
      'lydian': 'Lydian',
      'mixolydian': 'Mixolydian',
      'aeolian': 'Aeolian',
      'locrian': 'Locrian'
    };
    
    return `${root.replace('#', '♯')} ${scaleNames[type] || type}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      {/* Header com seletores */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
          {formatScaleName(selectedRoot, selectedScaleType)}
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Seletor de nota raiz */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Root Note
            </label>
            <div className="flex flex-wrap gap-2">
              {allNotes.map((note) => (
                <button
                  key={note}
                  onClick={() => handleRootChange(note)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedRoot === note
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {note.replace('#', '♯')}
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de tipo de escala */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Scale Type
            </label>
            <select
              value={selectedScaleType}
              onChange={(e) => handleScaleTypeChange(e.target.value as ScaleType)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
            >
              {availableScaleTypes.map((type) => (
                <option key={type} value={type}>
                  {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notas da escala */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Scale Notes
        </h3>
        <div className="flex flex-wrap gap-3">
          {scaleNotes.map((note, index) => (
            <div
              key={`${note}-${index}`}
              className="flex flex-col items-center"
            >
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${index === 0 
                  ? 'bg-red-500 text-white' 
                  : index === 2 || index === 4
                    ? 'bg-yellow-500 text-slate-800'
                    : 'bg-blue-500 text-white'
                }
                shadow-md
              `}>
                <span className="text-xl font-bold">
                  {note.replace('#', '♯')}
                </span>
              </div>
              {showDegrees && (
                <span className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {scaleDegrees[index]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Campo harmônico (opcional) */}
      {showHarmonicField && harmonicField.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Harmonic Field
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {harmonicField.map(({ degree, chord, notes }) => (
              <div
                key={degree}
                className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {degree}{degree === 1 ? 'st' : degree === 2 ? 'nd' : degree === 3 ? 'rd' : 'th'}
                  </span>
                  <span className="text-lg font-bold text-slate-800 dark:text-white">
                    {chord}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {notes.map((note) => (
                    <span
                      key={note}
                      className="px-2 py-1 bg-white dark:bg-slate-600 rounded text-sm"
                    >
                      {note.replace('#', '♯')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Notes</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {scaleNotes.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Type</div>
            <div className="text-lg font-semibold text-slate-800 dark:text-white">
              {selectedScaleType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Root</div>
            <div className="text-2xl font-bold text-red-500">
              {selectedRoot.replace('#', '♯')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Mode</div>
            <div className="text-lg font-semibold text-slate-800 dark:text-white">
              {selectedScaleType.includes('pentatonic') ? 'Pentatonic' : 'Diatonic'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScaleDisplay;