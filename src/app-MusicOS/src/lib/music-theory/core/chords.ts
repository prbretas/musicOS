/**
 * Sistema de Acordes Musicais
 * 
 * Módulo core para geração e manipulação de acordes musicais
 */

import { 
  NoteName, AnyNoteName, ChordType, ChordInfo, ChordResult,
  DifficultyLevel 
} from '../types/music';
import { getNoteIndex, getNoteByIndex, toSharpNote } from './notes';
import { applyInterval } from './intervals';

// ============================================
// DEFINIÇÃO DOS ACORDES
// ============================================

/**
 * Banco de dados completo de acordes musicais
 */
export const CHORDS: Record<ChordType, ChordInfo> = {
  // ============ TRÍADES BÁSICAS ============
  'major': {
    type: 'major',
    name: 'Maior',
    intervals: [0, 4, 7],
    description: 'Acorde maior. Som feliz e estável.',
    symbol: '',
    difficulty: 'beginner'
  },
  'minor': {
    type: 'minor',
    name: 'Menor',
    intervals: [0, 3, 7],
    description: 'Acorde menor. Som triste e melancólico.',
    symbol: 'm',
    difficulty: 'beginner'
  },
  'diminished': {
    type: 'diminished',
    name: 'Diminuto',
    intervals: [0, 3, 6],
    description: 'Acorde diminuto. Som tenso e instável.',
    symbol: '°',
    difficulty: 'intermediate'
  },
  'augmented': {
    type: 'augmented',
    name: 'Aumentado',
    intervals: [0, 4, 8],
    description: 'Acorde aumentado. Som misterioso e flutuante.',
    symbol: '+',
    difficulty: 'intermediate'
  },

  // ============ ACORDES COM SÉTIMA ============
  'major7': {
    type: 'major7',
    name: 'Maior com Sétima',
    intervals: [0, 4, 7, 11],
    description: 'Acorde maj7. Som jazzístico e sofisticado.',
    symbol: 'maj7',
    difficulty: 'intermediate'
  },
  'minor7': {
    type: 'minor7',
    name: 'Menor com Sétima',
    intervals: [0, 3, 7, 10],
    description: 'Acorde m7. Som jazzy e suave.',
    symbol: 'm7',
    difficulty: 'intermediate'
  },
  'dominant7': {
    type: 'dominant7',
    name: 'Dominante',
    intervals: [0, 4, 7, 10],
    description: 'Acorde 7. Som bluesy e resolutivo.',
    symbol: '7',
    difficulty: 'beginner'
  },
  'diminished7': {
    type: 'diminished7',
    name: 'Diminuto com Sétima',
    intervals: [0, 3, 6, 9],
    description: 'Acorde °7. Som muito tenso e simétrico.',
    symbol: '°7',
    difficulty: 'advanced'
  },
  'half-diminished7': {
    type: 'half-diminished7',
    name: 'Meio-diminuto',
    intervals: [0, 3, 6, 10],
    description: 'Acorde m7b5. Som jazzístico e misterioso.',
    symbol: 'm7b5',
    difficulty: 'advanced'
  },

  // ============ ACORDES SUSPENSOS ============
  'sus2': {
    type: 'sus2',
    name: 'Suspenso 2',
    intervals: [0, 2, 7],
    description: 'Acorde sus2. Som aberto e ambíguo.',
    symbol: 'sus2',
    difficulty: 'intermediate'
  },
  'sus4': {
    type: 'sus4',
    name: 'Suspenso 4',
    intervals: [0, 5, 7],
    description: 'Acorde sus4. Som suspenso e resolutivo.',
    symbol: 'sus4',
    difficulty: 'intermediate'
  },

  // ============ ACORDES COM EXTENSÕES ============
  'add9': {
    type: 'add9',
    name: 'Adiciona Nona',
    intervals: [0, 4, 7, 14],
    description: 'Acorde add9. Som rico e colorido.',
    symbol: 'add9',
    difficulty: 'intermediate'
  },
  'maj9': {
    type: 'maj9',
    name: 'Maior com Nona',
    intervals: [0, 4, 7, 11, 14],
    description: 'Acorde maj9. Som muito rico e jazzístico.',
    symbol: 'maj9',
    difficulty: 'advanced'
  },
  'min9': {
    type: 'min9',
    name: 'Menor com Nona',
    intervals: [0, 3, 7, 10, 14],
    description: 'Acorde m9. Som jazzy e sofisticado.',
    symbol: 'm9',
    difficulty: 'advanced'
  },
  'maj11': {
    type: 'maj11',
    name: 'Maior com Décima Primeira',
    intervals: [0, 4, 7, 11, 14, 17],
    description: 'Acorde maj11. Som etéreo e complexo.',
    symbol: 'maj11',
    difficulty: 'advanced'
  },
  'min11': {
    type: 'min11',
    name: 'Menor com Décima Primeira',
    intervals: [0, 3, 7, 10, 14, 17],
    description: 'Acorde m11. Som sofisticado e modal.',
    symbol: 'm11',
    difficulty: 'advanced'
  },
  'maj13': {
    type: 'maj13',
    name: 'Maior com Décima Terceira',
    intervals: [0, 4, 7, 11, 14, 17, 21],
    description: 'Acorde maj13. Som muito completo e rico.',
    symbol: 'maj13',
    difficulty: 'advanced'
  },
  'min13': {
    type: 'min13',
    name: 'Menor com Décima Terceira',
    intervals: [0, 3, 7, 10, 14, 17, 21],
    description: 'Acorde m13. Som jazzístico muito completo.',
    symbol: 'm13',
    difficulty: 'advanced'
  }
};

