import {
  getNoteIndex,
  transposeNote,
  getInterval,
  getScaleNotes,
  getChordNotes,
  isNoteInScale,
  getScaleDegree,
  getScaleDegrees,
  getHarmonicField,
  semitonesToInterval,
  getAvailableScaleTypes,
  getAvailableChordTypes,
  type NoteName,
  type ScaleType,
  type ChordType
} from '@/lib/music/theory';

describe('Music Theory Engine', () => {
  describe('getNoteIndex', () => {
    it('returns correct index for natural notes', () => {
      expect(getNoteIndex('C')).toBe(0);
      expect(getNoteIndex('D')).toBe(2);
      expect(getNoteIndex('E')).toBe(4);
      expect(getNoteIndex('F')).toBe(5);
      expect(getNoteIndex('G')).toBe(7);
      expect(getNoteIndex('A')).toBe(9);
      expect(getNoteIndex('B')).toBe(11);
    });

    it('returns correct index for sharp notes', () => {
      expect(getNoteIndex('C#')).toBe(1);
      expect(getNoteIndex('D#')).toBe(3);
      expect(getNoteIndex('F#')).toBe(6);
      expect(getNoteIndex('G#')).toBe(8);
      expect(getNoteIndex('A#')).toBe(10);
    });
  });

  describe('transposeNote', () => {
    it('transposes up by semitones correctly', () => {
      expect(transposeNote('C', 2)).toBe('D');
      expect(transposeNote('C', 4)).toBe('E');
      expect(transposeNote('C', 7)).toBe('G');
      expect(transposeNote('C', 12)).toBe('C'); // Octave
    });

    it('transposes with sharps correctly', () => {
      expect(transposeNote('C', 1)).toBe('C#');
      expect(transposeNote('C#', 1)).toBe('D');
      expect(transposeNote('G#', 1)).toBe('A');
    });

    it('handles wrapping around the chromatic scale', () => {
      expect(transposeNote('B', 1)).toBe('C');
      expect(transposeNote('B', 2)).toBe('C#');
      expect(transposeNote('A#', 3)).toBe('C#');
    });
  });

  describe('getInterval', () => {
    it('calculates intervals between notes', () => {
      expect(getInterval('C', 'D')).toBe(2); // Major 2nd
      expect(getInterval('C', 'E')).toBe(4); // Major 3rd
      expect(getInterval('C', 'G')).toBe(7); // Perfect 5th
      expect(getInterval('C', 'C')).toBe(0); // Unison
      expect(getInterval('C', 'C#')).toBe(1); // Minor 2nd
    });

    it('calculates intervals going backwards', () => {
      expect(getInterval('D', 'C')).toBe(10); // Major 7th (11 - 2 + 1)
      expect(getInterval('E', 'C')).toBe(8); // Minor 6th
      expect(getInterval('G', 'C')).toBe(5); // Perfect 4th
    });
  });

  describe('getScaleNotes', () => {
    it('returns correct notes for C major scale', () => {
      const scale = getScaleNotes('C', 'major');
      expect(scale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('returns correct notes for C minor scale', () => {
      const scale = getScaleNotes('C', 'minor');
      expect(scale).toEqual(['C', 'D', 'D#', 'F', 'G', 'G#', 'A#']);
    });

    it('returns correct notes for C harmonic minor scale', () => {
      const scale = getScaleNotes('C', 'harmonic-minor');
      expect(scale).toEqual(['C', 'D', 'D#', 'F', 'G', 'G#', 'B']);
    });

    it('returns correct notes for G major scale', () => {
      const scale = getScaleNotes('G', 'major');
      expect(scale).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
    });

    it('returns correct notes for F major scale', () => {
      const scale = getScaleNotes('F', 'major');
      expect(scale).toEqual(['F', 'G', 'A', 'A#', 'C', 'D', 'E']);
    });

    it('returns correct notes for A minor scale', () => {
      const scale = getScaleNotes('A', 'minor');
      expect(scale).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });

    it('returns correct number of notes for pentatonic scales', () => {
      const majorPent = getScaleNotes('C', 'major-pentatonic');
      const minorPent = getScaleNotes('C', 'minor-pentatonic');
      
      expect(majorPent).toHaveLength(5);
      expect(minorPent).toHaveLength(5);
      
      expect(majorPent).toEqual(['C', 'D', 'E', 'G', 'A']);
      expect(minorPent).toEqual(['C', 'D#', 'F', 'G', 'A#']);
    });

    it('returns correct notes for modes', () => {
      const dorian = getScaleNotes('D', 'dorian');
      const mixolydian = getScaleNotes('G', 'mixolydian');
      
      expect(dorian).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C']);
      expect(mixolydian).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F']);
    });
  });

  describe('getChordNotes', () => {
    it('returns correct notes for C major chord', () => {
      const chord = getChordNotes('C', 'major');
      expect(chord).toEqual(['C', 'E', 'G']);
    });

    it('returns correct notes for C minor chord', () => {
      const chord = getChordNotes('C', 'minor');
      expect(chord).toEqual(['C', 'D#', 'G']);
    });

    it('returns correct notes for C diminished chord', () => {
      const chord = getChordNotes('C', 'diminished');
      expect(chord).toEqual(['C', 'D#', 'F#']);
    });

    it('returns correct notes for C major7 chord', () => {
      const chord = getChordNotes('C', 'major7');
      expect(chord).toEqual(['C', 'E', 'G', 'B']);
    });

    it('returns correct notes for C dominant7 chord', () => {
      const chord = getChordNotes('C', 'dominant7');
      expect(chord).toEqual(['C', 'E', 'G', 'A#']);
    });

    it('returns correct notes for G major chord', () => {
      const chord = getChordNotes('G', 'major');
      expect(chord).toEqual(['G', 'B', 'D']);
    });

    it('returns correct notes for chords with sharps', () => {
      const chord = getChordNotes('F#', 'major');
      expect(chord).toEqual(['F#', 'A#', 'C#']);
    });
  });

  describe('isNoteInScale', () => {
    it('identifies notes in C major scale', () => {
      expect(isNoteInScale('C', 'C', 'major')).toBe(true);
      expect(isNoteInScale('D', 'C', 'major')).toBe(true);
      expect(isNoteInScale('E', 'C', 'major')).toBe(true);
      expect(isNoteInScale('F', 'C', 'major')).toBe(true);
      expect(isNoteInScale('G', 'C', 'major')).toBe(true);
      expect(isNoteInScale('A', 'C', 'major')).toBe(true);
      expect(isNoteInScale('B', 'C', 'major')).toBe(true);
      expect(isNoteInScale('C#', 'C', 'major')).toBe(false);
      expect(isNoteInScale('D#', 'C', 'major')).toBe(false);
    });

    it('identifies notes in C minor scale', () => {
      expect(isNoteInScale('C', 'C', 'minor')).toBe(true);
      expect(isNoteInScale('D', 'C', 'minor')).toBe(true);
      expect(isNoteInScale('D#', 'C', 'minor')).toBe(true);
      expect(isNoteInScale('F', 'C', 'minor')).toBe(true);
      expect(isNoteInScale('G', 'C', 'minor')).toBe(true);
      expect(isNoteInScale('G#', 'C', 'minor')).toBe(true);
      expect(isNoteInScale('A#', 'C', 'minor')).toBe(true);
      expect(isNoteInScale('C#', 'C', 'minor')).toBe(false);
      expect(isNoteInScale('E', 'C', 'minor')).toBe(false);
    });
  });

  describe('getScaleDegree', () => {
    it('returns correct degree for notes in C major', () => {
      expect(getScaleDegree('C', 'C', 'major')).toBe(1);
      expect(getScaleDegree('D', 'C', 'major')).toBe(2);
      expect(getScaleDegree('E', 'C', 'major')).toBe(3);
      expect(getScaleDegree('F', 'C', 'major')).toBe(4);
      expect(getScaleDegree('G', 'C', 'major')).toBe(5);
      expect(getScaleDegree('A', 'C', 'major')).toBe(6);
      expect(getScaleDegree('B', 'C', 'major')).toBe(7);
    });

    it('returns null for notes not in scale', () => {
      expect(getScaleDegree('C#', 'C', 'major')).toBe(null);
      expect(getScaleDegree('D#', 'C', 'major')).toBe(null);
      expect(getScaleDegree('F#', 'C', 'major')).toBe(null);
    });

    it('returns correct degree for pentatonic scales', () => {
      expect(getScaleDegree('C', 'C', 'major-pentatonic')).toBe(1);
      expect(getScaleDegree('D', 'C', 'major-pentatonic')).toBe(2);
      expect(getScaleDegree('E', 'C', 'major-pentatonic')).toBe(3);
      expect(getScaleDegree('G', 'C', 'major-pentatonic')).toBe(4);
      expect(getScaleDegree('A', 'C', 'major-pentatonic')).toBe(5);
      expect(getScaleDegree('F', 'C', 'major-pentatonic')).toBe(null); // Not in scale
    });
  });

  describe('getScaleDegrees', () => {
    it('returns correct degree names for major scale', () => {
      const degrees = getScaleDegrees('major');
      expect(degrees).toEqual([
        'Root',
        'Major 2nd',
        'Major 3rd',
        'Perfect 4th',
        'Perfect 5th',
        'Major 6th',
        'Major 7th'
      ]);
    });

    it('returns correct degree names for minor scale', () => {
      const degrees = getScaleDegrees('minor');
      expect(degrees).toEqual([
        'Root',
        'Major 2nd',
        'Minor 3rd',
        'Perfect 4th',
        'Perfect 5th',
        'Minor 6th',
        'Minor 7th'
      ]);
    });

    it('returns correct degree names for pentatonic scales', () => {
      const majorPent = getScaleDegrees('major-pentatonic');
      const minorPent = getScaleDegrees('minor-pentatonic');
      
      expect(majorPent).toEqual([
        'Root',
        'Major 2nd',
        'Major 3rd',
        'Perfect 5th',
        'Major 6th'
      ]);
      
      expect(minorPent).toEqual([
        'Root',
        'Minor 3rd',
        'Perfect 4th',
        'Perfect 5th',
        'Minor 7th'
      ]);
    });

    it('returns generic degrees for unknown scale types', () => {
      const degrees = getScaleDegrees('blues' as ScaleType);
      expect(degrees).toHaveLength(7);
      expect(degrees[0]).toBe('Degree 1');
    });
  });

  describe('getHarmonicField', () => {
    it('returns correct harmonic field for C major', () => {
      const field = getHarmonicField('C', 'major');
      
      expect(field).toHaveLength(7);
      
      expect(field[0]).toEqual({
        degree: 1,
        chord: 'C major',
        notes: ['C', 'E', 'G']
      });
      
      expect(field[1]).toEqual({
        degree: 2,
        chord: 'D minor',
        notes: ['D', 'F', 'A']
      });
      
      expect(field[6]).toEqual({
        degree: 7,
        chord: 'B diminished',
        notes: ['B', 'D', 'F']
      });
    });

    it('returns correct harmonic field for C minor', () => {
      const field = getHarmonicField('C', 'minor');
      
      expect(field).toHaveLength(7);
      
      expect(field[0]).toEqual({
        degree: 1,
        chord: 'C minor',
        notes: ['C', 'D#', 'G']
      });
      
      expect(field[1]).toEqual({
        degree: 2,
        chord: 'D diminished',
        notes: ['D', 'F', 'G#']
      });
      
      expect(field[3]).toEqual({
        degree: 4,
        chord: 'F minor',
        notes: ['F', 'G#', 'C']
      });
    });
  });

  describe('semitonesToInterval', () => {
    it('converts semitones to interval names', () => {
      expect(semitonesToInterval(0)).toBe('Perfect Unison');
      expect(semitonesToInterval(1)).toBe('Minor 2nd');
      expect(semitonesToInterval(2)).toBe('Major 2nd');
      expect(semitonesToInterval(3)).toBe('Minor 3rd');
      expect(semitonesToInterval(4)).toBe('Major 3rd');
      expect(semitonesToInterval(5)).toBe('Perfect 4th');
      expect(semitonesToInterval(6)).toBe('Tritone');
      expect(semitonesToInterval(7)).toBe('Perfect 5th');
      expect(semitonesToInterval(8)).toBe('Minor 6th');
      expect(semitonesToInterval(9)).toBe('Major 6th');
      expect(semitonesToInterval(10)).toBe('Minor 7th');
      expect(semitonesToInterval(11)).toBe('Major 7th');
      expect(semitonesToInterval(12)).toBe('Perfect Octave');
    });

    it('returns generic name for unknown semitone count', () => {
      expect(semitonesToInterval(13)).toBe('13 semitones');
      expect(semitonesToInterval(24)).toBe('24 semitones');
    });
  });

  describe('getAvailableScaleTypes', () => {
    it('returns all available scale types', () => {
      const scaleTypes = getAvailableScaleTypes();
      
      expect(scaleTypes).toHaveLength(14);
      expect(scaleTypes).toContain('major');
      expect(scaleTypes).toContain('minor');
      expect(scaleTypes).toContain('harmonic-minor');
      expect(scaleTypes).toContain('major-pentatonic');
      expect(scaleTypes).toContain('minor-pentatonic');
      expect(scaleTypes).toContain('blues');
      expect(scaleTypes).toContain('ionian');
      expect(scaleTypes).toContain('dorian');
      expect(scaleTypes).toContain('phrygian');
      expect(scaleTypes).toContain('lydian');
      expect(scaleTypes).toContain('mixolydian');
      expect(scaleTypes).toContain('aeolian');
      expect(scaleTypes).toContain('locrian');
    });
  });

  describe('getAvailableChordTypes', () => {
    it('returns all available chord types', () => {
      const chordTypes = getAvailableChordTypes();
      
      // Count the chord types defined in the theory.ts file
      expect(chordTypes).toHaveLength(14);
      expect(chordTypes).toContain('major');
      expect(chordTypes).toContain('minor');
      expect(chordTypes).toContain('diminished');
      expect(chordTypes).toContain('augmented');
      expect(chordTypes).toContain('major7');
      expect(chordTypes).toContain('minor7');
      expect(chordTypes).toContain('dominant7');
      expect(chordTypes).toContain('diminished7');
      expect(chordTypes).toContain('half-diminished7');
      expect(chordTypes).toContain('sus2');
      expect(chordTypes).toContain('sus4');
      expect(chordTypes).toContain('add9');
      expect(chordTypes).toContain('maj9');
      expect(chordTypes).toContain('min9');
    });
  });
});