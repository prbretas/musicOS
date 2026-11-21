/**
 * InstrumentSelector
 * Componente para seleção de instrumentos
 * 
 * Permite ao usuário:
 * 1. Escolher entre instrumentos disponíveis
 * 2. Alterar afinações
 * 3. Visualizar informações do instrumento
 */

'use client';

import { useState, useEffect } from 'react';
import { useInstrument, useCurrentInstrument } from '@/hooks/useInstrument';
import { InfoButton } from './ui/InfoButton';
import type { InstrumentProfile, NoteName } from '@/types/music';

interface InstrumentSelectorProps {
  /** ID do instrumento inicial */
  initialInstrumentId?: string;
  /** Mostrar seletor de afinações */
  showTuningSelector?: boolean;
  /** Mostrar informações do instrumento */
  showInstrumentInfo?: boolean;
  /** Callback quando instrumento é alterado */
  onInstrumentChange?: (instrument: InstrumentProfile) => void;
  /** Callback quando afinação é alterada */
  onTuningChange?: (tuning: NoteName[]) => void;
  /** Estilo compacto */
  compact?: boolean;
}

export function InstrumentSelector({
  initialInstrumentId = 'guitarra-6',
  showTuningSelector = true,
  showInstrumentInfo = true,
  onInstrumentChange,
  onTuningChange,
  compact = false,
}: InstrumentSelectorProps) {
  const {
    currentInstrument,
    currentTuning,
    availableInstruments,
    availableTunings,
    setInstrument,
    setTuning,
    instrumentUtils,
  } = useInstrument({
    initialInstrumentId,
    onInstrumentChange,
    onTuningChange,
  });

  const [selectedTuningId, setSelectedTuningId] = useState<string>('standard');
  const [isCustomTuningOpen, setIsCustomTuningOpen] = useState(false);
  const [customTuningInput, setCustomTuningInput] = useState<string>('');

  // Encontrar tuning ID atual
  useEffect(() => {
    const currentTuningStr = currentTuning.join(',');
    const matchingTuning = availableTunings.find(
      t => t.tuning.join(',') === currentTuningStr
    );
    
    if (matchingTuning) {
      setSelectedTuningId(matchingTuning.id);
    } else {
      setSelectedTuningId('custom');
    }
  }, [currentTuning, availableTunings]);

  // Formatar tuning para exibição
  const formatTuningDisplay = (tuning: NoteName[]): string => {
    return tuning.map(note => note.replace('#', '♯')).join(' - ');
  };

  // Aplicar tuning selecionado
  const handleTuningChange = (tuningId: string) => {
    if (tuningId === 'custom') {
      setIsCustomTuningOpen(true);
      return;
    }

    const selectedTuning = availableTunings.find(t => t.id === tuningId);
    if (selectedTuning) {
      setTuning(selectedTuning.tuning);
      setSelectedTuningId(tuningId);
    }
  };

  // Aplicar tuning customizado
  const handleCustomTuningSubmit = () => {
    if (!customTuningInput.trim()) return;

    const notes = customTuningInput
      .split(/[,\s-]+/)
      .map(note => note.trim().toUpperCase() as NoteName)
      .filter(note => note);

    if (notes.length === currentInstrument.strings) {
      setTuning(notes);
      setSelectedTuningId('custom');
      setIsCustomTuningOpen(false);
      setCustomTuningInput('');
    }
  };

  // Renderização compacta
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={currentInstrument.id}
          onChange={(e) => setInstrument(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white text-sm"
        >
          {availableInstruments.map(instrument => (
            <option key={instrument.id} value={instrument.id}>
              {instrument.name}
            </option>
          ))}
        </select>

        {showTuningSelector && (
          <select
            value={selectedTuningId}
            onChange={(e) => handleTuningChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white text-sm"
          >
            {availableTunings.map(tuning => (
              <option key={tuning.id} value={tuning.id}>
                {tuning.name}
              </option>
            ))}
            <option value="custom">Personalizada</option>
          </select>
        )}
      </div>
    );
  }

  // Renderização completa
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Instrumento
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Selecione o instrumento e afinação
          </p>
        </div>
        <InfoButton
          title="Sobre Instrumentos"
          content={`O **${currentInstrument.name}** tem ${currentInstrument.strings} cordas e ${currentInstrument.frets} trastes.

**Afinação atual:** ${formatTuningDisplay(currentTuning)}

**Instrumentos suportados:**
- Guitarra (6 cordas): EADGBE padrão
- Ukulele (4 cordas): GCEA padrão
- Baixo (4-5 cordas): EADG padrão
- Violão (12 cordas): Cordas duplas

**Dica:** Experimente diferentes afinações para descobrir novos sons!`}
        />
      </div>

      {/* Seletor de Instrumento */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Instrumento
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {availableInstruments.map(instrument => {
            const isActive = instrument.id === currentInstrument.id;
            return (
              <button
                key={instrument.id}
                onClick={() => setInstrument(instrument.id)}
                className={`
                  p-4 rounded-lg border transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {instrument.id.includes('guitarra') && '🎸'}
                    {instrument.id.includes('ukulele') && '🎺'}
                    {instrument.id.includes('baixo') && '🎵'}
                    {instrument.id.includes('violao') && '🎻'}
                  </div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {instrument.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {instrument.strings} cordas
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Informações do Instrumento */}
      {showInstrumentInfo && (
        <div className="mb-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Cordas</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">
                {currentInstrument.strings}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Trastes</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">
                {currentInstrument.frets}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Tipo</div>
              <div className="text-lg font-semibold text-slate-800 dark:text-white">
                {instrumentUtils.isBass(currentInstrument.id) ? 'Baixo' : 'Cordas'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Afinação</div>
              <div className="text-lg font-semibold text-slate-800 dark:text-white">
                {formatTuningDisplay(currentTuning)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seletor de Afinação */}
      {showTuningSelector && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Afinação
          </label>
          
          {/* Afinações rápidas */}
          <div className="flex flex-wrap gap-2 mb-4">
            {availableTunings.slice(0, 4).map(tuning => {
              const isActive = tuning.tuning.join(',') === currentTuning.join(',');
              return (
                <button
                  key={tuning.id}
                  onClick={() => handleTuningChange(tuning.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  {tuning.name}
                </button>
              );
            })}
            
            <button
              onClick={() => handleTuningChange('custom')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedTuningId === 'custom'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              Personalizada
            </button>
          </div>

          {/* Afinação customizada */}
          {isCustomTuningOpen && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Digite as notas ({currentInstrument.strings} notas, separadas por vírgula)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTuningInput}
                  onChange={(e) => setCustomTuningInput(e.target.value)}
                  placeholder={`Ex: ${currentInstrument.tuning.join(', ')}`}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                />
                <button
                  onClick={handleCustomTuningSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => {
                    setIsCustomTuningOpen(false);
                    setCustomTuningInput('');
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Use notas como C, C#, D, D#, E, F, F#, G, G#, A, A#, B
              </p>
            </div>
          )}

          {/* Visualização da afinação */}
          <div className="mt-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Afinação atual (grave → aguda):
            </div>
            <div className="flex items-center gap-2">
              {currentTuning.map((note, index) => (
                <div
                  key={index}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-center"
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Corda {index + 1}
                  </div>
                  <div className="text-xl font-bold text-slate-800 dark:text-white">
                    {note.replace('#', '♯')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {currentInstrument.octaves[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstrumentSelector;