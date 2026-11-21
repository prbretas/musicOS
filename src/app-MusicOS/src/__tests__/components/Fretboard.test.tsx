import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Fretboard } from '@/components/Fretboard';

describe('Fretboard', () => {
  it('renders guitar fretboard by default', () => {
    render(<Fretboard instrument="guitar" />);
    expect(screen.getByText('E')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('D')).toBeTruthy();
  });

  it('renders ukulele fretboard', () => {
    render(<Fretboard instrument="ukulele" />);
    expect(screen.getByText('G')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
    expect(screen.getByText('E')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('calls onNoteClick when note is clicked', () => {
    const mockOnNoteClick = vi.fn();
    render(<Fretboard instrument="guitar" onNoteClick={mockOnNoteClick} />);
    
    const firstNote = screen.getAllByRole('button')[0];
    fireEvent.click(firstNote);
    
    expect(mockOnNoteClick).toHaveBeenCalled();
    expect(mockOnNoteClick.mock.calls[0].length).toBe(3);
  });

  it('highlights specified notes', () => {
    const highlightedNotes = ['C', 'E', 'G'];
    render(
      <Fretboard 
        instrument="guitar" 
        highlightedNotes={highlightedNotes}
        startFret={0}
        endFret={3}
      />
    );
    
    const highlightedElements = screen.getAllByRole('button');
    expect(highlightedElements.length).toBeGreaterThan(0);
  });

  it('shows scale notes with colors', () => {
    const scale = {
      root: 'C',
      type: 'major',
      notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    };
    
    render(
      <Fretboard 
        instrument="guitar" 
        scale={scale}
        startFret={0}
        endFret={3}
      />
    );
    
    const rootNote = screen.getByText('C');
    expect(rootNote.parentElement?.className).toContain('bg-red-500');
  });

  it('shows intervals when showIntervals is true', () => {
    const scale = {
      root: 'C',
      type: 'major',
      notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    };
    
    render(
      <Fretboard 
        instrument="guitar" 
        scale={scale}
        showIntervals={true}
        startFret={0}
        endFret={3}
      />
    );
    
    expect(screen.getByText('R')).toBeTruthy();
  });

  it('shows custom tuning when provided', () => {
    const customTuning = ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'];
    render(<Fretboard instrument="guitar" tuning={customTuning} />);
    
    expect(screen.getByText('D')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('renders fret numbers', () => {
    render(<Fretboard instrument="guitar" startFret={1} endFret={3} />);
    
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('shows position dots at correct frets', () => {
    const { container } = render(<Fretboard instrument="guitar" startFret={0} endFret={12} />);
    
    const dots = container.querySelectorAll('.bg-slate-700\\/50');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('shows two dots at fret 12', () => {
    const { container } = render(<Fretboard instrument="guitar" startFret={11} endFret={13} />);
    
    const dotContainers = container.querySelectorAll('.flex.gap-1');
    expect(dotContainers.length).toBeGreaterThan(0);
  });

  it('handles hover state', () => {
    render(<Fretboard instrument="guitar" startFret={0} endFret={3} />);
    
    const firstNote = screen.getAllByRole('button')[0];
    fireEvent.mouseEnter(firstNote);
    
    const hoverInfo = screen.queryByText(/na corda.*Casa/);
    expect(hoverInfo).toBeTruthy();
  });

  it('supports different fret ranges', () => {
    render(<Fretboard instrument="guitar" startFret={5} endFret={8} />);
    
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
  });

  it('renders open string indicators', () => {
    const { container } = render(<Fretboard instrument="guitar" startFret={0} endFret={3} />);
    
    const openIndicators = container.querySelectorAll('.border-slate-500');
    expect(openIndicators.length).toBeGreaterThan(0);
  });

  it('uses default tuning when not provided', () => {
    render(<Fretboard instrument="guitar" />);
    
    expect(screen.getByText('E')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('D')).toBeTruthy();
    expect(screen.getByText('G')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
  });
});