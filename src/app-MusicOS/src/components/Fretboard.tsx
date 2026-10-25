/**
 * Fretboard.tsx — Componente de Fretboard Interativo
 * 
 * Renderiza um fretboard (braço do instrumento) visualmente,
 * permitindo:
 * - Visualização de escalas e notas destacadas
 * - Suporte a múltiplos instrumentos (guitarra, ukulele)
 * - Clique em notas para ouvir (integrado com AudioEngine)
 * - Destaque visual por grau da escala (raiz, terça, quinta, etc.)
 * 
 * @see docs/MUSICOS-SPEC.md para especificações de instrumentos
 * @see src/lib/music/theory.ts para o engine de teoria musical
 */

// ============================================
// IMPORTS
// ============================================

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NoteName } from '@/types/music';

// ============================================
// TIPOS (INTERFACES)
// ============================================

/**
 * Props do componente Fretboard
 */
interface FretboardProps {
  /** Tipo de instrumento: guitar (6 cordas) ou ukulele */
  instrument: 'guitar' | 'ukulele';
  
  /** Array de afinações customizadas (opcional) 
   * Se não fornecido, usa a afinação padrão do instrumento */
  tuning?: string[];
  
  /** Array de notas a serem destacadas no fretboard */
  highlightedNotes?: NoteName[];
  
  /** Escala ativa para destacar notas da escala com cores específicas */
  scale?: {
    root: NoteName;      // Nota raiz da escala
    type: string;        // Tipo da escala (maior, menor, etc.)
    notes: NoteName[];   // Array de notas da escala
  };
  
  /** Casa inicial a ser exibida (padrão: 0 = corda solta) */
  startFret?: number;
  
  /** Casa final a ser exibida (padrão: 12) */
  endFret?: number;
  
  /** Se true, mostra o intervalo (R, m2, M2, etc.) ao invés da nota */
  showIntervals?: boolean;
  
  /** Callback chamado quando uma nota é clicada 
   * @param note - Nota clicada (ex: "C", "F#")
   * @param fret - Casa onde a nota está
   * @param string - Número da corda (0-indexed)
   */
  onNoteClick?: (note: NoteName, fret: number, string: number) => void;
}

// ============================================
// CONSTANTES — AFINAÇÕES
// ============================================

/**
 * Afinação padrão da guitarra (EADGBe)
 * Da corda mais grave (embaixo) para a mais aguda (em cima)
 * Os números indicam a oitava (E2 = Mi na 2ª oitava)
 */
const GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

/**
 * Afinação padrão do ukulele soprano (GCEA)
 * Conhecida como "afinação C"
 */
const UKULELE_TUNING = ['G4', 'C4', 'E4', 'A4'];

/**
 * Todas as 12 notas da escala cromática
 * Usadas para cálculos de intervalos e transposição
 */
const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Extrai o nome da nota de uma string de pitch (remove a oitava)
 * @example getNoteFromPitch("E4") => "E"
 */
function getNoteFromPitch(pitch: string): NoteName {
  const note = pitch.replace(/\d+/, '') as NoteName;
  return NOTES.includes(note) ? note : 'C';  // Fallback para C se inválido
}

/**
 * Calcula o intervalo entre duas notas em semitons
 * @param note1 - Nota de referência
 * @param note2 - Nota alvo
 * @returns Intervalo de 0 a 11 (onde 0 = unison, 7 = quinta perfeita)
 * @example getInterval("C", "G") => 7 (quinta perfeita)
 */
function getInterval(note1: NoteName, note2: NoteName): number {
  const idx1 = NOTES.indexOf(note1);
  const idx2 = NOTES.indexOf(note2);
  // Adiciona 12 antes do módulo para lidar com notas "antes" da raiz
  return (idx2 - idx1 + 12) % 12;
}

/**
 * Nomes dos intervalos para display
 * Usados quando showIntervals é true
 */
const INTERVAL_NAMES: Record<number, string> = {
  0: 'R',    // Root (raiz)
  1: 'm2',   // Segunda menor
  2: 'M2',   // Segunda maior
  3: 'm3',   // Terça menor
  4: 'M3',   // Terça maior
  5: 'P4',   // Quarta perfeita
  6: 'TT',   // Trítono (quarta aumentada/quinta diminuta)
  7: 'P5',   // Quinta perfeita
  8: 'm6',   // Sexta menor
  9: 'M6',   // Sexta maior
  10: 'm7',  // Sétima menor
  11: 'M7',  // Sétima maior
};

/**
 * Cores para cada grau da escala
 * Usadas para destacar visualmente a função de cada nota
 */