// ============================================
// FUNÇÕES DE GERAÇÃO DE ACORDES
// ============================================

/**
 * Retorna as notas de um acorde
 */
export function getChordNotes(root: NoteName, chordType: ChordType): NoteName[] {
  const chordInfo = CHORDS[chordType];
  if (!chordInfo) {
    return [];
  }

  const rootIndex = getNoteIndex(root);
  return chordInfo.intervals.map(interval => 
    getNoteByIndex(rootIndex + interval) as NoteName
  );
}

/**
 * Retorna informações sobre um tipo de acorde
 */
export function getChordInfo(chordType: ChordType): ChordInfo | undefined {
  return CHORDS[chordType];
}

/**
 * Retorna todos os tipos de acorde disponíveis
 */
export function getAvailableChordTypes(): ChordType[] {
  return Object.keys(CHORDS) as ChordType[];
}

/**
 * Retorna acordes por nível de dificuldade
 */
export function getChordsByDifficulty(difficulty: DifficultyLevel): ChordType[] {
  return Object.values(CHORDS)
    .filter(chord => chord.difficulty === difficulty)
    .map(chord => chord.type);
}

// ============================================
// INVERSÕES DE ACORDES
// ============================================

/**
 * Retorna todas as inversões de um acorde
 */
export function getChordInversions(root: NoteName, chordType: ChordType): NoteName[][] {
  const chordNotes = getChordNotes(root, chordType);
  if (chordNotes.length < 3) {
    return [chordNotes];
  }

  const inversions: NoteName[][] = [];
  
  // Inversão fundamental (posição original)
  inversions.push([...chordNotes]);
  
  // Primeira inversão (move a fundamental uma oitava acima)
  const firstInversion = [...chordNotes.slice(1), getNoteByIndex(getNoteIndex(chordNotes[0]) + 12) as NoteName];
  inversions.push(firstInversion);
  
  // Segunda inversão (para acordes com 3+ notas)
  if (chordNotes.length >= 3) {
    const secondInversion = [...chordNotes.slice(2), 
      getNoteByIndex(getNoteIndex(chordNotes[0]) + 12) as NoteName,
      getNoteByIndex(getNoteIndex(chordNotes[1]) + 12) as NoteName
    ];
    inversions.push(secondInversion);
  }
  
  // Terceira inversão (para acordes com 4+ notas)
  if (chordNotes.length >= 4) {
    const thirdInversion = [...chordNotes.slice(3),
      getNoteByIndex(getNoteIndex(chordNotes[0]) + 12) as NoteName,
      getNoteByIndex(getNoteIndex(chordNotes[1]) + 12) as NoteName,
      getNoteByIndex(getNoteIndex(chordNotes[2]) + 12) as NoteName
    ];
    inversions.push(thirdInversion);
  }

  return inversions;
}

/**
 * Retorna a nota mais grave de cada inversão
 */
export function getInversionBassNotes(root: NoteName, chordType: ChordType): NoteName[] {
  const inversions = getChordInversions(root, chordType);
  return inversions.map(inversion => inversion[0]);
}

// ============================================
// ANÁLISE E IDENTIFICAÇÃO DE ACORDES
// ============================================

/**
 * Analisa um conjunto de notas e tenta identificar o acorde
 */
