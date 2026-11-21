/**
 * Sistema de Escalas Musicais
 * 
 * Módulo core para geração e manipulação de escalas musicais
 * Baseado no arquivo scales-legacy.ts, mas integrado com a nova arquitetura
 */

import { 
  NoteName, ScaleType, ScaleInfo, ScaleResult, HarmonicDegree,
  ChordType, ScaleCategory, DifficultyLevel, HarmonicFunction
} from '../types/music';
import { getNoteIndex, getNoteByIndex, toSharpNote } from './notes';

// ============================================
// DEFINIÇÃO DAS ESCALAS
// ============================================

/**
 * Banco de dados completo de escalas musicais
 */
export const SCALES: Record<ScaleType, ScaleInfo> = {
  // ============ ESCALAS DIATÔNICAS ============
  'major': {
    type: 'major',
    name: 'Maior',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'A escala maior é a base da música ocidental. Som feliz e luminoso.',
    category: 'diatonic',
    mood: 'Feliz, luminoso, heroico',
    difficulty: 'beginner'
  },
  'natural-minor': {
    type: 'natural-minor',
    name: 'Menor Natural',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Escala menor natural. Som triste e melancólico.',
    category: 'diatonic',
    mood: 'Triste, melancólico, emotivo',
    difficulty: 'beginner'
  },
  'harmonic-minor': {
    type: 'harmonic-minor',
    name: 'Menor Harmônica',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Menor com 7ª maior. Som exótico e dramático.',
    category: 'diatonic',
    mood: 'Exótico, dramático, misterioso',
    difficulty: 'intermediate'
  },
  'melodic-minor': {
    type: 'melodic-minor',
    name: 'Menor Melódica',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: 'Menor com 6ª e 7ª maiores. Ascende como maior, descende como menor.',
    category: 'diatonic',
    mood: 'Jazzy, sofisticado, versátil',
    difficulty: 'intermediate'
  },

  // ============ MODOS GREGOS ============
  'ionian': {
    type: 'ionian',
    name: 'Jônio (I)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Primeiro modo. Caracteriza maior, sonoro e heroico.',
    category: 'modes',
    mood: 'Heroico, sonoro, clássico',
    difficulty: 'intermediate'
  },
  'dorian': {
    type: 'dorian',
    name: 'Dórico (II)',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Segundo modo. Som jazzy, sofisticado e levemente triste.',
    category: 'modes',
    mood: 'Jazzy, sofisticado, melancólico suave',
    difficulty: 'intermediate'
  },
  'phrygian': {
    type: 'phrygian',
    name: 'Frígio (III)',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Terceiro modo. Som flamenco, exótico e medieval.',
    category: 'modes',
    mood: 'Flamenco, exótico, medieval',
    difficulty: 'intermediate'
  },
  'lydian': {
    type: 'lydian',
    name: 'Lídio (IV)',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: 'Quarto modo. Som brillante, etéreo e otimista.',
    category: 'modes',
    mood: 'Brillante, etéreo, otimista',
    difficulty: 'intermediate'
  },
  'mixolydian': {
    type: 'mixolydian',
    name: 'Mixolídio (V)',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Quinto modo. Som bluesy, rocker e festivo.',
    category: 'modes',
    mood: 'Bluesy, rock, festivo',
    difficulty: 'intermediate'
  },
  'aeolian': {
    type: 'aeolian',
    name: 'Eólio (VI)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Sexto modo (menor natural). Som triste e emotivo.',
    category: 'modes',
    mood: 'Triste, emotivo, melancólico',
    difficulty: 'beginner'
  },
  'locrian': {
    type: 'locrian',
    name: 'Lócrio (VII)',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    description: 'Sétimo modo. Som tenso, instável e jazzístico.',
    category: 'modes',
    mood: 'Tenso, instável, jazzístico',
    difficulty: 'advanced'
  },

  // ============ ESCALAS PENTATÔNICAS ============
  'major-pentatonic': {
    type: 'major-pentatonic',
    name: 'Pentatônica Maior',
    intervals: [0, 2, 4, 7, 9],
    description: '5 notas. Essencial para solos e improvisação.',
    category: 'pentatonic',
    mood: 'Alegre, simples, versátil',
    difficulty: 'beginner'
  },
  'minor-pentatonic': {
    type: 'minor-pentatonic',
    name: 'Pentatônica Menor',
    intervals: [0, 3, 5, 7, 10],
    description: 'Base do blues rock. Expressiva e versátil.',
    category: 'pentatonic',
    mood: 'Blues, rock, expressivo',
    difficulty: 'beginner'
  },
  'blues-major': {
    type: 'blues-major',
    name: 'Blues Maior',
    intervals: [0, 2, 3, 4, 7, 9],
    description: 'Pentatônica maior com nota blues. Som happy blues.',
    category: 'blues',
    mood: 'Happy blues, alegre com tensão',
    difficulty: 'intermediate'
  },
  'blues-minor': {
    type: 'blues-minor',
    name: 'Blues Menor',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'A escala do blues clássico. Raw e emotiva.',
    category: 'blues',
    mood: 'Blues clássico, raw, emotivo',
    difficulty: 'intermediate'
  },

  // ============ ESCALAS EXÓTICAS ============
  'egyptian': {
    type: 'egyptian',
    name: 'Egípcia',
    intervals: [0, 2, 5, 7, 10],
    description: 'Pentatônica com intervalo de 3. Usada por Mark Knopfler.',
    category: 'exotic',
    mood: 'Exótico, oriental, misterioso',
    difficulty: 'advanced'
  },
  'hirajoshi': {
    type: 'hirajoshi',
    name: 'Hirajoshi',
    intervals: [0, 2, 3, 7, 8],
    description: 'Escala japonesa. Som característico do rock.',
    category: 'exotic',
    mood: 'Japonês, rock, melancólico',
    difficulty: 'advanced'
  },
  'whole-tone': {
    type: 'whole-tone',
    name: 'Tons Inteiros',
    intervals: [0, 2, 4, 6, 8, 10],
    description: '6 notas igualmente espaçadas. Sonora etérea.',
    category: 'exotic',
    mood: 'Etéreo, sonoro, dreamy',
    difficulty: 'advanced'
  },
  'chromatic': {
    type: 'chromatic',
    name: 'Cromática',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: 'Todas as 12 notas. Uso em efeitos e técnicas especiais.',
    category: 'exotic',
    mood: 'Cromático, tenso, experimental',
    difficulty: 'advanced'
  },
  'diminished-half': {
    type: 'diminished-half',
    name: 'Diminuta (T-S)',
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    description: 'Escala de tons inteiros e semitons. Tensa e cromática.',
    category: 'exotic',
    mood: 'Tensa, cromática, jazzística',
    difficulty: 'advanced'
  },
  'diminished-whole': {
    type: 'diminished-whole',
    name: 'Diminuta (S-T)',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    description: 'Diminuta oposta. Usada em jazz e cinema.',
    category: 'exotic',
    mood: 'Jazz, cinema, misterioso',
    difficulty: 'advanced'
  }
};