const DEGREE_COLORS: Record<string, string> = {
  root: 'bg-red-500',      // Raiz - vermelho
  second: 'bg-orange-500', // Segunda - laranja
  third: 'bg-yellow-500',  // Terça - amarelo
  fourth: 'bg-green-500',  // Quarta - verde
  fifth: 'bg-blue-500',    // Quinta - azul
  sixth: 'bg-indigo-500',  // Sexta - indigo
  seventh: 'bg-purple-500',// Sétima - roxo
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Fretboard — Componente de Visualização Interativa do Braço do Instrumento
 * 
 * Renderiza um fretboard completo com:
 * - Cordas horizontais
 * - Trastes verticais
 * - Marcas de posição (dots)
 * - Notas destacadas por cor
 * - Interação por clique
 * 
 * @example
 * ```tsx
 * <Fretboard 
 *   instrument="guitar"
 *   scale={{ root: 'C', type: 'maior', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }}
 *   onNoteClick={(note, fret, str) => audioEngine.play(note)}
 * />
 * ```
 */
export function Fretboard({
  instrument = 'guitar',
  tuning = instrument === 'guitar' ? GUITAR_TUNING : UKULELE_TUNING,
  highlightedNotes = [],
  scale,
  startFret = 0,
  endFret = 12,
  showIntervals = false,
  onNoteClick,
}: FretboardProps) {
  // Referência para o container do fretboard (útil para scroll)
  const fretboardRef = useRef<HTMLDivElement>(null);
  
  // Estado para hover (mostra info quando mouse está sobre uma nota)
  const [hoveredNote, setHoveredNote] = useState<{ note: NoteName; string: number; fret: number } | null>(null);

  // ============================================
  // FUNÇÕES DE CÁLCULO
  // ============================================

  /**
   * Calcula qual nota está em uma posição específica do fretboard
   * @param stringIndex - Índice da corda (0-indexed, 0 = corda mais grave)
   * @param fret - Número da casa
   * @returns Nome da nota naquela posição
   * 
   * @example
   * // Nota na 5ª casa da corda E (Mi) em afinação padrão:
   * getNoteAtPosition(0, 5) => "A"
   */
  const getNoteAtPosition = useCallback(
    (stringIndex: number, fret: number): NoteName => {
      const openNote = getNoteFromPitch(tuning[stringIndex]);
      const noteIndex = (NOTES.indexOf(openNote) + fret) % 12;
      return NOTES[noteIndex];
    },
    [tuning]
  );

  /**
   * Determina o grau de uma nota dentro de uma escala
   * @param note - Nota a ser verificada
   * @returns Grau da escala (root, second, third, etc.) ou null se não pertencer
   */
  const getScaleDegree = useCallback(
    (note: NoteName): string | null => {
      if (!scale) return null;
      
      const rootIndex = NOTES.indexOf(scale.root);
      const noteIndex = NOTES.indexOf(note);
      // Calcula intervalo a partir da raiz
      const interval = (noteIndex - rootIndex + 12) % 12;

      // Mapeia intervalos para graus da escala maior
      const degreeMap: Record<number, string> = {
        0: 'root',     // Unison/Root
        2: 'second',   // 2ª maior
        4: 'third',    // 3ª maior
        5: 'fourth',   // 4ª perfeita
        7: 'fifth',    // 5ª perfeita
        9: 'sixth',    // 6ª maior
        11: 'seventh', // 7ª maior
      };

      return degreeMap[interval] || null;
    },
    [scale]
  );

  /**
   * Determina se uma nota deve ser destacada
   * @param note - Nota a ser verificada
   * @returns true se a nota deve ser destacada
   */
  const shouldHighlightNote = useCallback(
    (note: NoteName): boolean => {
      // Destaca se estiver na lista de highlightedNotes
      if (highlightedNotes.includes(note)) return true;
      
      // Ou se pertencer à escala ativa
      if (scale) {
        const degree = getScaleDegree(note);
        return degree !== null;
      }
      return false;
    },
    [highlightedNotes, scale, getScaleDegree]
  );

  /**
   * Manipulador de clique em nota
   * Chama o callback onNoteClick se existir
   */
  const handleNoteClick = (note: NoteName, fret: number, stringIndex: number) => {
    if (onNoteClick) {
      onNoteClick(note, fret, stringIndex);
    }
  };

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  return (
    // Container com overflow horizontal para fretboards grandes
    <div className="overflow-x-auto" ref={fretboardRef}>
      <div className="min-w-max">
        {/* 
         * LINHA 1: LEGENDA DAS CORDAS
         * Mostra a nota à vazio de cada corda
         */}
        <div className="flex">
          <div className="flex flex-col justify-around pr-4">
            {tuning.map((pitch, idx) => (
              <div
                key={idx}
                className="h-12 flex items-center text-sm font-medium text-slate-400"
              >
                {/* Extrai apenas a nota (sem a oitava) */}
                {getNoteFromPitch(pitch)}
              </div>
            ))}
          </div>

          {/* 
           * FRETBOARD
           * Renderiza cada corda como uma linha horizontal
           * e cada casa como uma célula vertical
           */}
          <div className="flex flex-col">
            {tuning.map((_, stringIdx) => (
              <div
                key={stringIdx}
                className="flex items-center h-12"
                onMouseLeave={() => setHoveredNote(null)}  // Limpa hover ao sair
              >
                {/* 
                 * FIO DA CORDA
                 * Linha horizontal que representa a corda física
                 * Posicionada absolutamente em cada linha
                 */}
                <div
                  className={`absolute left-0 right-0 h-0.5 bg-slate-600 pointer-events-none ${
                    stringIdx === 0 ? 'mt-[-2px]' : ''
                  }`}
                  style={{ top: `${stringIdx * 48 + 24}px` }}
                />

                {/* 
                 * CASAS (FRETS)
                 * Renderiza cada casa como uma célula clicável
                 */}
                {Array.from({ length: endFret - startFret + 1 }).map((_, fretIdx) => {
                  const fret = startFret + fretIdx;
                  const note = getNoteAtPosition(stringIdx, fret);
                  const isHighlighted = shouldHighlightNote(note);
                  const scaleDegree = getScaleDegree(note);
                  const degree = isHighlighted ? scaleDegree : null;
                  const isRoot = degree === 'root';
                  
                  // Estado de hover
                  const isHovered =
                    hoveredNote?.note === note &&
                    hoveredNote?.string === stringIdx &&
                    hoveredNote?.fret === fret;

                  return (
                    <div
                      key={fret}
                      className={`
                        relative w-14 h-12 flex items-center justify-center cursor-pointer transition-all
                        ${fret === 0 ? 'w-20' : ''}  // Casa 0 é mais larga (corda solta)
                      `}
                      onClick={() => handleNoteClick(note, fret, stringIdx)}
                      onMouseEnter={() => setHoveredNote({ note, string: stringIdx, fret })}
                    >
                      {/* 
                       * NÚMERO DA CASA
                       * Exibido apenas na casa 0 (corda solta)
                       */}
                      {fret === 0 && (
                        <span className="absolute left-[-1.5rem] text-xs text-slate-500">
                          {fret}
                        </span>
                      )}

                      {/* 
                       * MARCADORES DE POSIÇÃO (DOTS)
                       * Pontos inlay no fretboard: casas 3, 5, 7, 9, 12
                       * A casa 12 tem 2 pontos
                       */}
                      {[3, 5, 7, 9, 12].includes(fret) && (
                        <div
                          className={`absolute pointer-events-none ${
                            fret === 12 ? 'flex gap-1' : ''
                          }`}
                        >
                          {fret === 12 ? (
                            <>
                              <div className="w-3 h-3 rounded-full bg-slate-700/50"></div>
                              <div className="w-3 h-3 rounded-full bg-slate-700/50"></div>
                            </>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-slate-700/50"></div>
                          )}
                        </div>
                      )}

                      {/* 
                       * MARCADOR DE NOTA
                       * Círculo que aparece quando a nota deve ser destacada
                       * Tamanho aumentado para notas root e no hover
                       */
                      {isHighlighted && (
                        <div
                          className={`
                            w-9 h-9 rounded-full flex items-center justify-center
                            shadow-lg transition-all transform
                            ${isRoot ? 'scale-110' : 'scale-100'}
                            ${isHovered ? 'scale-125' : ''}
                            ${
                              degree
                                ? DEGREE_COLORS[degree] + ' text-white'
                                : 'bg-slate-600 text-slate-300'
                            }
                          `}
                        >
                          {showIntervals && degree && scale ? (
                            // Mostra intervalo se showIntervals é true
                            <span className="text-xs font-bold">
                              {INTERVAL_NAMES[getInterval(scale.root, note)]}
                            </span>
                          ) : (
                            // Caso contrário, mostra a nota
                            <span className="text-sm font-bold">
                              {note.replace('#', '♯')}  // Usa símbolo de sustenido
                            </span>
                          )}
                        </div>
                      )}

                      {/* 
                       * INDICADOR DE CORDA SOLTA
                       * Círculo vazio para notas à vazio não destacadas
                       */
                      {fret === 0 && !isHighlighted && (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-500"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 
             * LINHA 2: NÚMEROS DAS CASAS
             * Mostra o número de cada casa abaixo do fretboard
             */
            <div className="flex pl-0">
              {Array.from({ length: endFret - startFret + 1 }).map((_, fretIdx) => {
                const fret = startFret + fretIdx;
                return (
                  <div
                    key={fret}
                    className={`
                      flex items-center justify-center h-6 text-xs text-slate-500
                      ${fret === 0 ? 'w-20' : 'w-14'}
                    `}
                  >
                    {/* Casas 1-12 mostram número, casa 0 fica vazia */}
                    {fret > 0 && fret}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 
       * INFO DE NOTA EM HOVER
       * Mostra detalhes da nota sob o mouse
       * Exemplo: "A na corda E - Casa 5"
       */}
      {hoveredNote && (
        <div className="mt-2 p-2 bg-slate-800/50 rounded-lg text-center">
          <span className="text-slate-300">
            {hoveredNote.note.replace('#', '♯')} na corda {tuning[hoveredNote.string]?.replace(/\d+/, '')} -
            Casa {hoveredNote.fret}
          </span>
        </div>
      )}
    </div>
  );
}

// Export padrão para facilitar imports
export default Fretboard;