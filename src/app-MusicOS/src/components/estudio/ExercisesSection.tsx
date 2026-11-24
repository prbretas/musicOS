'use client';

/**
 * Treino auditivo (recurso Pro): intervalos e qualidade de acordes.
 * Toca o som, o aluno responde, o app corrige e guarda a pontuação localmente.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { playChordMidi, playMidi, playSequenceMidi } from '@/lib/audio/synth';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { RankingPanel } from './RankingPanel';
import { ProgressPanel } from './ProgressPanel';
import { ProGate, useProFeature } from '@/components/pro/ProGate';
import { CagedTrainer } from './CagedTrainer';

type Mode = 'intervals' | 'chords';
type Level = 'beginner' | 'intermediate' | 'advanced';

interface Option {
  id: string;
  label: string;
  /** semitons (intervalo) ou notas do acorde a partir da fundamental */
  value: number | number[];
}

const INTERVALS: Record<Level, Option[]> = {
  beginner: [
    { id: 'P1', label: 'Uníssono', value: 0 },
    { id: 'M3', label: '3ª maior', value: 4 },
    { id: 'P5', label: '5ª justa', value: 7 },
    { id: 'P8', label: '8ª', value: 12 },
  ],
  intermediate: [
    { id: 'm2', label: '2ª menor', value: 1 },
    { id: 'M2', label: '2ª maior', value: 2 },
    { id: 'm3', label: '3ª menor', value: 3 },
    { id: 'M3', label: '3ª maior', value: 4 },
    { id: 'P4', label: '4ª justa', value: 5 },
    { id: 'P5', label: '5ª justa', value: 7 },
    { id: 'P8', label: '8ª', value: 12 },
  ],
  advanced: [
    { id: 'm2', label: '2ª menor', value: 1 },
    { id: 'M2', label: '2ª maior', value: 2 },
    { id: 'm3', label: '3ª menor', value: 3 },
    { id: 'M3', label: '3ª maior', value: 4 },
    { id: 'P4', label: '4ª justa', value: 5 },
    { id: 'TT', label: 'Trítono', value: 6 },
    { id: 'P5', label: '5ª justa', value: 7 },
    { id: 'm6', label: '6ª menor', value: 8 },
    { id: 'M6', label: '6ª maior', value: 9 },
    { id: 'm7', label: '7ª menor', value: 10 },
    { id: 'M7', label: '7ª maior', value: 11 },
    { id: 'P8', label: '8ª', value: 12 },
  ],
};

const CHORDS: Record<Level, Option[]> = {
  beginner: [
    { id: 'maj', label: 'Maior', value: [0, 4, 7] },
    { id: 'min', label: 'Menor', value: [0, 3, 7] },
  ],
  intermediate: [
    { id: 'maj', label: 'Maior', value: [0, 4, 7] },
    { id: 'min', label: 'Menor', value: [0, 3, 7] },
    { id: 'dim', label: 'Diminuto', value: [0, 3, 6] },
    { id: 'aug', label: 'Aumentado', value: [0, 4, 8] },
  ],
  advanced: [
    { id: 'maj', label: 'Maior', value: [0, 4, 7] },
    { id: 'min', label: 'Menor', value: [0, 3, 7] },
    { id: 'dim', label: 'Diminuto', value: [0, 3, 6] },
    { id: 'aug', label: 'Aumentado', value: [0, 4, 8] },
    { id: 'maj7', label: 'Maior com 7ª maior', value: [0, 4, 7, 11] },
    { id: 'dom7', label: 'Dominante (7)', value: [0, 4, 7, 10] },
    { id: 'min7', label: 'Menor com 7ª', value: [0, 3, 7, 10] },
    { id: 'm7b5', label: 'Meio-diminuto (m7b5)', value: [0, 3, 6, 10] },
  ],
};

const LEVEL_LABELS: Record<Level, string> = { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' };
const STORAGE_KEY = 'musicos:ear-training:v1';

interface Stats {
  correct: number;
  total: number;
  streak: number;
  best: number;
}

function loadStats(key: string): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Stats>) : {};
    return all[key] ?? { correct: 0, total: 0, streak: 0, best: 0 };
  } catch {
    return { correct: 0, total: 0, streak: 0, best: 0 };
  }
}

