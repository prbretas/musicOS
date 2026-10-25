'use client';

import { useState, useEffect } from 'react';
import { InfoButton } from '@/components/ui/InfoButton';

type ExerciseCategory = 'ear-training' | 'scales' | 'chords' | 'rhythm';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: Difficulty;
  duration: number; // in minutes
  completed?: boolean;
}

const EXERCISES: Exercise[] = [
  {
    id: 'ear-1',
    title: 'Reconhecendo Intervalos',
    description: 'Identifique a distância entre duas notas tocadas consecutivamente.',
    category: 'ear-training',
    difficulty: 'beginner',
    duration: 5,
  },
  {
    id: 'ear-2',
    title: 'Maior ou Menor?',
    description: 'Diga se o trecho musical está em tom maior ou menor.',
    category: 'ear-training',
    difficulty: 'beginner',
    duration: 5,
  },
  {
    id: 'ear-3',
    title: 'Identificando Acordes',
    description: 'Reconheça acordes maiores, menores e diminutos pelo som.',
    category: 'ear-training',
    difficulty: 'intermediate',
    duration: 10,
  },
  {
    id: 'scales-1',
    title: 'Escala de Dó Maior',
    description: 'Pratique subir e descer a escala de Dó maior.',
    category: 'scales',
    difficulty: 'beginner',
    duration: 5,
  },
  {
    id: 'scales-2',
    title: 'Pentatônica em G',
    description: 'Domine a escala pentatônica de Sol.',
    category: 'scales',
    difficulty: 'beginner',
    duration: 10,
  },
  {
    id: 'scales-3',
    title: 'Mudança de Posição',
    description: 'Pratique escalar mudando de posição no braço.',
    category: 'scales',
    difficulty: 'intermediate',
    duration: 15,
  },
  {
    id: 'chords-1',
    title: 'Progressão Básica',
    description: 'Toque uma progressão I-IV-V-I em diferentes tons.',
    category: 'chords',
    difficulty: 'beginner',
    duration: 5,
  },
  {
    id: 'chords-2',
    title: 'Técnica de Strumming',
    description: 'Pratique padrões de dedilhado em diferentes tempos.',
    category: 'chords',
    difficulty: 'beginner',
    duration: 10,
  },
  {
    id: 'chords-3',
    title: 'Progressões com Sétimas',
    description: 'Toque progressões II-V-I com acordes de sétima.',
    category: 'chords',
    difficulty: 'advanced',
    duration: 15,
  },
  {
    id: 'rhythm-1',
    title: 'Clap dos Tempos',
    description: 'Bata palmas no tempo correto de compassos 4/4.',
    category: 'rhythm',
    difficulty: 'beginner',
    duration: 5,
  },
  {
    id: 'rhythm-2',
    title: 'Síncope Básica',
    description: 'Pratique padrões de música brasileira com síncope.',
    category: 'rhythm',
    difficulty: 'intermediate',
    duration: 10,
  },
  {
    id: 'rhythm-3',
    title: 'Polirritmia',
    description: 'Combine ritmos de 3 e 4 tempos simultaneamente.',
    category: 'rhythm',
    difficulty: 'advanced',
    duration: 20,
  },
];

export default function ExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const filteredExercises = EXERCISES.filter((exercise) => {
    if (selectedCategory !== 'all' && exercise.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && exercise.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const toggleCompletion = (id: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedExercises(newCompleted);
  };

  const categoryLabels: Record<ExerciseCategory | 'all', string> = {
    all: 'Todos',
    'ear-training': 'Treino Auditivo',
    scales: 'Escalas',
    chords: 'Acordes',
    rhythm: 'Ritmo',
  };

  const difficultyLabels: Record<Difficulty | 'all', string> = {
    all: 'Todos',
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };

  const categoryIcons: Record<ExerciseCategory, string> = {
    'ear-training': 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    scales: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
    chords: 'M4 6h16M4 12h16M4 18h16',
    rhythm: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Exercícios
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            pratique e melhore suas habilidades musicais
          </p>
        </div>
        <InfoButton
          content={`
            ### Sistema de Exercícios

            Os exercícios são organizados em 4 categorias:
            
            **🎧 Treino Auditivo**
            Desenvolva sua capacidade de reconhecer intervalos, acordes e escalas pelo som.
            
            **🎸 Escalas**
            Pratique escalas em diferentes posições e tons para melhorar sua técnica e solos.
            
            **🎵 Acordes**
            Aprenda progressões, técnicas de dedilhado e transições entre acordes.
            
            **🥁 Ritmo**
            Melhore sua precisão rítmica com exercícios de tempo e síncope.

            ### Dificuldade
            - **Iniciante**: Fundamentos básicos, ideal para quem está começando
            - **Intermediário**: Requer prática regular, conceitos mais avançados
            - **Avançado**: Para músicos experientes que buscam mastery

            ### Como usar
            1. Escolha uma categoria e nível de dificuldade
            2. Selecione um exercício
            3. Siga as instruções e pratique
            4. Marque como concluído ao terminar
          `}
          title="Guia de Exercícios"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: EXERCISES.length, color: 'from-slate-500 to-slate-600' },
          { label: 'Concluídos', value: completedExercises.size, color: 'from-green-500 to-emerald-500' },
          { label: 'Pendentes', value: EXERCISES.length - completedExercises.size, color: 'from-amber-500 to-orange-500' },
          { label: 'Tempo Total', value: `${Math.round(EXERCISES.reduce((acc, e) => acc + e.duration, 0) / 60)}h`, color: 'from-purple-500 to-pink-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Categoria
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                  ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }
                `}
              >
                {category !== 'all' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryIcons[category as ExerciseCategory]} />
                  </svg>
                )}
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Dificuldade
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(difficultyLabels) as Array<keyof typeof difficultyLabels>).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-all
                  ${
                    selectedDifficulty === difficulty
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }
                `}
              >
                {difficultyLabels[difficulty]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setActiveExercise(exercise)}
            className={`
              bg-white dark:bg-slate-800 rounded-2xl p-6 border cursor-pointer transition-all hover:shadow-lg
              ${completedExercises.has(exercise.id) ? 'border-green-300 dark:border-green-700' : 'border-slate-200 dark:border-slate-700'}
            `}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    {exercise.title}
                  </h3>
                  {completedExercises.has(exercise.id) && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      ✓ Concluído
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {exercise.description}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    exercise.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {difficultyLabels[exercise.difficulty]}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {exercise.duration} min
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompletion(exercise.id);
                }}
                className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all
                  ${
                    completedExercises.has(exercise.id)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 text-slate-400 hover:border-purple-500 hover:text-purple-500'
                  }
                `}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Nenhum exercício encontrado com os filtros selecionados.
        </div>
      )}

      {/* Exercise modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setActiveExercise(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  {activeExercise.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                    {categoryLabels[activeExercise.category]}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeExercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    activeExercise.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {difficultyLabels[activeExercise.difficulty]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveExercise(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-slate-600 dark:text-slate-300">
                {activeExercise.description}
              </p>

              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Instruções:</h4>
                <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    Leia atentamente o objetivo do exercício
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    Prepare seu instrumento (se aplicável)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    Comece lentamente e aumente a velocidade gradualmente
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    Pratique por pelo menos {activeExercise.duration} minutos
                  </li>
                </ol>
              </div>

              <button
                onClick={() => {
                  toggleCompletion(activeExercise.id);
                  setActiveExercise(null);
                }}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
              >
                {completedExercises.has(activeExercise.id) ? 'Marcar como não concluído' : 'Marcar como concluído'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}