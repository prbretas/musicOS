'use client';

/**
 * Afinador cromático com microfone (recurso Pro).
 *
 * Detecção de altura por autocorrelação (ACF2+): robusta para cordas e voz,
 * sem dependências. Mostra a nota mais próxima, o desvio em cents e as
 * cordas do instrumento selecionado como referência.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TUNINGS, type InstrumentType } from '@/lib/music/tunings';
import { playMidi } from '@/lib/audio/synth';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4 = 440;

function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / A4);
}

function pitchToMidi(pitch: string): number {
  const m = pitch.match(/^([A-G]#?)(\d)$/);
  if (!m) return 60;
  return (Number(m[2]) + 1) * 12 + NOTE_NAMES.indexOf(m[1]);
}

/** Autocorrelação com interpolação parabólica. Retorna -1 se não há sinal. */
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let size = buf.length;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / size);
  if (rms < 0.01) return -1; // silêncio

  // Recorta as bordas silenciosas
  let r1 = 0;
  let r2 = size - 1;
  const thres = 0.2;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buf[size - i]) < thres) {
      r2 = size - i;
      break;
    }
  }
  buf = buf.slice(r1, r2);
  size = buf.length;

  const c = new Array<number>(size).fill(0);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) c[i] += buf[j] * buf[j + i];
  }

  let d = 0;
  while (d < size - 1 && c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < size; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  if (maxpos <= 0) return -1;
  let T0 = maxpos;

  const x1 = c[T0 - 1] ?? c[T0];
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? c[T0];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

type Status = 'idle' | 'starting' | 'listening' | 'denied' | 'unsupported';

export function TunerPanel() {
  const [status, setStatus] = useState<Status>('idle');
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');
  const [freq, setFreq] = useState<number | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    smoothRef.current = null;
    setFreq(null);
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      ctxRef.current = ctx;
      streamRef.current = stream;
      const buf = new Float32Array(analyser.fftSize);

      const loop = () => {
        analyser.getFloatTimeDomainData(buf);
        const f = autoCorrelate(buf, ctx.sampleRate);
        if (f > 30 && f < 5000) {
          // suaviza para a agulha não tremer
          smoothRef.current = smoothRef.current === null ? f : smoothRef.current * 0.7 + f * 0.3;
          setFreq(smoothRef.current);
        } else {
          smoothRef.current = null;
          setFreq(null);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      setStatus('listening');
      loop();
    } catch {
      setStatus('denied');
    }
  }, []);

  useEffect(() => stop, [stop]);

  const midiFloat = freq ? freqToMidi(freq) : null;
  const midi = midiFloat !== null ? Math.round(midiFloat) : null;
  const cents = midiFloat !== null && midi !== null ? Math.round((midiFloat - midi) * 100) : null;
  const noteName = midi !== null ? NOTE_NAMES[((midi % 12) + 12) % 12] : '—';
  const octave = midi !== null ? Math.floor(midi / 12) - 1 : '';
  const inTune = cents !== null && Math.abs(cents) <= 5;
  const needle = cents !== null ? Math.max(-50, Math.min(50, cents)) : 0;

  const strings = TUNINGS[instrument][0].pitches;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <select value={instrument} onChange={(e) => setInstrument(e.target.value as InstrumentType)} aria-label="Instrumento">
          <option value="guitar">🎸 Guitarra / Violão</option>
          <option value="ukulele">🪕 Ukulele</option>
        </select>
        {status === 'listening' ? (
          <button onClick={stop} className="btn-secondary">
            Parar
          </button>
        ) : (
          <button onClick={start} disabled={status === 'starting'} className="btn-primary">
            {status === 'starting' ? 'Ativando…' : '🎤 Ativar microfone'}
          </button>
        )}
      </div>

      {status === 'denied' && (
        <p className="text-sm text-amber-300">
          Sem acesso ao microfone. Libere a permissão no navegador e tente de novo.
        </p>
      )}
      {status === 'unsupported' && <p className="text-sm text-amber-300">Seu navegador não suporta captura de áudio.</p>}

      {/* Mostrador */}
      <div className="rounded-2xl bg-ink-900 border border-ink-600 p-6 text-center">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          {status === 'listening' ? (freq ? 'Ouvindo' : 'Toque uma corda') : 'Microfone desligado'}
        </div>
        <div
          className={`text-7xl font-black font-display leading-none transition-colors ${
            inTune ? 'text-emerald-400' : freq ? 'text-white' : 'text-slate-600'
          }`}
        >
          {noteName}
          <span className="text-2xl align-top text-slate-500 ml-1">{octave}</span>
        </div>
        <div className="text-sm text-slate-400 mt-2 h-5">
          {freq ? `${freq.toFixed(1)} Hz · ${cents! > 0 ? '+' : ''}${cents} cents` : ' '}
        </div>

        {/* Agulha */}
        <div className="relative mt-5 h-10">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-red-500/60 via-emerald-500/70 to-red-500/60" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
          <div
            className={`absolute top-0 bottom-0 w-1.5 rounded-full transition-[left] duration-100 ${
              inTune ? 'bg-emerald-400' : 'bg-white'
            }`}
            style={{ left: `calc(50% + ${needle}% - 3px)`, opacity: freq ? 1 : 0.2 }}
          />
          <div className="absolute inset-x-0 -bottom-1 flex justify-between text-[10px] text-slate-600 px-1">
            <span>-50</span>
            <span>0</span>
            <span>+50</span>
          </div>
        </div>
      </div>

      {/* Cordas de referência */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Clique numa corda para ouvir a referência:</p>
        <div className="flex flex-wrap gap-2">
          {strings.map((p, i) => {
            const m = pitchToMidi(p);
            const active = midi === m;
            return (
              <button
                key={p + i}
                onClick={() => playMidi(m, 1.2)}
                className={`px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  active ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-ink-700 border-ink-500 text-slate-200 hover:bg-ink-600'
                }`}
              >
                {strings.length - i}ª · {p}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