// ============================================
// QUALIDADES DE ACORDES POR GRAU
// ============================================

/**
 * Qualidades de acordes para cada grau do campo harmônico
 */
const CHORD_QUALITIES_BY_SCALE: Record<ScaleType, ChordType[]> = {
  'major': ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  'natural-minor': ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  'harmonic-minor': ['minor', 'diminished', 'augmented', 'minor', 'major', 'major', 'diminished'],
  'melodic-minor': ['minor', 'minor', 'augmented', 'major', 'major', 'diminished', 'diminished'],
  'ionian': ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  'dorian': ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
  'phrygian': ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
  'lydian': ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'],
  'mixolydian': ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
  'aeolian': ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  'locrian': ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor'],
  'major-pentatonic': ['major', 'minor', 'minor', 'major', 'minor'],
  'minor-pentatonic': ['minor', 'major', 'major', 'minor', 'major'],
  'blues-major': ['major', 'minor', 'minor', 'major', 'minor', 'major'],
  'blues-minor': ['minor', 'major', 'major', 'minor', 'major', 'minor'],
  // Escalas exóticas usam padrão menor como fallback
  'egyptian': ['minor', 'major', 'minor', 'major', 'minor'],
  'hirajoshi': ['minor', 'major', 'minor', 'major', 'minor'],
  'whole-tone': ['augmented', 'augmented', 'augmented', 'augmented', 'augmented', 'augmented'],
  'chromatic': ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  'diminished-half': ['diminished', 'diminished', 'diminished', 'diminished', 'diminished', 'diminished', 'diminished', 'diminished'],
  'diminished-whole': ['diminished', 'diminished', 'diminished', 'diminished', 'diminished', 'diminished', 'diminished', 'diminished']
};

