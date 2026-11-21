import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScaleDisplay } from '@/components/ScaleDisplay';
import type { NoteName, ScaleType } from '@/lib/music/theory';

describe('ScaleDisplay', () => {
  const defaultProps = {
    root: 'C' as NoteName,
    scaleType: 'major' as ScaleType,
    showDegrees: true,
    showHarmonicField: false,
  };

  it('renders with default props', () => {
    render(<ScaleDisplay {...defaultProps} />);
    
    expect(screen.getByText('C Major')).toBeTruthy();
    expect(screen.getByText('Scale Notes')).toBeTruthy();
    expect(screen.getByText('Root Note')).toBeTruthy();
    expect(screen.getByText('Scale Type')).toBeTruthy();
  });

  it('displays the correct number of scale notes for major scale', () => {
    render(<ScaleDisplay {...defaultProps} />);
    
    const majorScaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    majorScaleNotes.forEach(note => {
      expect(screen.getByText(note.replace('#', '♯'))).toBeTruthy();
    });
  });

  it('displays the correct number of scale notes for minor scale', () => {
    render(<ScaleDisplay {...defaultProps} scaleType="minor" />);
    
    const minorScaleNotes = ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'];
    minorScaleNotes.forEach(note => {
      expect(screen.getByText(note.replace('#', '♯'))).toBeTruthy();
    });
  });

  it('displays scale degrees when showDegrees is true', () => {
    render(<ScaleDisplay {...defaultProps} showDegrees={true} />);
    
    expect(screen.getByText('Root')).toBeTruthy();
    expect(screen.getByText('Major 2nd')).toBeTruthy();
    expect(screen.getByText('Major 3rd')).toBeTruthy();
  });

  it('does not display scale degrees when showDegrees is false', () => {
    render(<ScaleDisplay {...defaultProps} showDegrees={false} />);
    
    const degreeElements = screen.queryAllByText('Root');
    expect(degreeElements.length).toBe(0);
  });

  it('displays harmonic field when showHarmonicField is true', () => {
    render(<ScaleDisplay {...defaultProps} showHarmonicField={true} />);
    
    expect(screen.getByText('Harmonic Field')).toBeTruthy();
    expect(screen.getByText('1st')).toBeTruthy();
    expect(screen.getByText('C major')).toBeTruthy();
  });

  it('does not display harmonic field when showHarmonicField is false', () => {
    render(<ScaleDisplay {...defaultProps} showHarmonicField={false} />);
    
    expect(screen.queryByText('Harmonic Field')).toBeNull();
  });

  it('renders all 12 root note buttons', () => {
    render(<ScaleDisplay {...defaultProps} />);
    
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    allNotes.forEach(note => {
      expect(screen.getByText(note.replace('#', '♯'))).toBeTruthy();
    });
  });

  it('allows changing root note by clicking buttons', () => {
    const onRootChange = vi.fn();
    render(<ScaleDisplay {...defaultProps} onRootChange={onRootChange} />);
    
    const dNoteButton = screen.getByText('D');
    fireEvent.click(dNoteButton);
    
    expect(onRootChange).toHaveBeenCalledWith('D');
  });

  it('allows changing scale type via dropdown', () => {
    const onScaleTypeChange = vi.fn();
    render(<ScaleDisplay {...defaultProps} onScaleTypeChange={onScaleTypeChange} />);
    
    const selectElement = screen.getByDisplayValue('Major');
    fireEvent.change(selectElement, { target: { value: 'minor' } });
    
    expect(onScaleTypeChange).toHaveBeenCalledWith('minor');
  });

  it('highlights the selected root note differently', () => {
    render(<ScaleDisplay {...defaultProps} />);
    
    const selectedRootButton = screen.getByText('C');
    const notSelectedRootButton = screen.getByText('D');
    
    expect(selectedRootButton.className).toContain('bg-blue-600');
    expect(notSelectedRootButton.className).toContain('bg-slate-100');
  });

  it('shows correct scale statistics', () => {
    render(<ScaleDisplay {...defaultProps} />);
    
    expect(screen.getByText('7')).toBeTruthy(); // Number of notes
    expect(screen.getByText('Major')).toBeTruthy(); // Scale type
    expect(screen.getByText('C♯')).toBeTruthy(); // Root note (formatted)
    expect(screen.getByText('Diatonic')).toBeTruthy(); // Mode
  });

  it('formats scale name correctly for different scale types', () => {
    const { rerender } = render(<ScaleDisplay {...defaultProps} scaleType="minor" />);
    expect(screen.getByText('C Minor')).toBeTruthy();
    
    rerender(<ScaleDisplay {...defaultProps} scaleType="harmonic-minor" />);
    expect(screen.getByText('C Harmonic Minor')).toBeTruthy();
    
    rerender(<ScaleDisplay {...defaultProps} scaleType="major-pentatonic" />);
    expect(screen.getByText('C Major Pentatonic')).toBeTruthy();
  });

  it('renders correct note colors based on degree', () => {
    render(<ScaleDisplay {...defaultProps} />);
    
    const noteElements = screen.getAllByText(/^[A-G]♯?$/);
    const firstNoteElement = noteElements[0];
    
    // Root note should have red background
    expect(firstNoteElement.parentElement?.className).toContain('bg-red-500');
  });

  it('displays pentatonic scales with correct number of notes', () => {
    render(<ScaleDisplay {...defaultProps} scaleType="major-pentatonic" />);
    
    const majorPentatonicNotes = ['C', 'D', 'E', 'G', 'A'];
    const noteElements = screen.getAllByText(/^[A-G]♯?$/);
    
    // Should have 5 notes (pentatonic) instead of 7
    expect(noteElements.length).toBe(5);
    majorPentatonicNotes.forEach(note => {
      expect(screen.getByText(note.replace('#', '♯'))).toBeTruthy();
    });
  });

  it('handles sharp notes correctly in display', () => {
    render(<ScaleDisplay {...defaultProps} root="F#" />);
    
    // Should display F♯ instead of F#
    expect(screen.getByText('F♯ Major')).toBeTruthy();
    expect(screen.getByText('F♯')).toBeTruthy();
  });

  it('shows different scale degrees for different scale types', () => {
    const { rerender } = render(<ScaleDisplay {...defaultProps} scaleType="minor" />);
    expect(screen.getByText('Minor 3rd')).toBeTruthy();
    
    rerender(<ScaleDisplay {...defaultProps} scaleType="major" />);
    expect(screen.getByText('Major 3rd')).toBeTruthy();
  });
});

