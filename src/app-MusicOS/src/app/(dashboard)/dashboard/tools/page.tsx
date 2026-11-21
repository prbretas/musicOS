'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { InfoButton } from '@/components/ui/InfoButton';
import { CircleOfFifths as SharedCircleOfFifths } from '@/components/estudio/CircleOfFifths';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<'metronome' | 'tuner' | 'circle'>('metronome');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Ferramentas Musicais
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            metrônomo, tuner e círculo das quintas
          </p>
        </div>
      </div>

      {/* Tool selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'metronome', label: 'Metrônomo', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { id: 'tuner', label: 'Afinador', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { id: 'circle', label: 'Círculo das Quintas', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as typeof activeTool)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all
              ${
                activeTool === tool.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
            </svg>
            {tool.label}
          </button>
        ))}
      </div>

      {/* Tool content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        {activeTool === 'metronome' && <Metronome />}
        {activeTool === 'tuner' && <Tuner />}
        {activeTool === 'circle' && <CircleOfFifths />}
      </div>
    </div>
  );
}

function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSignature, setTimeSignature] = useState({ beats: 4, noteValue: 4 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentBeatRef = useRef(0);

  const playClick = useCallback((beat: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Higher pitch for first beat
    oscillator.frequency.value = beat === 0 ? 1000 : 800;
    oscillator.type = 'sine';

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      currentBeatRef.current = 0;
      playClick(0);

      const intervalMs = (60 / bpm) * 1000;
      intervalRef.current = setInterval(() => {
        currentBeatRef.current = (currentBeatRef.current + 1) % timeSignature.beats;
        playClick(currentBeatRef.current);
      }, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, timeSignature.beats, playClick]);

  const toggleMetronome = () => {
    setIsPlaying(!isPlaying);
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value);
    if (newBpm >= 40 && newBpm <= 240) {
      setBpm(newBpm);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-6">
          <div className={`w-24 h-24 rounded-full bg-white ${isPlaying ? 'animate-pulse' : ''}`}></div>
        </div>
        <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
          {bpm} BPM
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {timeSignature.beats}/{timeSignature.noteValue}
        </p>
      </div>

      {/* BPM slider */}
      <div className="space-y-4">
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={handleBpmChange}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>40</span>
          <span>240</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBpm(Math.max(40, bpm - 5))}
          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
        >
          -
        </button>
        <button
          onClick={toggleMetronome}
          className={`
            w-20 h-20 rounded-2xl font-bold text-xl transition-all shadow-lg
            ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}
          `}
        >
          {isPlaying ? 'Pare' : 'Inicie'}
        </button>
        <button
          onClick={() => setBpm(Math.min(240, bpm + 5))}
          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
        >
          +
        </button>
      </div>

      {/* Time signature */}
      <div className="flex items-center justify-center gap-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">Compasso:</span>
        <select
          value={`${timeSignature.beats}/${timeSignature.noteValue}`}
          onChange={(e) => {
            const [beats, noteValue] = e.target.value.split('/').map(Number);
            setTimeSignature({ beats, noteValue });
          }}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
        >
          <option value="2/4">2/4</option>
          <option value="3/4">3/4</option>
          <option value="4/4">4/4</option>
          <option value="6/8">6/8</option>
        </select>
      </div>
    </div>
  );
}

function Tuner() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-48 h-48 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg mb-6">
        <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center">
          <span className="text-6xl">🎵</span>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
        Afinador
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Toque uma corda para afinar
      </p>

      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {['E', 'A', 'D', 'G', 'B', 'E'].map((note, idx) => (
          <div
            key={note}
            className="p-4 rounded-xl bg-slate-100 dark:bg-slate-700"
          >
            <span className="text-2xl font-bold text-slate-800 dark:text-white">
              {note}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {idx === 0 || idx === 5 ? '2ª corda' : idx === 1 ? '3ª corda' : idx === 2 ? '4ª corda' : idx === 3 ? '5ª corda' : '1ª corda'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CircleOfFifths() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white">Ciclo de Quintas</h2>
      <SharedCircleOfFifths />
    </div>
  );
}