/**
 * Funções harmônicas por grau
 */
const HARMONIC_FUNCTIONS_BY_DEGREE: Record<number, HarmonicFunction> = {
  1: HarmonicFunction.TONIC,
  2: HarmonicFunction.SUPER_TONIC,
  3: HarmonicFunction.MEDIANT,
  4: HarmonicFunction.SUBDOMINANT,
  5: HarmonicFunction.DOMINANT,
  6: HarmonicFunction.SUBMEDIANT,
  7: HarmonicFunction.LEADING_TONE
};

/**
 * Números romanos por grau (minúsculo para menor/diminuído)
 */
const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'ii',
  3: 'iii',
  4: 'IV',
  5: 'V',
  6: 'vi',
  7: 'vii°'
};

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Gera as notas de uma escala
 */
export function generateScaleNotes(tonic: NoteName, scaleType: ScaleType): NoteName[] {
  const tonicIndex = getNoteIndex(tonic);
  const scale = SCALES[scaleType];
  
  if (tonicIndex < 0 || !scale) {
    return [];
  }

  return scale.intervals.map(interval => 
    getNoteByIndex(tonicIndex + interval) as NoteName
  );
}

/**
 * Gera o campo harmônico de uma escala
 */
export function generateHarmonicField(tonic: NoteName, scaleType: ScaleType): HarmonicDegree[] {
  const scaleNotes = generateScaleNotes(tonic, scaleType);
  if (scaleNotes.length === 0) return [];

  const chordQualities = CHORD_QUALITIES_BY_SCALE[scaleType] || CHORD_QUALITIES_BY_SCALE['major'];
  
  return scaleNotes.map((note, index) => {
    const degree = index + 1;
    const roman = ROMAN_NUMERALS[degree] || `${degree}`;
    const quality = chordQualities[index] || 'major';
    const functionName = HARMONIC_FUNCTIONS_BY_DEGREE[degree] || HarmonicFunction.TONIC;
    
    // Notas do acorde (tríade básica)
    const chordNotes = [note];
    if (index + 2 < scaleNotes.length) {
      chordNotes.push(scaleNotes[index + 2]);
    }
    if (index + 4 < scaleNotes.length) {
      chordNotes.push(scaleNotes[index + 4]);
    }

    return {
      degree,
      roman,
      chord: note,
      quality,
      notes: chordNotes,
      function: functionName
    };
  });
}

/**
 * Calcula uma escala e retorna resultado completo
 */
export function calculateScale(tonic: NoteName, scaleType: ScaleType): ScaleResult {
  const scale = SCALES[scaleType];
  
  if (!scale) {
    throw new Error(`Tipo de escala "${scaleType}" não encontrado`);
  }

  const notes = generateScaleNotes(tonic, scaleType);
  const intervals = scale.intervals;
  const harmonicField = generateHarmonicField(tonic, scaleType);

  return {
    tonic,
    type: scaleType,
    notes,
    intervals,
    degrees: [], // Será preenchido pela engine principal
    harmonicField
  };
}

/**
 * Transpõe uma escala para outra tonalidade
 */
export function transposeScaleNotes(notes: NoteName[], semitones: number): NoteName[] {
  return notes.map(note => {
    const index = getNoteIndex(note);
    return getNoteByIndex(index + semitones) as NoteName;
  });
}

// ============================================
// FUNÇÕES DE ACESSO A DADOS
// ============================================

/**
 * Lista todas as escalas disponíveis
 */
export function getAllScales(): ScaleInfo[] {
  return Object.values(SCALES);
}

/**
 * Busca uma escala pelo tipo
 */
export function getScaleByType(type: ScaleType): ScaleInfo | undefined {
  return SCALES[type];
}

/**
 * Busca escalas por categoria
 */
