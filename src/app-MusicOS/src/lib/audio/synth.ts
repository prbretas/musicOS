/**
 * Sintetizador simples (Web Audio API) para tocar notas, acordes e escalas.
 * O AudioContext so e criado no primeiro clique, como o navegador exige.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Frequencia de uma nota MIDI (69 = A4 = 440 Hz). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Toca uma nota MIDI. `when` e o atraso em segundos. */
export function playMidi(midi: number, duration = 0.8, when = 0, volume = 0.25): void {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + when;

  const osc = ac.createOscillator();
  const osc2 = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = 'triangle';
  osc2.type = 'sine';
  osc.frequency.value = midiToFreq(midi);
  osc2.frequency.value = midiToFreq(midi) * 2;

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(volume * 0.4, t + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  const g2 = ac.createGain();
  g2.gain.value = 0.15;
  osc.connect(gain);
  osc2.connect(g2).connect(gain);
  gain.connect(ac.destination);

  osc.start(t);
  osc2.start(t);
  osc.stop(t + duration + 0.05);
  osc2.stop(t + duration + 0.05);
}

/** Toca varias notas juntas (strum leve se `strum` > 0). */
export function playChordMidi(midis: number[], duration = 1.4, strum = 0.03): void {
  midis.forEach((m, i) => playMidi(m, duration, i * strum, 0.18));
}

/** Toca uma sequencia de notas, uma apos a outra. */
export function playSequenceMidi(midis: number[], step = 0.28): void {
  midis.forEach((m, i) => playMidi(m, step * 1.6, i * step, 0.22));
}

/** Clique curto do metronomo, agendado no relogio do AudioContext. */
export type ClickLevel = 'accent' | 'beat' | 'sub';

export function scheduleClick(time: number, level: ClickLevel | boolean, volume = 1): void {
  const ac = audio();
  if (!ac) return;
  const kind: ClickLevel = level === true ? 'accent' : level === false ? 'beat' : level;
  const freq = kind === 'accent' ? 1320 : kind === 'beat' ? 880 : 660;
  const peak = (kind === 'sub' ? 0.45 : 1) * Math.max(0, Math.min(1, volume));
  if (peak <= 0) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(peak, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
  osc.connect(gain).connect(ac.destination);
  osc.start(time);
  osc.stop(time + 0.05);
}

/** Relogio do AudioContext (cria o contexto se preciso). */
export function audioNow(): number | null {
  const ac = audio();
  return ac ? ac.currentTime : null;
}
