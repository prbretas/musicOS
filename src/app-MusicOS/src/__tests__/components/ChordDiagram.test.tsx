import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ChordDiagram } from '@/components/ChordDiagram';
import type { Chord } from '@/types/music';

const C_MAJOR = {
  name: 'C',
  root: 'C',
  type: 'major',
  notes: ['C', 'E', 'G'],
  positions: [-1, 3, 2, 0, 1, 0],
} as unknown as Chord;

const texts = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('text')).map((t) => t.textContent);
const stringLines = (c: HTMLElement) => c.querySelectorAll('line[stroke="#475569"]');
const fretGroups = (c: HTMLElement) => Array.from(c.querySelectorAll('g'));

describe('ChordDiagram', () => {
  it('mostra o nome do acorde', () => {
    const { container } = render(<ChordDiagram chord={C_MAJOR} />);
    expect(texts(container)).toContain('C');
    const title = container.querySelector('text[font-size="16"]');
    expect(title?.textContent).toBe('C');
  });

  it('mostra o rótulo Guitarra por padrão e Ukulele quando pedido', () => {
    const { container, rerender } = render(<ChordDiagram chord={C_MAJOR} />);
    expect(texts(container)).toContain('Guitarra');
    rerender(<ChordDiagram chord={{ ...C_MAJOR, positions: [0, 0, 0, 3] }} instrument="ukulele" />);
    expect(texts(container)).toContain('Ukulele');
    expect(texts(container)).not.toContain('Guitarra');
  });

  it('desenha 6 cordas na guitarra', () => {
    const { container } = render(<ChordDiagram chord={C_MAJOR} />);
    expect(stringLines(container)).toHaveLength(6);
  });

  it('desenha 4 cordas no ukulele', () => {
    const { container } = render(
      <ChordDiagram chord={{ ...C_MAJOR, positions: [0, 0, 0, 3] }} instrument="ukulele" />
    );
    expect(stringLines(container)).toHaveLength(4);
  });

  it('corda muda (-1) desenha ×', () => {
    const { container } = render(<ChordDiagram chord={C_MAJOR} />);
    expect(texts(container).filter((t) => t === '×')).toHaveLength(1);
  });

  it('corda solta (0) desenha círculo vazio', () => {
    const { container } = render(<ChordDiagram chord={C_MAJOR} />);
    // C maior: cordas 4 e 6 (índices 3 e 5) soltas
    expect(container.querySelectorAll('circle[fill="none"]')).toHaveLength(2);
  });

  it('cada casa pressionada mostra o nome da nota (C, E, C nas cordas A, D, B)', () => {
    const { container } = render(<ChordDiagram chord={C_MAJOR} />);
    const groups = fretGroups(container);
    expect(groups).toHaveLength(3);
    expect(groups.map((g) => g.querySelector('text')?.textContent)).toEqual(['C', 'E', 'C']);
  });

  it('não mostra o número da casa dentro das bolinhas', () => {
    const { container } = render(<ChordDiagram chord={C_MAJOR} />);
    const labels = fretGroups(container).map((g) => g.querySelector('text')?.textContent);
    expect(labels.some((l) => /^\d+$/.test(l ?? ''))).toBe(false);
  });

  it('nota raiz é vermelha e as demais notas do acorde são roxas', () => {
    const { container } = render(<ChordDiagram chord={C_MAJOR} />);
    const fills = fretGroups(container).map((g) => g.querySelector('circle')?.getAttribute('fill'));
    expect(fills).toEqual(['#ef4444', '#7c3aed', '#ef4444']);
  });

  it('nota fora do acorde fica cinza', () => {
    const chord = { ...C_MAJOR, positions: [-1, 4, -1, -1, -1, -1] } as Chord; // A + 4 = C#
    const { container } = render(<ChordDiagram chord={chord} />);
    expect(fretGroups(container)[0].querySelector('circle')?.getAttribute('fill')).toBe('#475569');
  });

  it('onFretClick recebe (corda, casa) ao clicar', () => {
    const onFretClick = vi.fn();
    const { container } = render(<ChordDiagram chord={C_MAJOR} onFretClick={onFretClick} />);
    const groups = fretGroups(container);
    fireEvent.click(groups[0]);
    expect(onFretClick).toHaveBeenLastCalledWith(1, 3);
    fireEvent.click(groups[1]);
    expect(onFretClick).toHaveBeenLastCalledWith(2, 2);
    fireEvent.click(groups[2]);
    expect(onFretClick).toHaveBeenLastCalledWith(4, 1);
    expect(onFretClick).toHaveBeenCalledTimes(3);
  });

  it('mostra o dedilhado quando showFingering é true', () => {
    const chord = { ...C_MAJOR, fingering: [0, 3, 2, 0, 1, 0] } as Chord;
    const { container, rerender } = render(<ChordDiagram chord={chord} />);
    expect(texts(container)).toEqual(expect.arrayContaining(['3', '2', '1']));
    rerender(<ChordDiagram chord={chord} showFingering={false} />);
    expect(texts(container)).not.toContain('3');
  });
});
