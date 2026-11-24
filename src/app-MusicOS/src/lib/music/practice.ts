/**
 * Catálogo de prática no instrumento: técnica, riffs e melodias para tocar junto.
 *
 * Direitos autorais: só material ORIGINAL (composto para o MusicOS) ou em
 * DOMÍNIO PÚBLICO (compositores mortos há mais de 70 anos e canções
 * tradicionais). Não adicione riffs ou melodias de músicas protegidas.
 *
 * As notas são guardadas como alturas (não como tablatura): a tab é calculada
 * para o instrumento e a afinação escolhidos (lib/music/tablature).
 */

import { pitchToMidi } from './tunings';
import type { TabNote } from './tablature';

export type PracticeCategory = 'tecnica' | 'riff' | 'melodia';
export type PracticeLevel = 'iniciante' | 'intermediario' | 'avancado';

export interface PracticeNote {
  /** Altura MIDI; null = pausa */
  m: number | null;
  /** Duração em tempos (1 = semínima) */
  d: number;
}

export interface PracticeExercise {
  id: string;
  title: string;
  category: PracticeCategory;
  level: PracticeLevel;
  bpm: number;
  /** Tempos por compasso */
  meter: number;
  /** Tempos de anacruse (antes do 1º compasso) */
  pickup?: number;
  description: string;
  tip?: string;
  source: 'original' | 'dominio-publico';
  credit?: string;
  /** Liberado no plano grátis */
  free?: boolean;
  /** Região preferida da mão (casa inicial) para calcular a tab */
  position?: number;
  notes?: PracticeNote[];
  /** Exercícios gerados para a afinação atual (técnica corda a corda) */
  build?: (tuning: string[], stringStartFret?: number[]) => { notes: PracticeNote[]; positions: (TabNote | null)[] };
}

export const CATEGORY_LABEL: Record<PracticeCategory, string> = {
  tecnica: 'Técnica',
  riff: 'Riffs e frases',
  melodia: 'Melodias',
};

export const LEVEL_LABEL: Record<PracticeLevel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

/**
 * Notação compacta: "E4 D#4:0.5 R:1" → notas. Sem ":d" usa a duração padrão.
 * "R" é pausa; "|" separa compassos (só para leitura).
 */
export function seq(text: string, defaultDur = 1): PracticeNote[] {
  return text
    .split(/\s+/)
    .filter((t) => t && t !== '|')
    .map((tok) => {
      const [name, dur] = tok.split(':');
      const d = dur ? Number(dur) : defaultDur;
      return { m: name === 'R' ? null : pitchToMidi(name), d };
    });
}

/** Boogie de blues de uma nota: 1 3 5 6 b7 6 5 3 em colcheias, a partir da fundamental. */
function boogie(root: string): PracticeNote[] {
  const r = pitchToMidi(root);
  return [0, 4, 7, 9, 10, 9, 7, 4].map((i) => ({ m: r + i, d: 0.5 }));
}

