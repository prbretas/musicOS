/**
 * ChordDiagram.tsx — Componente de Diagrama de Acorde
 * 
 * Renderiza um diagrama visual de acorde no estilo de tablatura,
 * mostrando:
 * - Posição dos dedos no braço do instrumento
 * - Notas que compõem o acorde (marcadas por cores)
 * - Indicadores de corda morta (X) ou aberta (○)
 * - Indicadores de digitação (1=indicador, 2=médio, etc.)
 * 
 * @see docs/MUSICOS-SPEC.md para especificações de acordes
 * @see src/types/music.ts para tipos de dados
 */

// ============================================
// IMPORTS
// ============================================

'use client';

import { useCallback, useMemo, useState } from 'react';
import type { NoteName, Chord } from '@/types/music';

// ============================================
// TIPOS (INTERFACES)
// ============================================

/**
 * Props do componente ChordDiagram
 */
interface ChordDiagramProps {
  /** Objeto contendo informações do acorde */
  chord: Chord;
  
  /** Instrumento para renderização (afinação diferente) */
  instrument?: 'guitar' | 'ukulele';
  
  /** Tamanho do diagrama */
  size?: 'sm' | 'md' | 'lg';
  
  /** Se deve mostrar indicadores de digitação */
  showFingering?: boolean;
  
  /** Callback chamado quando uma nota é clicada */
  onFretClick?: (string: number, fret: number) => void;
}

// ============================================
// CONSTANTES DE CONFIGURAÇÃO
// ============================================

/**
 * Configuração por instrumento
 * Define número de cordas, casas e afinação
 */
const CHORD_CONFIG = {
  guitar: {
    stringCount: 6,              // 6 cordas
    fretCount: 5,                // 5 casas visíveis
    tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],  // Afinação padrão
    baseFret: 1,                 // Casa base para cálculo
  },
  ukulele: {
    stringCount: 4,              // 4 cordas
    fretCount: 5,                // 5 casas visíveis
    tuning: ['G4', 'C4', 'E4', 'A4'],  // Afinação C
    baseFret: 1,
  },
};

/**
 * Labels de digitação dos dedos
 * Usados para mostrar qual dedo usar em cada corda
 */
const FINGERING_LABELS = ['1', '2', '3', '4', '5'];

/**
 * Cores para notas do acorde baseadas em sua função
 * - root: nota fundamental (vermelho)
 * - third: terça (amarelo)
 * - fifth: quinta (azul)
 * - seventh: sétima (roxo)
 */
const CHORD_COLORS = {
  root: 'fill-red-500 stroke-red-600',
  third: 'fill-yellow-500 stroke-yellow-600',
  fifth: 'fill-blue-500 stroke-blue-600',
  seventh: 'fill-purple-500 stroke-purple-600',
  other: 'fill-slate-400 stroke-slate-500',
};

/**
 * Classes CSS para cada tamanho de diagrama
 */
