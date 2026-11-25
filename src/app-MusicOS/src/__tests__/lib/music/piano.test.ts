// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { closeVoicing, rightHandFingering } from '@/lib/music/piano';

const name = (m: number) => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][m % 12] + (Math.floor(m / 12) - 1);

describe('acordes no piano', () => {
  it('C maior em posição fundamental a partir do Dó central', () => {
    expect(closeVoicing([0, 4, 7]).map(name)).toEqual(['C4', 'E4', 'G4']);
  });

  it('inversões sobem a nota de baixo uma oitava', () => {
    expect(closeVoicing([0, 4, 7], 1).map(name)).toEqual(['E4', 'G4', 'C5']);
    expect(closeVoicing([0, 4, 7], 2).map(name)).toEqual(['G4', 'C5', 'E5']);
  });

  it('tétrades e 9ª empilham em ordem crescente', () => {
    expect(closeVoicing([2, 5, 9, 0]).map(name)).toEqual(['D4', 'F4', 'A4', 'C5']); // Dm7
    expect(closeVoicing([7, 11, 2, 5, 9]).map(name)).toEqual(['G4', 'B4', 'D5', 'F5', 'A5']); // G7(9)
  });

  it('notas sempre crescentes e na região do teclado', () => {
    for (let root = 0; root < 12; root++) {
      for (let inv = 0; inv < 4; inv++) {
        const v = closeVoicing([root, root + 4, root + 7, root + 11].map((x) => x % 12), inv);
        v.slice(1).forEach((m, i) => expect(m).toBeGreaterThan(v[i]));
        expect(v[v.length - 1]).toBeLessThanOrEqual(84);
      }
    }
  });

  it('digitação da mão direita', () => {
    expect(rightHandFingering(3, 0)).toEqual([1, 3, 5]);
    expect(rightHandFingering(3, 1)).toEqual([1, 2, 5]);
    expect(rightHandFingering(4, 0)).toEqual([1, 2, 3, 5]);
    expect(rightHandFingering(5, 0)).toEqual([1, 2, 3, 4, 5]);
  });
});