describe('ScaleDisplay interaction tests', () => {
  it('updates scale notes when root changes', async () => {
    const { rerender } = render(<ScaleDisplay root="C" scaleType="major" />);
    
    expect(screen.getByText('C')).toBeTruthy();
    expect(screen.getByText('D')).toBeTruthy();
    
    rerender(<ScaleDisplay root="G" scaleType="major" />);
    
    expect(screen.getByText('G')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.queryByText('C')).toBeNull(); // C is not in G major scale
  });

  it('updates harmonic field when scale type changes', () => {
    const { rerender } = render(
      <ScaleDisplay root="C" scaleType="major" showHarmonicField={true} />
    );
    
    expect(screen.getByText('C major')).toBeTruthy();
    
    rerender(
      <ScaleDisplay root="C" scaleType="minor" showHarmonicField={true} />
    );
    
    expect(screen.getByText('C minor')).toBeTruthy();
  });

  it('handles all available scale types in dropdown', () => {
    render(<ScaleDisplay root="C" scaleType="major" />);
    
    const selectElement = screen.getByDisplayValue('Major');
    const options = Array.from(selectElement.querySelectorAll('option'));
    const optionValues = options.map(option => option.value);
    
    const expectedScaleTypes = [
      'major', 'minor', 'harmonic-minor', 'melodic-minor',
      'major-pentatonic', 'minor-pentatonic', 'blues',
      'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'
    ];
    
    expectedScaleTypes.forEach(scaleType => {
      expect(optionValues).toContain(scaleType);
    });
  });
});