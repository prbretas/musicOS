import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChordDiagram } from '@/components/ChordDiagram';
import type { Chord } from '@/types/music';

describe('ChordDiagram', () => {
  const mockChord: Chord = {
    name: 'C Major',
    root: 'C',
    notes: ['C', 'E', 'G'],
    positions: [-1, 3, 2, 0, 1, 0],
    fingering: [1, 2, 3, 0, 1, 0]
  };

  it('renders chord name and instrument', () => {
    render(<ChordDiagram chord={mockChord} instrument="guitar" />);
    expect(screen.getByText('C Major')).toBeTruthy();
    expect(screen.getByText('Guitarra')).toBeTruthy();
  });

  it('renders ukulele when instrument prop is ukulele', () => {
    render(<ChordDiagram chord={mockChord} instrument="ukulele" />);
    expect(screen.getByText('Ukulele')).toBeTruthy();
  });

  it('renders correct number of strings for guitar', () => {
    render(<ChordDiagram chord={mockChord} instrument="guitar" />);
    const strings = screen.getAllByText(/^[A-G]#?$/);
    expect(strings.length).toBe(6);
  });

  it('renders correct number of strings for ukulele', () => {
    const ukuleleChord = { ...mockChord, positions: [-1, 3, 2, 0] };
    render(<ChordDiagram chord={ukuleleChord} instrument="ukulele" />);
    const strings = screen.getAllByText(/^[A-G]#?$/);
    expect(strings.length).toBe(4);
  });

  it('renders chord notes', () => {
    render(<ChordDiagram chord={mockChord} />);
    expect(screen.getByText('C')).toBeTruthy();
    expect(screen.getByText('E')).toBeTruthy();
    expect(screen.getByText('G')).toBeTruthy();
  });

  it('highlights root note differently', () => {
    render(<ChordDiagram chord={mockChord} />);
    const rootNote = screen.getByText('C');
    expect(rootNote.parentElement?.className).toContain('bg-red-100');
  });

  it('calls onFretClick when circle is clicked', () => {
    const mockOnFretClick = vi.fn();
    render(<ChordDiagram chord={mockChord} onFretClick={mockOnFretClick} />);
    
    const circles = screen.getAllByRole('button');
    if (circles.length > 0) {
      fireEvent.click(circles[0]);
      expect(mockOnFretClick).toHaveBeenCalled();
    }
  });

  it('shows fingering labels when showFingering is true', () => {
    render(<ChordDiagram chord={mockChord} showFingering={true} />);
    const fingeringLabels = screen.getAllByText(/^[0-5]$/);
    expect(fingeringLabels.length).toBeGreaterThan(0);
  });

  it('hides fingering labels when showFingering is false', () => {
    render(<ChordDiagram chord={mockChord} showFingering={false} />);
    const fingeringLabels = screen.queryAllByText(/^[0-5]$/);
    expect(fingeringLabels.length).toBe(0);
  });

  it('renders with different sizes', () => {
    const { container: small } = render(<ChordDiagram chord={mockChord} size="sm" />);
    const { container: medium } = render(<ChordDiagram chord={mockChord} size="md" />);
    const { container: large } = render(<ChordDiagram chord={mockChord} size="lg" />);
    
    expect(small.firstChild).toBeTruthy();
    expect(medium.firstChild).toBeTruthy();
    expect(large.firstChild).toBeTruthy();
  });

  it('shows muted string indicator when position is -2', () => {
    const mutedChord = { ...mockChord, positions: [-2, 3, 2, 0, 1, 0] };
    render(<ChordDiagram chord={mutedChord} />);
    expect(screen.getByText('X')).toBeTruthy();
  });

  it('shows open string indicator when position is 0', () => {
    const openChord = { ...mockChord, positions: [0, 3, 2, 0, 1, 0] };
    render(<ChordDiagram chord={openChord} />);
    const openStringIndicators = screen.getAllByText('O');
    expect(openStringIndicators.length).toBeGreaterThan(0);
  });
});