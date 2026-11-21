import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ScaleDisplay } from '@/components/ScaleDisplay';
import type { NoteName, ScaleType } from '@/lib/music/theory';

const flat = (note: string) => note.replace('#', '♯');

// Seções do componente (escopo das consultas, pois notas e rótulos se repetem na tela)
const rootSelector = () => screen.getByText('Root Note').parentElement as HTMLElement;
const notesSection = () => screen.getByText('Scale Notes').parentElement as HTMLElement;
const harmonicSection = () => screen.getByText('Harmonic Field').parentElement as HTMLElement;
const statCell = (label: string) =>
  screen.getByText(label, { selector: 'div' }).parentElement as HTMLElement;

// Nomes das notas exibidas na lista "Scale Notes", na ordem
const displayedNotes = () =>
  Array.from(notesSection().querySelectorAll('span.text-xl')).map((el) => el.textContent);

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

  it('displays the correct notes for major scale', () => {
    render(<ScaleDisplay {...defaultProps} />);

    expect(displayedNotes()).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('displays the correct notes for minor scale', () => {
    render(<ScaleDisplay {...defaultProps} scaleType="minor" />);

    expect(displayedNotes()).toEqual(['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'].map(flat));
  });

  it('displays scale degrees when showDegrees is true', () => {
    render(<ScaleDisplay {...defaultProps} showDegrees={true} />);

    const notes = within(notesSection());
    expect(notes.getByText('Root')).toBeTruthy();
    expect(notes.getByText('Major 2nd')).toBeTruthy();
    expect(notes.getByText('Major 3rd')).toBeTruthy();
  });

  it('does not display scale degrees when showDegrees is false', () => {
    render(<ScaleDisplay {...defaultProps} showDegrees={false} />);

    // O rótulo "Root" do painel de estatísticas continua; só os graus somem da lista de notas.
    const notes = within(notesSection());
    expect(notes.queryAllByText('Root').length).toBe(0);
    expect(notes.queryAllByText(/2nd|3rd|4th|5th|6th|7th/).length).toBe(0);
    expect(statCell('Root')).toBeTruthy();
  });

  it('displays harmonic field when showHarmonicField is true', () => {
    render(<ScaleDisplay {...defaultProps} showHarmonicField={true} />);

    const field = within(harmonicSection());
    expect(screen.getByText('Harmonic Field')).toBeTruthy();
    expect(field.getByText('1st')).toBeTruthy();
    expect(field.getByText('C major')).toBeTruthy();
    expect(field.getByText('D minor')).toBeTruthy();
    expect(field.getByText('B diminished')).toBeTruthy();
  });

  it('does not display harmonic field when showHarmonicField is false', () => {
    render(<ScaleDisplay {...defaultProps} showHarmonicField={false} />);

    expect(screen.queryByText('Harmonic Field')).toBeNull();
  });

  it('renders all 12 root note buttons', () => {
    render(<ScaleDisplay {...defaultProps} />);

    const buttons = within(rootSelector()).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(
      ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(flat)
    );
  });

  it('allows changing root note by clicking buttons', () => {
    const onRootChange = vi.fn();
    render(<ScaleDisplay {...defaultProps} onRootChange={onRootChange} />);

    fireEvent.click(within(rootSelector()).getByRole('button', { name: 'D' }));

    expect(onRootChange).toHaveBeenCalledWith('D');
    expect(screen.getByText('D Major')).toBeTruthy();
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

    const buttons = within(rootSelector());
    expect(buttons.getByRole('button', { name: 'C' }).className).toContain('bg-blue-600');
    expect(buttons.getByRole('button', { name: 'D' }).className).toContain('bg-slate-100');
  });

  it('shows correct scale statistics', () => {
    render(<ScaleDisplay {...defaultProps} />);

    expect(within(statCell('Notes')).getByText('7')).toBeTruthy();
    expect(within(statCell('Type')).getByText('Major')).toBeTruthy();
    expect(within(statCell('Root')).getByText('C')).toBeTruthy();
    expect(within(statCell('Mode')).getByText('Diatonic')).toBeTruthy();
  });

  it('updates the Type and Mode statistics when the scale type is changed via dropdown', () => {
    render(<ScaleDisplay {...defaultProps} />);

    fireEvent.change(screen.getByDisplayValue('Major'), { target: { value: 'minor-pentatonic' } });

    expect(screen.getByText('C Minor Pentatonic')).toBeTruthy();
    expect(within(statCell('Type')).getByText('Minor Pentatonic')).toBeTruthy();
    expect(within(statCell('Mode')).getByText('Pentatonic')).toBeTruthy();
    expect(within(statCell('Notes')).getByText('5')).toBeTruthy();
  });

  it('formats scale name correctly for different scale types', () => {
    const { unmount } = render(<ScaleDisplay {...defaultProps} scaleType="minor" />);
    expect(screen.getByText('C Minor')).toBeTruthy();
    unmount();

    const second = render(<ScaleDisplay {...defaultProps} scaleType="harmonic-minor" />);
    expect(screen.getByText('C Harmonic Minor')).toBeTruthy();
    second.unmount();

    render(<ScaleDisplay {...defaultProps} scaleType="major-pentatonic" />);
    expect(screen.getByText('C Major Pentatonic')).toBeTruthy();
  });

  it('renders correct note colors based on degree', () => {
    render(<ScaleDisplay {...defaultProps} />);

    const noteElements = Array.from(notesSection().querySelectorAll('span.text-xl'));
    const circleClass = (i: number) => noteElements[i].parentElement?.className ?? '';

    // Tônica vermelha, terça e quinta amarelas, demais azuis
    expect(circleClass(0)).toContain('bg-red-500');
    expect(circleClass(2)).toContain('bg-yellow-500');
    expect(circleClass(4)).toContain('bg-yellow-500');
    expect(circleClass(1)).toContain('bg-blue-500');
    expect(circleClass(6)).toContain('bg-blue-500');
  });

  it('displays pentatonic scales with correct number of notes', () => {
    render(<ScaleDisplay {...defaultProps} scaleType="major-pentatonic" />);

    // 5 notas (pentatônica) em vez de 7
    expect(displayedNotes()).toEqual(['C', 'D', 'E', 'G', 'A']);
  });

  it('handles sharp notes correctly in display', () => {
    render(<ScaleDisplay {...defaultProps} root="F#" />);

    // Exibe F♯ em vez de F#; F♯ maior = F♯ G♯ A♯ B C♯ D♯ F (E♯ soa como F)
    expect(screen.getByText('F♯ Major')).toBeTruthy();
    expect(within(statCell('Root')).getByText('F♯')).toBeTruthy();
    expect(displayedNotes()).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F'].map(flat));
  });

  it('shows different scale degrees for different scale types', () => {
    const { unmount } = render(<ScaleDisplay {...defaultProps} scaleType="minor" />);
    expect(within(notesSection()).getByText('Minor 3rd')).toBeTruthy();
    expect(within(notesSection()).queryByText('Major 3rd')).toBeNull();
    unmount();

    render(<ScaleDisplay {...defaultProps} scaleType="major" />);
    expect(within(notesSection()).getByText('Major 3rd')).toBeTruthy();
    expect(within(notesSection()).queryByText('Minor 3rd')).toBeNull();
  });
});