export function getScalesByCategory(category: ScaleCategory): ScaleInfo[] {
  return Object.values(SCALES).filter(scale => scale.category === category);
}

/**
 * Busca escalas por nível de dificuldade
 */
export function getScalesByDifficulty(difficulty: DifficultyLevel): ScaleInfo[] {
  return Object.values(SCALES).filter(scale => scale.difficulty === difficulty);
}

/**
 * Retorna as 5 tonalidades do tier Free
 */
export function getFreeTierTonics(): NoteName[] {
  return ['C', 'G', 'F', 'A', 'E'];
}

/**
 * Verifica se uma tônica está disponível no tier Free
 */
export function isTonicFree(tonic: NoteName): boolean {
  const freeTonics = getFreeTierTonics();
  return freeTonics.includes(tonic);
}

/**
 * Retorna escalas recomendadas para iniciantes
 */
export function getRecommendedScalesForBeginners(): ScaleType[] {
  return ['major', 'natural-minor', 'major-pentatonic', 'minor-pentatonic', 'aeolian'];
}

/**
 * Retorna escalas recomendadas para um humor específico
 */
export function getScalesByMood(mood: string): ScaleInfo[] {
  const moodLower = mood.toLowerCase();
  return Object.values(SCALES).filter(scale => 
    scale.mood?.toLowerCase().includes(moodLower)
  );
}

// ============================================
// FUNÇÕES DE ANÁLISE
// ============================================

/**
 * Analisa uma sequência de notas e sugere escalas possíveis
 */
export function analyzeNotesForScales(notes: NoteName[]): {
  possibleScales: ScaleType[];
  bestMatch?: ScaleType;
  confidence: number;
} {
  if (notes.length === 0) {
    return { possibleScales: [], confidence: 0 };
  }

  const possibleScales: ScaleType[] = [];
  let bestMatch: ScaleType | undefined;
  let highestConfidence = 0;

  // Para cada escala no banco de dados
  for (const scaleType of Object.keys(SCALES) as ScaleType[]) {
    const scaleInfo = SCALES[scaleType];
    
    // Verifica quantas notas da sequência estão na escala
    let matches = 0;
    for (const note of notes) {
      // Gera a escala começando de cada nota possível
      for (const tonic of getFreeTierTonics()) {
        const scaleNotes = generateScaleNotes(tonic, scaleType);
        if (scaleNotes.includes(note)) {
          matches++;
          break;
        }
      }
    }
    
    const confidence = notes.length > 0 ? matches / notes.length : 0;
    
    if (confidence > 0.7) { // 70% de correspondência
      possibleScales.push(scaleType);
      
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = scaleType;
      }
    }
  }

  return {
    possibleScales,
    bestMatch,
    confidence: highestConfidence
  };
}

/**
 * Compara duas escalas e retorna suas diferenças
 */
export function compareScales(
  scale1Type: ScaleType, 
  scale2Type: ScaleType
): {
  commonNotes: number;
  differentNotes: number;
  similarity: number;
  differences: string[];
} {
  const scale1 = SCALES[scale1Type];
  const scale2 = SCALES[scale2Type];
  
  if (!scale1 || !scale2) {
    return { commonNotes: 0, differentNotes: 0, similarity: 0, differences: [] };
  }

  // Usa C como tônica padrão para comparação
  const notes1 = generateScaleNotes('C', scale1Type);
  const notes2 = generateScaleNotes('C', scale2Type);
  
  const commonNotes = notes1.filter(note => notes2.includes(note)).length;
  const differentNotes = Math.abs(notes1.length - notes2.length) + 
    (notes1.length + notes2.length - 2 * commonNotes);
  
  const similarity = commonNotes / Math.max(notes1.length, notes2.length);
  
  const differences: string[] = [];
  if (scale1.category !== scale2.category) {
    differences.push(`Categoria: ${scale1.category} vs ${scale2.category}`);
  }
  if (scale1.difficulty !== scale2.difficulty) {
    differences.push(`Dificuldade: ${scale1.difficulty} vs ${scale2.difficulty}`);
  }
  if (scale1.mood !== scale2.mood) {
    differences.push(`Humor: ${scale1.mood} vs ${scale2.mood}`);
  }

  return {
    commonNotes,
    differentNotes,
    similarity,
    differences
  };
}