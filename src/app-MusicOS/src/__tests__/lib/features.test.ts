import { describe, expect, it } from 'vitest';
import { FEATURES, FREE_SCALE_KEYS, canUse, isProFeature, isScaleFree } from '@/lib/features';
import { SCALES } from '@/lib/music/escalas';

describe('features: catálogo free/pro', () => {
  it('todo recurso tem um tier válido', () => {
    for (const f of Object.values(FEATURES)) {
      expect(['free', 'pro']).toContain(f.tier);
      expect(f.label.length).toBeGreaterThan(0);
    }
  });

  it('usuário grátis só usa recursos free', () => {
    expect(canUse('free', 'metronome')).toBe(true);
    expect(canUse('free', 'scales-basic')).toBe(true);
    expect(canUse('free', 'tuner')).toBe(false);
    expect(canUse('free', 'exercises')).toBe(false);
    expect(canUse('free', 'caged')).toBe(false);
  });

  it('pro e vitalício usam tudo', () => {
    for (const id of Object.keys(FEATURES) as (keyof typeof FEATURES)[]) {
      expect(canUse('pro', id)).toBe(true);
      expect(canUse('lifetime', id)).toBe(true);
    }
  });

  it('isProFeature reflete o tier', () => {
    expect(isProFeature('tuner')).toBe(true);
    expect(isProFeature('metronome')).toBe(false);
  });
});

describe('features: escalas grátis', () => {
  it('as escalas grátis existem no catálogo de escalas', () => {
    const keys = new Set(SCALES.map((s) => s.key));
    for (const k of FREE_SCALE_KEYS) expect(keys.has(k)).toBe(true);
  });

  it('maior e menor natural são grátis; modos e exóticas são Pro', () => {
    expect(isScaleFree('maior')).toBe(true);
    expect(isScaleFree('menor_natural')).toBe(true);
    expect(isScaleFree('pentatonica_menor')).toBe(true);
    expect(isScaleFree('dorico')).toBe(false);
    expect(isScaleFree('menor_harmonica')).toBe(false);
    expect(isScaleFree('hirajoshi')).toBe(false);
  });
});