describe('ScaleDisplay interaction tests', () => {
  // As props root/scaleType são só valores iniciais (estado interno);
  // a troca durante o uso acontece pelos botões e pelo dropdown.
  it('updates scale notes when root changes', () => {
    render(<ScaleDisplay root="C" scaleType="major" />);

    expect(displayedNotes()).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);

    fireEvent.click(within(rootSelector()).getByRole('button', { name: 'G' }));

    // G maior = G A B C D E F♯. O C continua na escala (é a 4ª nota); o F natural sai.
    expect(displayedNotes()).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F♯']);
    expect(within(notesSection()).queryByText('F')).toBeNull();
  });

  it('updates harmonic field when scale type changes', () => {
    render(<ScaleDisplay root="C" scaleType="major" showHarmonicField={true} />);

    expect(within(harmonicSection()).getByText('C major')).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue('Major'), { target: { value: 'minor' } });

    const field = within(harmonicSection());
    expect(field.getByText('C minor')).toBeTruthy();
    expect(field.queryByText('C major')).toBeNull();
    expect(field.getByText('D diminished')).toBeTruthy();
    expect(field.getByText('D# major')).toBeTruthy();
  });

  it('handles all available scale types in dropdown', () => {
    render(<ScaleDisplay root="C" scaleType="major" />);

    const selectElement = screen.getByDisplayValue('Major');
    const options = Array.from(selectElement.querySelectorAll('option'));
    const optionValues = options.map((option) => (option as HTMLOptionElement).value);

    const expectedScaleTypes = [
      'major', 'minor', 'harmonic-minor', 'melodic-minor',
      'major-pentatonic', 'minor-pentatonic', 'blues',
      'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian',
    ];

    expectedScaleTypes.forEach((scaleType) => {
      expect(optionValues).toContain(scaleType);
    });
  });
});