function saveStats(key: string, stats: Stats) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Stats>) : {};
    all[key] = stats;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
}

function randomRoot(): number {
  return 55 + Math.floor(Math.random() * 12); // G3..F#4
}

function EarTrainer() {
  const [mode, setMode] = useState<Mode>('intervals');
  const [level, setLevel] = useState<Level>('beginner');
  const [root, setRoot] = useState(randomRoot);
  const [answer, setAnswer] = useState<Option | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, streak: 0, best: 0 });
  const [melodic, setMelodic] = useState(true);
  const { user, entitlement } = useAuth();
  const fullPro = useProFeature('exercises');
  const isFreeCombo = (m: Mode, l: Level) => m === 'intervals' && l === 'beginner';
  const [sessionPoints, setSessionPoints] = useState(0);
  const [scoreNote, setScoreNote] = useState<string | null>(null);

  const statsKey = `${mode}:${level}`;
  const options = useMemo(() => (mode === 'intervals' ? INTERVALS[level] : CHORDS[level]), [mode, level]);

  useEffect(() => {
    setStats(loadStats(statsKey));
  }, [statsKey]);

  const play = useCallback(
    (opt: Option, r: number) => {
      if (typeof opt.value === 'number') {
        if (melodic) playSequenceMidi([r, r + opt.value], 0.45);
        else playChordMidi([r, r + opt.value], 1.4, 0);
      } else {
        playChordMidi(
          opt.value.map((s) => r + s),
          1.6
        );
      }
    },
    [melodic]
  );

  const next = useCallback(() => {
    const opt = options[Math.floor(Math.random() * options.length)];
    const r = randomRoot();
    setRoot(r);
    setAnswer(opt);
    setPicked(null);
    play(opt, r);
  }, [options, play]);

  function choose(opt: Option) {
    if (!answer || picked) return;
    setPicked(opt.id);
    const ok = opt.id === answer.id;
    const streak = ok ? stats.streak + 1 : 0;
    const updated: Stats = {
      correct: stats.correct + (ok ? 1 : 0),
      total: stats.total + 1,
      streak,
      best: Math.max(stats.best, streak),
    };
    setStats(updated);
    saveStats(statsKey, updated);

    // Pontuação oficial (ranking): calculada e validada no servidor
    if (user && entitlement.isPro) {
      void createClient()
        .rpc('record_exercise_attempt', { p_mode: mode, p_level: level, p_correct: ok })
        .then(({ data, error }) => {
          if (error) {
            setScoreNote(
              /too_fast/.test(error.message)
                ? 'Resposta rápida demais: não pontuou no ranking.'
                : 'Sem conexão: esta resposta não entrou no ranking.'
            );
            return;
          }
          const row = (Array.isArray(data) ? data[0] : data) as { points: number; answered_today: number } | null;
          const pts = row?.points ?? 0;
          setSessionPoints((p) => p + pts);
          setScoreNote(
            row && row.answered_today > 400
              ? 'Limite diário de 400 respostas pontuadas atingido. Continue treinando, amanhã conta de novo.'
              : pts > 0
                ? `+${pts} ${pts === 1 ? 'ponto' : 'pontos'} no ranking`
                : null
          );
        });
    }
  }

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="card p-6 space-y-6">
      {/* Configuração */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-ink-500 text-sm">
          {(['intervals', 'chords'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                // Grátis: só intervalos no nível iniciante
                if (m === 'chords' && !fullPro.gate()) return;
                setMode(m);
                setAnswer(null);
                setPicked(null);
              }}
              className={`px-4 py-2 font-semibold ${mode === m ? 'bg-brand-500 text-white' : 'bg-ink-700 text-slate-300 hover:bg-ink-600'}`}
            >
              {m === 'intervals' ? 'Intervalos' : 'Acordes'}
              {m === 'chords' && !fullPro.allowed && <span className="ml-1.5 align-middle">★</span>}
            </button>
          ))}
        </div>

        <select
          value={level}
          onChange={(e) => {
            const next = e.target.value as Level;
            if (!isFreeCombo(mode, next) && !fullPro.gate()) return;
            setLevel(next);
            setAnswer(null);
            setPicked(null);
          }}
          aria-label="Nível"
        >
          {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABELS[l]}
              {!isFreeCombo(mode, l) && !fullPro.allowed ? '  ★ PRO' : ''}
            </option>
          ))}
        </select>

        {mode === 'intervals' && (
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={melodic} onChange={(e) => setMelodic(e.target.checked)} />
            Melódico (uma nota depois da outra)
          </label>
        )}

        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-slate-400">
            Acertos: <strong className="text-white">{stats.correct}</strong>/{stats.total} ({accuracy}%)
          </span>
          <span className="text-slate-400">
            Sequência: <strong className="text-pro-300">{stats.streak}</strong> · melhor {stats.best}
          </span>
          {user && entitlement.isPro && (
            <span className="text-slate-400">
              Nesta sessão: <strong className="text-brand-300">{sessionPoints} pts</strong>
            </span>
          )}
        </div>
      </div>

      {/* Exercício */}
      <div className="rounded-2xl bg-ink-900 border border-ink-600 p-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button onClick={next} className="btn-primary">
            {answer ? '▶ Próximo' : '▶ Começar'}
          </button>
          {answer && (
            <button onClick={() => play(answer, root)} className="btn-secondary">
              🔁 Ouvir de novo
            </button>
          )}
          <button onClick={() => playMidi(root, 0.8)} disabled={!answer} className="btn-ghost">
            Tocar a fundamental
          </button>
          <p className="text-sm text-slate-500 w-full sm:w-auto sm:ml-auto">
            {mode === 'intervals' ? 'Qual é o intervalo entre as duas notas?' : 'Qual é a qualidade do acorde?'}
          </p>
        </div>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {options.map((opt) => {
            const isAnswer = answer?.id === opt.id;
            const isPicked = picked === opt.id;
            let cls = 'bg-ink-700 border-ink-500 text-slate-200 hover:bg-ink-600';
            if (picked) {
              if (isAnswer) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200';
              else if (isPicked) cls = 'bg-red-500/20 border-red-400 text-red-200';
              else cls = 'bg-ink-700 border-ink-600 text-slate-500';
            }
            return (
              <button
                key={opt.id}
                onClick={() => choose(opt)}
                disabled={!answer || picked !== null}
                className={`px-3 py-3 rounded-lg border text-sm font-semibold transition-colors disabled:cursor-default ${cls}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {picked && answer && (
          <p className={`mt-4 text-sm font-semibold ${picked === answer.id ? 'text-emerald-300' : 'text-red-300'}`}>
            {picked === answer.id ? '✔ Certo!' : `✘ Era ${answer.label}.`}{' '}
            <button onClick={next} className="link font-normal">
              Próximo →
            </button>
          </p>
        )}
      </div>

      {scoreNote && <p className="text-xs text-brand-300 -mt-3">{scoreNote}</p>}

      <p className="text-xs text-slate-500">
        Pontos por acerto: iniciante 1, intermediário 2, avançado 3 (+1 em acordes). Dica: comece pelo nível iniciante e só suba quando passar de 90% de acertos. Seu progresso fica salvo neste navegador.
      </p>
    </div>
  );
}

type Tab = 'train' | 'caged' | 'progress' | 'ranking';

export function ExercisesSection() {
  const [tab, setTab] = useState<Tab>('train');
  const tabs: { id: Tab; label: string }[] = [
    { id: 'train', label: '🎧 Treinar' },
    { id: 'caged', label: '🎸 Escalas no CAGED' },
    { id: 'progress', label: '📈 Meu progresso' },
    { id: 'ranking', label: '🏆 Ranking' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Exercícios">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-brand-500 text-white' : 'bg-ink-600 text-slate-300 hover:bg-ink-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'train' && <EarTrainer />}
      {tab === 'caged' && (
        <ProGate feature="caged" title="Escalas no CAGED">
          <CagedTrainer />
        </ProGate>
      )}
      {tab === 'progress' && (
        <ProGate feature="exercises" title="Histórico de progresso">
          <ProgressPanel />
        </ProGate>
      )}
      {tab === 'ranking' && (
        <ProGate feature="exercises" title="Ranking semanal e mensal">
          <RankingPanel />
        </ProGate>
      )}
    </div>
  );
}
