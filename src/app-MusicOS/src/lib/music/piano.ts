/**
 * Acordes no teclado: posição fechada, inversões e digitação da mão direita.
 */

export const BLACK_PCS = new Set([1, 3, 6, 8, 10]);

export function isBlack(midi: number): boolean {
  return BLACK_PCS.has(((midi % 12) + 12) % 12);
}

/**
 * Notas da mão direita em posição fechada.
 * inversion 0 = fundamental no grave; 1 = 1ª inversão (3ª no grave)...
 * As extensões (9ª) ficam acima das notas do acorde.
 */
export function closeVoicing(pcs: number[], inversion = 0, baseMidi = 60): number[] {
  const rootPc = ((pcs[0] % 12) + 12) % 12;
  // fundamental na oitava a partir de baseMidi (C4)
  const root = baseMidi + rootPc;
  const stacked: number[] = [root];
  for (const p of pcs.slice(1)) {
    let m = root + ((p - rootPc + 12) % 12);
    while (m <= stacked[stacked.length - 1]) m += 12;
    stacked.push(m);
  }
  const inv = ((inversion % pcs.length) + pcs.length) % pcs.length;
  const voiced = [...stacked];
  for (let i = 0; i < inv; i++) {
    const low = voiced.shift()!;
    let up = low + 12;
    while (up <= voiced[voiced.length - 1]) up += 12;
    voiced.push(up);
  }
  // mantém o acorde numa região confortável (até ~C6)
  while (voiced[voiced.length - 1] > 84 && voiced[0] - 12 >= 48) {
    for (let i = 0; i < voiced.length; i++) voiced[i] -= 12;
  }
  return voiced;
}

/** Digitação da mão direita (1 = polegar … 5 = mínimo). */
export function rightHandFingering(noteCount: number, inversion = 0): number[] {
  if (noteCount === 3) {
    // fundamental 1-3-5; 1ª inversão 1-2-5; 2ª inversão 1-3-5
    return inversion % 3 === 1 ? [1, 2, 5] : [1, 3, 5];
  }
  if (noteCount === 4) return [1, 2, 3, 5];
  if (noteCount === 5) return [1, 2, 3, 4, 5];
  return Array.from({ length: noteCount }, (_, i) => Math.min(5, i + 1));
}

export const INVERSION_LABEL = ['Fundamental', '1ª inversão', '2ª inversão', '3ª inversão', '4ª inversão'];