const SIZE_CLASSES = {
  sm: { diagram: 'w-32', circle: 'w-5 h-5', font: 'text-xs' },
  md: { diagram: 'w-48', circle: 'w-7 h-7', font: 'text-sm' },
  lg: 'w-64',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * ChordDiagram — Componente de Visualização de Acordes
 * 
 * Renderiza um diagrama de acorde no estilo de tablatura,
 * mostrando onde posicionar os dedos em cada corda.
 * 
 * @example
 * ```tsx
 * <ChordDiagram 
 *   chord={{ name: 'C', root: 'C', notes: ['C', 'E', 'G'], positions: [-1, 3, 2, 0, 1, 0] }}
 *   instrument="guitar"
 *   size="md"
 * />
 * ```
 */
export function ChordDiagram({
  chord,
  instrument = 'guitar',
  size = 'md',
  showFingering = true,
  onFretClick,
}: ChordDiagramProps) {
  // Estado para hover (efeito visual ao passar mouse)
  const [hoveredString, setHoveredString] = useState<number | null>(null);
  
  // Memoiza configuração para evitar recálculos
  const config = useMemo(() => CHORD_CONFIG[instrument], [instrument]);
  
  // Memoiza classes de tamanho
  const sizes = SIZE_CLASSES[size];

  // ============================================
  // FUNÇÕES DE CÁLCULO
  // ============================================

  /**
   * Determina a cor de uma nota no acorde
   * @param stringIndex - Índice da corda (0-indexed)
   * @param fret - Casa onde o acorde é apertado
   * @returns Classe CSS de cor baseada na função da nota
   * 
   * @example
   * getNoteColor(0, 3) => 'fill-red-500 stroke-red-600' (root)
   */
  const getNoteColor = useCallback(
    (stringIndex: number, fret: number): string => {
      // Corda aberta (0) ou casa 1 com baseFret 1
      if (fret === -1) return 'fill-transparent';

      // Calcula a nota tocada nessa posição
      const openNote = config.tuning[stringIndex].replace(/\d+/, '') as NoteName;
      const noteIndex = (NOTES.indexOf(openNote) + fret) % 12;
      const note = NOTES[noteIndex];

      // Verifica se é a fundamental
      if (note === chord.root) return CHORD_COLORS.root;
      
      // Verifica outras notas do acorde
      if (chord.notes.includes(note)) {
        const interval = (noteIndex - NOTES.indexOf(chord.root) + 12) % 12;
        if (interval === 4 || interval === 3) return CHORD_COLORS.third;  // Terça
        if (interval === 7) return CHORD_COLORS.fifth;  // Quinta
        if (interval === 10 || interval === 11) return CHORD_COLORS.seventh;  // Sétima
      }
      return CHORD_COLORS.other;
    },
    [chord, config]
  );

  /**
   * Retorna o label da nota para display
   * @param stringIndex - Índice da corda
   * @param fret - Casa do acorde
   * @returns Nome da nota (ex: "C", "F#")
   */
  const getNoteLabel = useCallback(
    (stringIndex: number, fret: number): NoteName => {
      const openNote = config.tuning[stringIndex].replace(/\d+/, '') as NoteName;
      const noteIndex = (NOTES.indexOf(openNote) + fret) % 12;
      return NOTES[noteIndex];
    },
    [config]
  );

  /**
   * Manipulador de clique em uma casa
   */
  const handleFretClick = (string: number, fret: number) => {
    if (onFretClick) {
      onFretClick(string, fret);
    }
  };

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  return (
    <div className={`${sizes.diagram}`}>
      {/* 
       * CABEÇALHO DO ACORDE
       * Mostra nome do acorde e instrumento
       */}
      <div className="text-center mb-2">
        <h3 className="font-bold text-slate-800 dark:text-white">
          {chord.name}
        </h3>
        <p className="text-xs text-slate-500">
          {instrument === 'guitar' ? 'Guitarra' : 'Ukulele'}
        </p>
      </div>

      {/* 
       * DIAGRAMA DO ACORDE
       * Renderiza o nut (pino) e as casas
       */}
      <div className="relative">
        {/* Nut do instrumento (barra no topo) */}
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-slate-800 dark:bg-slate-600 rounded"></div>

        {/* Cordas e casas */}
        <div className="pt-2">
          {Array.from({ length: config.stringCount }).map((_, stringIdx) => (
            <div
              key={stringIdx}
              className="flex items-center"
              onMouseEnter={() => setHoveredString(stringIdx)}
              onMouseLeave={() => setHoveredString(null)}
            >
              {/* Label da corda (nota à vazio) */}
              <div className="w-6 text-center text-xs text-slate-400">
                {config.tuning[stringIdx].replace(/\d+/, '')}
              </div>

              {/* Posições das casas */}
              <div className="flex-1 flex">
                {Array.from({ length: config.fretCount }).map((_, fretIdx) => {
                  // Casa do acorde (-2 = mute, -1 = open, 0+ = casa)
                  const fret = chord.positions[stringIdx] || 0;
                  const isActive = fretIdx === fret - config.baseFret + 1 || fret === 0 && fretIdx === 0;
                  const isMuted = chord.positions[stringIdx] === -2;
                  const shouldShowCircle = isActive && !isMuted;
                  const circleNote = getNoteLabel(stringIdx, fret);
                  const circleColor = shouldShowCircle ? getNoteColor(stringIdx, fret) : CHORD_COLORS.other;

                  return (
                    <div
                      key={fretIdx}
                      className="flex-1 h-12 flex items-center justify-center relative"
                    >
                      {/* Fio do traste (linha vertical) */}
                      {fretIdx > 0 && (
                        <div className="absolute inset-0 border-l border-slate-300 dark:border-slate-600"></div>
                      )}

                      {/* 
                       * CÍRCULO DA NOTA
                       * Appears onde o acorde deve ser apertado
                       */
                      {shouldShowCircle && (
                        <button
                          className={`
                            ${sizes.circle} rounded-full border-2 
                            ${circleColor.split(' ')[0].replace('fill-', 'bg-')}
                            ${circleColor.split(' ')[1].replace('stroke-', 'border-')}
                            flex items-center justify-center
                            shadow-sm hover:scale-110 transition-transform
                            ${hoveredString === stringIdx ? 'ring-2 ring-offset-1 ring-purple-500' : ''}
                          `}
                          onClick={() => handleFretClick(stringIdx, fret)}
                        >
                          <span className={`${sizes.font} font-bold text-white`}>
                            {fret > 0 ? fret : '○'}
                          </span>
                        </button>
                      )}

                      {/* 
                       * INDICADOR DE CORDA MORTA
                       * Mostra "X" para cordas que não devem ser tocadas
                       */}
                      {isMuted && (
                        <div className="text-slate-400 text-lg font-bold">✕</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Indicador de digitação (dedo) */}
              {showFingering && chord.fingering && chord.fingering[stringIdx] && (
                <div className="w-6 text-center">
                  <span className="text-xs text-slate-400">
                    {FINGERING_LABELS[chord.fingering![stringIdx] - 1] || ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 
       * LEGENDA DE DIGITAÇÃO
       * Mostra qual dedo usar em cada corda
       */
      {showFingering && chord.fingering && (
        <div className="mt-2 flex justify-center gap-2 text-xs text-slate-500">
          {chord.fingering.map((finger, idx) => (
            <span key={idx}>
              {config.tuning[idx].replace(/\d+/, '')}: {FINGERING_LABELS[finger - 1]}
            </span>
          ))}
        </div>
      )}

      {/* 
       * NOTAS DO ACORDE
       * Mostra as notas que compõem o acorde (C-E-G para C maior)
       */
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {chord.notes.map((note) => (
          <span
            key={note}
            className={`px-2 py-0.5 text-xs rounded-full ${
              note === chord.root
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {note.replace('#', '♯')}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================
// DADOS AUXILIARES
// ============================================

/**
 * Array de todas as notas da escala cromática
 * Usado para cálculos de transposição e intervalos
 */
const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Export padrão
export default ChordDiagram;