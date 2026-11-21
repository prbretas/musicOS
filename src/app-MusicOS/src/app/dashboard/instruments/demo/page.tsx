/**
 * Demo Page for InstrumentRegistry (CORE-002)
 * Demonstrates instrument management capabilities
 */

'use client';

import { useState, useEffect } from 'react';
import { InstrumentSelector } from '@/components/InstrumentSelector';
import { instrumentRegistry, DEFAULT_INSTRUMENTS } from '@/lib/music/instruments/registry';
import { useInstrument, useInstrumentManager } from '@/hooks/useInstrument';
import { InfoButton } from '@/components/ui/InfoButton';
import type { InstrumentProfile, NoteName } from '@/types/music';

export default function InstrumentRegistryDemoPage() {
  const [activeTab, setActiveTab] = useState<'selector' | 'manager' | 'calculations'>('selector');
  const [customInstrument, setCustomInstrument] = useState<Partial<InstrumentProfile>>({
    name: '',
    strings: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    octaves: [2, 2, 3, 3, 3, 4],
    frets: 24,
    fretless: false,
  });

  const { currentInstrument, calculateNoteAtPosition, findNotePositions } = useInstrument();
  const { instruments, addInstrument, removeInstrument, instrumentCount } = useInstrumentManager();

  const [calculationResult, setCalculationResult] = useState<string>('');
  const [targetNote, setTargetNote] = useState<NoteName>('C');
  const [stringIndex, setStringIndex] = useState<number>(0);
  const [fret, setFret] = useState<number>(0);

  // Calcular nota na posição
  const handleCalculateNote = () => {
    const note = calculateNoteAtPosition(stringIndex, fret);
    if (note) {
      setCalculationResult(`Corda ${stringIndex + 1}, Traste ${fret}: ${note.replace('#', '♯')}`);
    } else {
      setCalculationResult('Posição inválida');
    }
  };

  // Encontrar posições da nota
  const handleFindPositions = () => {
    const positions = findNotePositions(targetNote);
    if (positions.length > 0) {
      const positionsText = positions
        .map(pos => `Corda ${pos.string + 1}, Traste ${pos.fret}`)
        .join('\n');
      setCalculationResult(`Nota ${targetNote.replace('#', '♯')} encontrada em:\n${positionsText}`);
    } else {
      setCalculationResult(`Nota ${targetNote.replace('#', '♯')} não encontrada no braço`);
    }
  };

  // Registrar novo instrumento
  const handleRegisterInstrument = () => {
    if (!customInstrument.name?.trim()) {
      alert('Digite um nome para o instrumento');
      return;
    }

    const id = `custom-${Date.now()}`;
    const profile: InstrumentProfile = {
      id,
      name: customInstrument.name,
      strings: customInstrument.strings || 6,
      tuning: customInstrument.tuning || ['E', 'A', 'D', 'G', 'B', 'E'],
      octaves: customInstrument.octaves || [2, 2, 3, 3, 3, 4],
      frets: customInstrument.frets || 24,
      fretless: customInstrument.fretless || false,
    };

    const success = addInstrument(profile);
    if (success) {
      alert(`Instrumento "${profile.name}" registrado com sucesso!`);
      setCustomInstrument({
        name: '',
        strings: 6,
        tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        octaves: [2, 2, 3, 3, 3, 4],
        frets: 24,
        fretless: false,
      });
    } else {
      alert('Erro ao registrar instrumento');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            InstrumentRegistry Demo (CORE-002)
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Sistema completo de gerenciamento de instrumentos. Registre, gerencie e calcule posições
            para diferentes instrumentos musicais.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
              CORE-002: InstrumentRegistry
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              Instrumentos: {instrumentCount}
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
              Afinações Suportadas
            </span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab('selector')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'selector'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              🎸 Seletor de Instrumentos
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'manager'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              📋 Gerenciador Avançado
            </button>
            <button
              onClick={() => setActiveTab('calculations')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'calculations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              🧮 Cálculos no Braço
            </button>
          </div>
        </div>

        {/* Current Instrument Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Instrumento Ativo
            </h2>
            <div className="text-3xl">
              {currentInstrument.id.includes('guitarra') && '🎸'}
              {currentInstrument.id.includes('ukulele') && '🎺'}
              {currentInstrument.id.includes('baixo') && '🎵'}
              {currentInstrument.id.includes('violao') && '🎻'}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">Nome</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">
                {currentInstrument.name}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">Cordas</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">
                {currentInstrument.strings}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">Trastes</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">
                {currentInstrument.frets}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">ID</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">
                {currentInstrument.id}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Tab 1: Instrument Selector */}
          {activeTab === 'selector' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
                Seletor de Instrumentos
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Use o seletor abaixo para escolher entre diferentes instrumentos e afinações.
                O sistema suporta instrumentos padrão e afinações personalizadas.
              </p>
              
              <div className="mb-8">
                <InstrumentSelector
                  initialInstrumentId="guitarra-6"
                  showTuningSelector={true}
                  showInstrumentInfo={true}
                  compact={false}
                  onInstrumentChange={(instrument) => {
                    console.log('Instrumento alterado:', instrument);
                  }}
                  onTuningChange={(tuning) => {
                    console.log('Afinação alterada:', tuning);
                  }}
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Como usar o seletor:
                </h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Clique nos cartões</strong> para selecionar diferentes instrumentos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Use os botões de afinação</strong> para alternar entre presets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Clique em &quot;Personalizada&quot;</strong> para criar sua própria afinação</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Use o botão de informação (i)</strong> para aprender sobre cada instrumento</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Instrument Manager */}
          {activeTab === 'manager' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
                Gerenciador de Instrumentos
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Registre novos instrumentos personalizados e gerencie os existentes.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Registrar novo instrumento */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    Registrar Novo Instrumento
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nome do Instrumento
                      </label>
                      <input
                        type="text"
                        value={customInstrument.name}
                        onChange={(e) => setCustomInstrument({ ...customInstrument, name: e.target.value })}
                        placeholder="Ex: Guitarra 7 Cordas"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Número de Cordas
                      </label>
                      <input
                        type="number"
                        value={customInstrument.strings}
                        onChange={(e) => setCustomInstrument({ ...customInstrument, strings: parseInt(e.target.value) || 6 })}
                        min="1"
                        max="12"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Número de Trastes
                      </label>
                      <input
                        type="number"
                        value={customInstrument.frets}
                        onChange={(e) => setCustomInstrument({ ...customInstrument, frets: parseInt(e.target.value) || 24 })}
                        min="1"
                        max="36"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                      />
                    </div>

                    <button
                      onClick={handleRegisterInstrument}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Registrar Instrumento
                    </button>
                  </div>
                </div>

                {/* Lista de instrumentos registrados */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                      Instrumentos Registrados ({instrumentCount})
                    </h3>
                    <InfoButton
                      title="Sobre Instrumentos Personalizados"
                      content="Você pode registrar instrumentos personalizados com configurações únicas. Cada instrumento precisa de um nome, número de cordas, afinação e número de trastes."
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.values(instruments).map((instrument) => (
                      <div
                        key={instrument.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-slate-800 dark:text-white">
                            {instrument.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {instrument.strings} cordas, {instrument.frets} trastes
                          </div>
                        </div>
                        
                        {instrument.id.startsWith('custom-') && (
                          <button
                            onClick={() => removeInstrument(instrument.id)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800/50"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Fretboard Calculations */}
          {activeTab === 'calculations' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
                Cálculos no Braço
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Use as ferramentas abaixo para calcular notas e encontrar posições no braço do instrumento atual.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calcular nota na posição */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    Calcular Nota na Posição
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Corda (1-{currentInstrument.strings})
                      </label>
                      <input
                        type="number"
                        value={stringIndex + 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) - 1;
                          setStringIndex(Math.max(0, Math.min(currentInstrument.strings - 1, val)));
                        }}
                        min="1"
                        max={currentInstrument.strings}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Traste (0-{currentInstrument.frets})
                      </label>
                      <input
                        type="number"
                        value={fret}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFret(Math.max(0, Math.min(currentInstrument.frets, val)));
                        }}
                        min="0"
                        max={currentInstrument.frets}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                      />
                    </div>

                    <button
                      onClick={handleCalculateNote}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Calcular Nota
                    </button>
                  </div>
                </div>

                {/* Encontrar posições da nota */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    Encontrar Posições da Nota
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nota Alvo
                      </label>
                      <select
                        value={targetNote}
                        onChange={(e) => setTargetNote(e.target.value as NoteName)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                      >
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
                          <option key={note} value={note}>
                            {note.replace('#', '♯')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleFindPositions}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Encontrar Posições
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultado dos cálculos */}
              {calculationResult && (
                <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    Resultado
                  </h3>
                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-lg">
                    {calculationResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                Instrumentos Suportados
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>🎸 Guitarra 6 cordas</li>
                <li>🎻 Violão 12 cordas</li>
                <li>🎺 Ukulele</li>
                <li>🎵 Baixo 4-5 cordas</li>
                <li>🎹 Instrumentos personalizados</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                Funcionalidades
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>✓ Registro centralizado</li>
                <li>✓ Afinações customizadas</li>
                <li>✓ Cálculos no braço</li>
                <li>✓ Hook React integrado</li>
                <li>✓ Seletor de UI completo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                Próximos Passos
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                O InstrumentRegistry está pronto para integrar com o ChordSelector (CMP-006).
                Testes completos estão disponíveis para garantir a estabilidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}