export function analyzeChord(notes: NoteName[]): {
  possibleChords: Array<{ root: NoteName; type: ChordType; confidence: number }>;
  bestMatch?: { root: NoteName; type: ChordType };
  isInversion: boolean;
  inversionDegree?: number;
} {
  if (notes.length < 2) {
    return { possibleChords: [], isInversion: false };
  }

  const possibleChords: Array<{ root: NoteName; type: ChordType; confidence: number }> = [];
  
  // Para cada nota como possível fundamental
  for (const potentialRoot of notes) {
    // Para cada tipo de acorde conhecido
    for (const chordType of getAvailableChordTypes()) {
      const chordNotes = getChordNotes(potentialRoot, chordType);
      
      // Verifica quantas notas do acorde estão presentes
      let matches = 0;
      for (const chordNote of chordNotes) {
        if (notes.includes(chordNote)) {
          matches++;
        }
      }
      
      const confidence = matches / chordNotes.length;
      
      // Considera como possível se pelo menos 75% das notas estão presentes
      if (confidence >= 0.75) {
        possibleChords.push({ root: potentialRoot, type: chordType, confidence });
        
        // Verifica inversões
        const inversions = getChordInversions(potentialRoot, chordType);
        for (let i = 0; i < inversions.length; i++) {
          const inversionNotes = inversions[i];
          let inversionMatches = 0;
          
          for (const inversionNote of inversionNotes) {
            if (notes.includes(inversionNote)) {
              inversionMatches++;
            }
          }
          
          const inversionConfidence = inversionMatches / inversionNotes.length;
          if (inversionConfidence >= 0.9) { // Requer correspondência mais alta para inversões
            possibleChords.push({ 
              root: potentialRoot, 
              type: chordType, 
              confidence: inversionConfidence 
            });
          }
        }
      }
    }
  }
  
  // Ordena por confiança
  possibleChords.sort((a, b) => b.confidence - a.confidence);
  
  // Determina se é uma inversão
  let isInversion = false;
  let inversionDegree: number | undefined;
  
  if (possibleChords.length > 0) {
    const bestMatch = possibleChords[0];
    
    // Verifica se é uma inversão comparando a nota mais grave com a fundamental
    const chordNotes = getChordNotes(bestMatch.root, bestMatch.type);
    if (!notes.includes(bestMatch.root) || notes[0] !== bestMatch.root) {
      isInversion = true;
      
      // Tenta determinar o grau da inversão
      const inversions = getChordInversions(bestMatch.root, bestMatch.type);
      for (let i = 0; i < inversions.length; i++) {
        if (inversions[i][0] === notes[0]) {
          inversionDegree = i;
          break;
        }
      }
    }
  }
  
  return {
    possibleChords,
    bestMatch: possibleChords.length > 0 ? possibleChords[0] : undefined,
    isInversion,
    inversionDegree
  };
}

/**
 * Verifica se um conjunto de notas forma um acorde válido
 */
export function isValidChord(notes: NoteName[]): boolean {
  const analysis = analyzeChord(notes);
  return analysis.possibleChords.length > 0;
}

// ============================================
// PROGRESSÕES DE ACORDES
// ============================================

/**
 * Gera uma progressão de acordes comum
 */
export function generateChordProgression(
  key: NoteName,
  scaleType: string = 'major',
  progressionPattern: string[] = ['I', 'IV', 'V', 'I']
): Array<{ chord: string; notes: NoteName[]; roman: string }> {
  // Padrões de progressão comuns
  const commonProgressions: Record<string, string[]> = {
    'pop': ['I', 'V', 'vi', 'IV'],
    'blues': ['I7', 'IV7', 'V7'],
    'jazz': ['ii', 'V', 'I'],
    'rock': ['I', 'IV', 'V'],
    'ballad': ['vi', 'IV', 'I', 'V']
  };
  
  const pattern = progressionPattern in commonProgressions 
    ? commonProgressions[progressionPattern[0] as keyof typeof commonProgressions]
    : progressionPattern;
  
  // Mapeamento de números romanos para graus (simplificado)
  const romanToDegree: Record<string, number> = {
    'I': 1, 'ii': 2, 'III': 3, 'IV': 4, 'V': 5, 'vi': 6, 'vii°': 7,
    'i': 1, 'II': 2, 'iii': 3, 'iv': 4, 'v': 5, 'VI': 6, 'VII': 7
  };
  
  const result: Array<{ chord: string; notes: NoteName[]; roman: string }> = [];
  
  // Para simplificar, usamos C como referência e transponemos
  const referenceKey = 'C';
  const transposeAmount = getNoteIndex(key) - getNoteIndex(referenceKey);
  
  for (const roman of pattern) {
    const degree = romanToDegree[roman];
    if (!degree) continue;
    
    // Determina o tipo de acorde baseado no número romano
    let chordType: ChordType = 'major';
    if (roman === roman.toLowerCase() || roman.includes('°')) {
      chordType = 'minor';
    } else if (roman.includes('7')) {
      chordType = 'dominant7';
    }
    
    // Calcula a nota do acorde (simplificado)
    const degreeNote = getNoteByIndex(getNoteIndex(referenceKey) + (degree - 1) * 2) as NoteName;
    const transposedNote = getNoteByIndex(getNoteIndex(degreeNote) + transposeAmount) as NoteName;
    
    const notes = getChordNotes(transposedNote, chordType);
    
    result.push({
      chord: `${transposedNote}${CHORDS[chordType].symbol}`,
      notes,
      roman
    });
  }
  
  return result;
}

