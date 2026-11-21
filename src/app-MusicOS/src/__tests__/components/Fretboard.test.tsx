import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Fretboard } from '@/components/Fretboard';
import type { NoteName } from '@/types/music';

const SCALE_C = {
  root: 'C' as NoteName,
  type: 'maior',
  notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteName[],
};

/** Grupos de nota (têm circle + text; exclui marcadores de casa) em ordem corda grave → aguda, casa a casa. */
const noteGroups = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('g')).filter((g) => g.querySelector('text') && g.querySelector('circle'));
const labelOf = (g: Element) => g.querySelector('text')!.textContent;
const fillOf = (g: Element) => g.querySelector('circle')!.getAttribute('fill');
const opacityOf = (g: Element) => g.getAttribute('opacity');
/** Grupo da nota na corda s (0 = grave) e casa f, para startFret=0 / endFret=12. */
const groupAt = (c: HTMLElement, s: number, f: number) => noteGroups(c)[s * 13 + f];
const fretNumberTexts = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('text[font-size="11"]')).filter((t) => /^\d+$/.test(t.textContent ?? ''));
const stringLabels = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('text[font-weight="bold"][x="10"]')).map((t) => t.textContent);

describe('Fretboard', () => {
  describe('cordas', () => {
    it('guitarra tem 6 cordas (E A D G B E)', () => {
      const { container } = render(<Fretboard instrument="guitar" />);
      expect(stringLabels(container)).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
    });

    it('ukulele tem 4 cordas (G C E A)', () => {
      const { container } = render(<Fretboard instrument="ukulele" />);
      expect(stringLabels(container)).toEqual(['G', 'C', 'E', 'A']);
    });

    it('a corda aguda fica na linha de cima e a grave embaixo', () => {
      const { container } = render(<Fretboard instrument="guitar" />);
      const yHigh = Number(groupAt(container, 5, 3).querySelector('circle')!.getAttribute('cy'));
      const yLow = Number(groupAt(container, 0, 3).querySelector('circle')!.getAttribute('cy'));
      expect(yHigh).toBeLessThan(yLow);
    });
  });

  describe('sem escala', () => {
    it('mostra todas as notas (6 cordas × 13 casas)', () => {
      const { container } = render(<Fretboard instrument="guitar" />);
      expect(noteGroups(container)).toHaveLength(6 * 13);
    });

    it('mostra todas as 12 notas cromáticas', () => {
      const { container } = render(<Fretboard instrument="guitar" />);
      const labels = new Set(noteGroups(container).map(labelOf));
      expect(labels.size).toBe(12);
      expect(labels.has('C#')).toBe(true);
    });

    it('todas as notas ficam com opacidade total', () => {
      const { container } = render(<Fretboard instrument="guitar" />);
      expect(noteGroups(container).every((g) => opacityOf(g) === '1')).toBe(true);
    });

    it('highlightedNotes pinta as notas de roxo', () => {
      const { container } = render(<Fretboard instrument="guitar" highlightedNotes={['A']} />);
      const groups = noteGroups(container);
      const as = groups.filter((g) => labelOf(g) === 'A');
      expect(as.length).toBeGreaterThan(0);
      expect(as.every((g) => fillOf(g) === '#7c3aed')).toBe(true);
      expect(groups.filter((g) => labelOf(g) !== 'A').every((g) => fillOf(g) === '#1e293b')).toBe(true);
    });

    it('ukulele mostra 4 × 13 notas', () => {
      const { container } = render(<Fretboard instrument="ukulele" />);
      expect(noteGroups(container)).toHaveLength(4 * 13);
    });
  });

  describe('com escala', () => {
    it('notas da escala ficam coloridas e as de fora esmaecidas', () => {
      const { container } = render(<Fretboard instrument="guitar" scale={SCALE_C} />);
      const groups = noteGroups(container);
      for (const g of groups) {
        const inScale = SCALE_C.notes.includes(labelOf(g) as NoteName);
        if (inScale) {
          expect(opacityOf(g)).toBe('1');
          expect(fillOf(g)).not.toBe('#1e293b');
        } else {
          expect(opacityOf(g)).toBe('0.18');
          expect(fillOf(g)).toBe('#1e293b');
        }
      }
    });

    it('a tônica C usa #ef4444', () => {
      const { container } = render(<Fretboard instrument="guitar" scale={SCALE_C} />);
      const cs = noteGroups(container).filter((g) => labelOf(g) === 'C');
      expect(cs.length).toBeGreaterThan(0);
      expect(cs.every((g) => fillOf(g) === '#ef4444')).toBe(true);
    });

    it('demais graus não usam a cor da tônica', () => {
      const { container } = render(<Fretboard instrument="guitar" scale={SCALE_C} />);
      const d = noteGroups(container).find((g) => labelOf(g) === 'D')!;
      expect(fillOf(d)).toBe('#f97316');
    });

    it('showIntervals troca o nome da nota pelo intervalo', () => {
      const { container } = render(<Fretboard instrument="guitar" scale={SCALE_C} showIntervals />);
      const labels = new Set(noteGroups(container).filter((g) => opacityOf(g) === '1').map(labelOf));
      expect(labels.has('R')).toBe(true);
      expect(labels.has('5')).toBe(true);
      expect(labels.has('C')).toBe(false);
    });
  });

  describe('fretWindows', () => {
    it('restringe as notas ativas à janela', () => {
      const { container } = render(
        <Fretboard instrument="guitar" scale={SCALE_C} fretWindows={[[0, 4]]} />
      );
      noteGroups(container).forEach((g, idx) => {
        const fret = idx % 13;
        const inScale = SCALE_C.notes.includes(labelOf(g) as NoteName);
        if (inScale && fret <= 4) {
          expect(opacityOf(g)).toBe('1');
        } else if (inScale) {
          expect(opacityOf(g)).toBe('0.35');
        } else {
          expect(opacityOf(g)).toBe('0.18');
        }
      });
    });

    it('aceita várias janelas', () => {
      const { container } = render(
        <Fretboard instrument="guitar" scale={SCALE_C} fretWindows={[[1, 2], [10, 12]]} />
      );
      const activeFrets = new Set<number>();
      noteGroups(container).forEach((g, idx) => {
        if (opacityOf(g) === '1') activeFrets.add(idx % 13);
      });
      expect([...activeFrets].every((f) => (f >= 1 && f <= 2) || (f >= 10 && f <= 12))).toBe(true);
      expect(activeFrets.size).toBeGreaterThan(0);
    });
  });

  describe('focusNotes e chordNotes', () => {
    it('focusNotes mantém em destaque só o subconjunto', () => {
      const { container } = render(
        <Fretboard instrument="guitar" scale={SCALE_C} focusNotes={['C', 'E', 'G']} />
      );
      const groups = noteGroups(container);
      const gs = groups.filter((g) => labelOf(g) === 'G');
      const ds = groups.filter((g) => labelOf(g) === 'D');
      expect(gs.every((g) => opacityOf(g) === '1')).toBe(true);
      expect(ds.every((g) => opacityOf(g) === '0.35')).toBe(true);
    });

    it('chordNotes põe anel branco nas notas do acorde e enfraquece as outras', () => {
      const { container } = render(
        <Fretboard instrument="guitar" scale={SCALE_C} chordNotes={['C', 'E', 'G']} />
      );
      const groups = noteGroups(container);
      const g = groups.find((x) => labelOf(x) === 'G')!;
      expect(g.querySelector('circle')!.getAttribute('stroke')).toBe('#ffffff');
      expect(g.querySelector('circle')!.getAttribute('stroke-width')).toBe('3');
      expect(g.querySelector('circle')!.getAttribute('r')).toBe('15');
      const d = groups.find((x) => labelOf(x) === 'D')!;
      expect(opacityOf(d)).toBe('0.45');
      expect(d.querySelector('circle')!.getAttribute('r')).toBe('11');
    });

    it('sem chordNotes não há anel branco', () => {
      const { container } = render(<Fretboard instrument="guitar" scale={SCALE_C} />);
      const g = noteGroups(container).find((x) => labelOf(x) === 'G')!;
      expect(g.querySelector('circle')!.getAttribute('stroke')).not.toBe('#ffffff');
    });
  });

  describe('onNoteClick', () => {
    it('recebe (nota, casa, corda)', () => {
      const onNoteClick = vi.fn();
      const { container } = render(<Fretboard instrument="guitar" onNoteClick={onNoteClick} />);
      fireEvent.click(groupAt(container, 5, 3)); // E aguda, casa 3 = G
      expect(onNoteClick).toHaveBeenCalledWith('G', 3, 5);
      fireEvent.click(groupAt(container, 0, 0)); // E grave solta
      expect(onNoteClick).toHaveBeenLastCalledWith('E', 0, 0);
      expect(onNoteClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('alinhamento das casas (regressão)', () => {
    it('com startFret=0, G da corda aguda fica no centro da casa 3', () => {
      const { container } = render(<Fretboard instrument="guitar" startFret={0} endFret={12} />);
      const g = groupAt(container, 5, 3);
      expect(labelOf(g)).toBe('G');
      const cx = Number(g.querySelector('circle')!.getAttribute('cx'));
      const num = fretNumberTexts(container).find((t) => t.textContent === '3')!;
      expect(cx).toBe(Number(num.getAttribute('x')));
    });

    it('com startFret=0, F da corda aguda fica no centro da casa 1', () => {
      const { container } = render(<Fretboard instrument="guitar" startFret={0} endFret={12} />);
      const g = groupAt(container, 5, 1);
      expect(labelOf(g)).toBe('F');
      const cx = Number(g.querySelector('circle')!.getAttribute('cx'));
      const num = fretNumberTexts(container).find((t) => t.textContent === '1')!;
      expect(cx).toBe(Number(num.getAttribute('x')));
    });

    it('não há casa vazia entre a pestana e a casa 1', () => {
      const { container } = render(<Fretboard instrument="guitar" startFret={0} endFret={12} />);
      const nut = container.querySelector('rect')!;
      const nutX = Number(nut.getAttribute('x')) + Number(nut.getAttribute('width'));
      const cx1 = Number(groupAt(container, 5, 1).querySelector('circle')!.getAttribute('cx'));
      const cx2 = Number(groupAt(container, 5, 2).querySelector('circle')!.getAttribute('cx'));
      const fretW = cx2 - cx1;
      // o centro da casa 1 fica a meia casa da pestana (tolerância da largura da pestana)
      expect(cx1 - nutX).toBeLessThan(fretW);
    });

    it('a corda solta fica antes da pestana', () => {
      const { container } = render(<Fretboard instrument="guitar" startFret={0} endFret={12} />);
      const nut = container.querySelector('rect')!;
      const openCx = Number(groupAt(container, 5, 0).querySelector('circle')!.getAttribute('cx'));
      expect(openCx).toBeLessThan(Number(nut.getAttribute('x')));
    });

    it('com startFret > 0 também alinha número e nota', () => {
      const { container } = render(<Fretboard instrument="guitar" startFret={5} endFret={9} />);
      const g = noteGroups(container)[5 * 5 + 2]; // corda aguda, casa 7 = B
      expect(labelOf(g)).toBe('B');
      const cx = Number(g.querySelector('circle')!.getAttribute('cx'));
      const num = fretNumberTexts(container).find((t) => t.textContent === '7')!;
      expect(cx).toBe(Number(num.getAttribute('x')));
    });
  });
});