export const PRACTICE: PracticeExercise[] = [
  // -------------------------------------------------- Técnica
  {
    id: 'cromatico-1234',
    title: 'Aquecimento cromático 1-2-3-4',
    category: 'tecnica',
    level: 'iniciante',
    bpm: 70,
    meter: 4,
    free: true,
    source: 'original',
    description: 'Um dedo por casa, da corda mais grave à mais aguda e de volta. O aquecimento clássico para independência dos dedos.',
    tip: 'Deixe cada dedo apoiado até precisar dele. Suba o andamento só quando sair limpo três vezes seguidas.',
    build: (tuning, starts) => {
      const open = tuning.map(pitchToMidi);
      const notes: PracticeNote[] = [];
      const positions: (TabNote | null)[] = [];
      const playable = open.map((_, s) => s).filter((s) => !(starts?.[s] ?? 0));
      for (const s of playable) {
        for (const f of [1, 2, 3, 4]) {
          notes.push({ m: open[s] + f, d: 0.5 });
          positions.push({ s, f });
        }
      }
      for (const s of [...playable].reverse()) {
        for (const f of [4, 3, 2, 1]) {
          notes.push({ m: open[s] + f, d: 0.5 });
          positions.push({ s, f });
        }
      }
      return { notes, positions };
    },
  },
  {
    id: 'escala-do-maior',
    title: 'Escala de Dó maior na 1ª posição',
    category: 'tecnica',
    level: 'iniciante',
    bpm: 70,
    meter: 4,
    position: 0,
    source: 'original',
    description: 'A escala maior subindo e descendo, usando cordas soltas. Base para ler e tocar melodias.',
    tip: 'Diga o nome de cada nota em voz alta enquanto toca.',
    notes: seq('C3 D3 E3 F3 G3 A3 B3 C4 | C4 B3 A3 G3 F3 E3 D3 C3'),
  },
  {
    id: 'arpejos-c-am-f-g',
    title: 'Arpejos C – Am – F – G',
    category: 'tecnica',
    level: 'iniciante',
    bpm: 75,
    meter: 4,
    position: 0,
    source: 'original',
    description: 'As notas de cada acorde, uma de cada vez. Treina a mão direita e mostra como os acordes são formados.',
    notes: seq(
      'C3 E3 G3 C4 E4 C4 G3 E3 | A2 C3 E3 A3 C4 A3 E3 C3 | F2 A2 C3 F3 A3 F3 C3 A2 | G2 B2 D3 G3 B3 G3 D3 B2',
      0.5
    ),
  },
  {
    id: 'pentatonica-am-caixa1',
    title: 'Pentatônica de Lá menor (caixa 1)',
    category: 'tecnica',
    level: 'intermediario',
    bpm: 80,
    meter: 4,
    position: 5,
    source: 'original',
    description: 'A escala mais usada em solos de rock e blues, subindo e descendo na região da casa 5.',
    tip: 'Use palhetada alternada (baixo-cima) em todas as notas.',
    notes: seq('A2 C3 D3 E3 G3 A3 C4 D4 E4 G4 A4 C5 | C5 A4 G4 E4 D4 C4 A3 G3 E3 D3 C3 A2', 0.5),
  },

  // -------------------------------------------------- Riffs e frases (originais)
  {
    id: 'boogie-blues-e',
    title: 'Boogie de blues em Mi (12 compassos)',
    category: 'riff',
    level: 'iniciante',
    bpm: 90,
    meter: 4,
    free: true,
    source: 'original',
    description: 'A linha de baixo do blues de 12 compassos: E, A e B. Serve para guitarra, violão e baixo.',
    tip: 'Toque com swing: a primeira colcheia de cada par um pouco mais longa.',
    notes: [
      ...boogie('E2'), ...boogie('E2'), ...boogie('E2'), ...boogie('E2'),
      ...boogie('A2'), ...boogie('A2'), ...boogie('E2'), ...boogie('E2'),
      ...boogie('B2'), ...boogie('A2'), ...boogie('E2'), ...boogie('E2'),
    ],
  },
  {
    id: 'rock-la',
    title: 'Riff de rock em Lá',
    category: 'riff',
    level: 'intermediario',
    bpm: 100,
    meter: 4,
    source: 'original',
    description: 'Riff de uma nota com a corda Lá como pedal. Ótimo para palhetada para baixo e abafamento com a palma.',
    tip: 'Abafe levemente as cordas com a lateral da mão direita (palm mute).',
    notes: seq(
      'A2 A2 C3 A2 D3 A2 E3 D3 | A2 A2 C3 A2 G2 G2 A2:1 | A2 A2 C3 A2 D3 A2 E3 D3 | A2 A2 C3 A2 G2 G2 A2:1',
      0.5
    ),
  },
  {
    id: 'funk-mi',
    title: 'Groove de funk em Mi',
    category: 'riff',
    level: 'intermediario',
    bpm: 85,
    meter: 4,
    source: 'original',
    description: 'Semicolcheias com pausas: o segredo do funk é o que você NÃO toca. Funciona muito bem no baixo.',
    tip: 'Conte "1 e e a" e respeite as pausas abafando a corda.',
    notes: seq(
      'E2:0.25 R:0.25 E3:0.25 E2:0.25 R:0.5 B2:0.25 D3:0.25 E3:0.5 R:0.25 D3:0.25 B2:0.25 A2:0.25 E2:0.5 | ' +
        'E2:0.25 R:0.25 E3:0.25 E2:0.25 R:0.5 B2:0.25 D3:0.25 E3:0.5 R:0.25 D3:0.25 B2:0.25 A2:0.25 G2:0.25 G#2:0.25'
    ),
  },
  {
    id: 'lick-pentatonica-am',
    title: 'Frase de pentatônica em Lá menor',
    category: 'riff',
    level: 'intermediario',
    bpm: 90,
    meter: 4,
    position: 5,
    source: 'original',
    description: 'Uma frase curta de solo, para usar sobre um blues ou rock em Lá menor.',
    tip: 'Tente fazer um bend de meio tom na nota G antes do A final.',
    notes: seq('C5 A4 G4 A4 E4 G4 A4 C5 | D5 C5 A4 G4 A4:2', 0.5),
  },
  {
    id: 'frase-choro-re',
    title: 'Frase de choro em Ré maior',
    category: 'riff',
    level: 'avancado',
    bpm: 70,
    meter: 2,
    source: 'original',
    description: 'Arpejo e escala em semicolcheias, no estilo das frases de choro. Exige mão esquerda solta.',
    tip: 'Comece a 50% do andamento e use o loop.',
    notes: seq('D4 F#4 A4 D5 C#5 A4 F#4 E4 | D4 E4 F#4 G4 A4 B4 C#5 D5 | E5 D5 C#5 B4 A4 G4 F#4 E4 | D4:2', 0.25),
  },

  // -------------------------------------------------- Melodias em domínio público
  {
    id: 'brilha-brilha',
    title: 'Brilha, brilha, estrelinha',
    category: 'melodia',
    level: 'iniciante',
    bpm: 90,
    meter: 4,
    free: true,
    source: 'dominio-publico',
    credit: 'Melodia tradicional francesa (séc. XVIII)',
    description: 'Melodia simples em Dó maior, com notas repetidas: perfeita para os primeiros passos.',
    notes: seq(
      'C4 C4 G4 G4 A4 A4 G4:2 | F4 F4 E4 E4 D4 D4 C4:2 | G4 G4 F4 F4 E4 E4 D4:2 | G4 G4 F4 F4 E4 E4 D4:2 | C4 C4 G4 G4 A4 A4 G4:2 | F4 F4 E4 E4 D4 D4 C4:2'
    ),
  },
  {
    id: 'carneirinho',
    title: 'Mary Had a Little Lamb',
    category: 'melodia',
    level: 'iniciante',
    bpm: 100,
    meter: 4,
    source: 'dominio-publico',
    credit: 'Canção tradicional norte-americana (1830)',
    description: 'Só três notas na maior parte da música: ótima para treinar a troca entre cordas.',
    notes: seq('E4 D4 C4 D4 E4 E4 E4:2 | D4 D4 D4:2 E4 G4 G4:2 | E4 D4 C4 D4 E4 E4 E4 E4 | D4 D4 E4 D4 C4:4'),
  },
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    category: 'melodia',
    level: 'iniciante',
    bpm: 100,
    meter: 4,
    source: 'dominio-publico',
    credit: 'Canção tradicional francesa',
    description: 'Melodia que pode ser tocada em cânone: um começa, outro entra dois compassos depois.',
    notes: seq(
      'C4 D4 E4 C4 C4 D4 E4 C4 | E4 F4 G4:2 E4 F4 G4:2 | G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4 C4 G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4 C4 | C4 G3 C4:2 C4 G3 C4:2'
    ),
  },
  {
    id: 'ode-alegria',
    title: 'Ode à Alegria',
    category: 'melodia',
    level: 'iniciante',
    bpm: 100,
    meter: 4,
    source: 'dominio-publico',
    credit: 'Ludwig van Beethoven, 9ª Sinfonia (1824)',
    description: 'O tema mais famoso de Beethoven, quase todo em graus conjuntos.',
    notes: seq(
      'E4 E4 F4 G4 G4 F4 E4 D4 | C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2 | E4 E4 F4 G4 G4 F4 E4 D4 | C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2'
    ),
  },
  {
    id: 'canone-pachelbel',
    title: 'Cânone em Ré: linha do baixo',
    category: 'melodia',
    level: 'iniciante',
    bpm: 70,
    meter: 4,
    source: 'dominio-publico',
    credit: 'Johann Pachelbel (c. 1680)',
    description: 'A sequência de baixo mais famosa da música: D A Bm F#m G D G A. Ideal no baixo.',
    notes: seq('D3:2 A2:2 B2:2 F#2:2 G2:2 D2:2 G2:2 A2:2 | D3:2 A2:2 B2:2 F#2:2 G2:2 D2:2 G2:2 A2:2'),
  },
  {
    id: 'greensleeves',
    title: 'Greensleeves',
    category: 'melodia',
    level: 'intermediario',
    bpm: 90,
    meter: 3,
    pickup: 1,
    source: 'dominio-publico',
    credit: 'Canção tradicional inglesa (séc. XVI)',
    description: 'Em 3/4 e Lá menor, com ritmo pontuado e a sensível G# da escala menor harmônica.',
    notes: seq(
      'A3 | C4:2 D4 | E4:1.5 F4:0.5 E4 | D4:2 B3 | G3:1.5 A3:0.5 B3 | C4:2 A3 | A3:1.5 G#3:0.5 A3 | B3:2 G#3 | E3:2 A3 | ' +
        'C4:2 D4 | E4:1.5 F4:0.5 E4 | D4:2 B3 | G3:1.5 A3:0.5 B3 | C4:1.5 B3:0.5 A3 | G#3:1.5 F#3:0.5 G#3 | A3:3'
    ),
  },
  {
    id: 'fur-elise',
    title: 'Für Elise (tema)',
    category: 'melodia',
    level: 'avancado',
    bpm: 70,
    meter: 3,
    pickup: 1,
    position: 5,
    source: 'dominio-publico',
    credit: 'Ludwig van Beethoven (1810)',
    description: 'O tema completo da primeira parte, com o famoso movimento E–D#. Exige troca rápida de cordas.',
    notes: seq(
      'E5:0.5 D#5:0.5 | E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 | A4 R:0.5 C4:0.5 E4:0.5 A4:0.5 | B4 R:0.5 E4:0.5 G#4:0.5 B4:0.5 | ' +
        'C5 R:0.5 E4:0.5 E5:0.5 D#5:0.5 | E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 | A4 R:0.5 C4:0.5 E4:0.5 A4:0.5 | B4 R:0.5 E4:0.5 C5:0.5 B4:0.5 | A4:3'
    ),
  },
];

export function getPractice(id: string): PracticeExercise | undefined {
  return PRACTICE.find((p) => p.id === id);
}

export const FREE_PRACTICE_IDS = new Set(PRACTICE.filter((p) => p.free).map((p) => p.id));

export function totalBeats(notes: PracticeNote[]): number {
  return notes.reduce((sum, n) => sum + n.d, 0);
}