/**
 * Verifica se uma progressão de acordes segue as regras de harmonia tradicional
 */
export function validateChordProgression(
  chords: Array<{ root: NoteName; type: ChordType }>,
  key: NoteName
): {
  valid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  if (chords.length === 0) {
    return { valid: true, errors, suggestions };
  }
  
  // Regras básicas de harmonia
  for (let i = 0; i < chords.length; i++) {
    const current = chords[i];
    
    // Regra: Acorde final deve ser da tônica (simplificado)
    if (i === chords.length - 1 && current.root !== key) {
      errors.push(`Progressão deve terminar no acorde de ${key} (tônica)`);
      suggestions.push(`Tente terminar com ${key}${CHORDS[current.type].symbol || ''}`);
    }
    
    // Regra: Evitar saltos muito grandes entre raízes
    if (i > 0) {
      const previous = chords[i - 1];
      const interval = Math.abs(getNoteIndex(current.root) - getNoteIndex(previous.root));
      
      if (interval > 7) { // Mais que uma quinta
        errors.push(`Salto muito grande entre ${previous.root} e ${current.root}`);
        suggestions.push(`Considere um acorde intermediário`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    suggestions
  };
}

// ============================================
// FUNÇÕES DE EDUCAÇÃO E TREINO
// ============================================

/**
 * Gera um acorde aleatório para exercício
 */
export function generateRandomChord(
  difficulty: 'easy' | 'medium' | 'hard' = 'easy'
): {
  root: NoteName;
  type: ChordType;
  notes: NoteName[];
  symbol: string;
} {
  const easyChords: ChordType[] = ['major', 'minor', 'dominant7'];
  const mediumChords: ChordType[] = ['major7', 'minor7', 'sus4', 'sus2'];
  const hardChords: ChordType[] = ['diminished', 'augmented', 'diminished7', 'half-diminished7', 'maj9'];
  
  let availableChords: ChordType[];
  
  switch (difficulty) {
    case 'easy':
      availableChords = easyChords;
      break;
    case 'medium':
      availableChords = [...easyChords, ...mediumChords];
      break;
    case 'hard':
      availableChords = [...easyChords, ...mediumChords, ...hardChords];
      break;
    default:
      availableChords = easyChords;
  }
  
  // Notas simples para fácil
  const easyNotes: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const root = easyNotes[Math.floor(Math.random() * easyNotes.length)];
  const type = availableChords[Math.floor(Math.random() * availableChords.length)];
  
  const notes = getChordNotes(root, type);
  const symbol = `${root}${CHORDS[type].symbol}`;
  
  return { root, type, notes, symbol };
}

/**
 * Verifica se a resposta do usuário para um acorde está correta
 */
export function checkChordAnswer(
  root: NoteName,
  chordType: ChordType,
  userNotes: NoteName[]
): {
  correct: boolean;
  correctNotes: NoteName[];
  userNotes: NoteName[];
  feedback: string;
  isInversion?: boolean;
} {
  const correctNotes = getChordNotes(root, chordType);
  
  // Verifica se as notas do usuário correspondem ao acorde (considerando inversões)
  let isCorrect = false;
  let isInversion = false;
  
  // Verifica posição fundamental
  if (JSON.stringify(userNotes.sort()) === JSON.stringify(correctNotes.sort())) {
    isCorrect = true;
  } else {
    // Verifica inversões
    const inversions = getChordInversions(root, chordType);
    for (const inversion of inversions) {
      if (JSON.stringify(userNotes.sort()) === JSON.stringify(inversion.sort())) {
        isCorrect = true;
        isInversion = true;
        break;
      }
    }
  }
  
  let feedback = '';
  if (isCorrect) {
    if (isInversion) {
      feedback = `✅ Correto! É uma inversão de ${root}${CHORDS[chordType].symbol}.`;
    } else {
      feedback = `✅ Correto! ${root}${CHORDS[chordType].symbol}.`;
    }
  } else {
    feedback = `❌ Incorreto. ${root}${CHORDS[chordType].symbol} contém as notas: ${correctNotes.join(', ')}.`;
    
    // Dá dica sobre qual nota está faltando ou sobrando
    const missingNotes = correctNotes.filter(note => !userNotes.includes(note));
    const extraNotes = userNotes.filter(note => !correctNotes.includes(note));
    
    if (missingNotes.length > 0) {
      feedback += ` Faltando: ${missingNotes.join(', ')}.`;
    }
    if (extraNotes.length > 0) {
      feedback += ` Notas extras: ${extraNotes.join(', ')}.`;
    }
  }
  
  return {
    correct: isCorrect,
    correctNotes,
    userNotes,
    feedback,
    isInversion: isInversion || undefined
  };
}