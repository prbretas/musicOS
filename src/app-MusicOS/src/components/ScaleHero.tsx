/**
 * ScaleHero - Hero section for active scale information
 * Dependência: CMP-004 (ScaleDisplay)
 */

'use client';

import { useState, useEffect } from 'react';
import { ScaleDisplay } from './ScaleDisplay';
import { InfoButton } from './ui/InfoButton';
import type { NoteName, ScaleType } from '@/lib/music/theory';

interface ScaleHeroProps {
  /** Initial root note */
  initialRoot?: NoteName;
  /** Initial scale type */
  initialScaleType?: ScaleType;
  /** Whether to show the educational info button */
  showInfoButton?: boolean;
}

interface ScaleInfo {
  description: string;
  mood: string[];
  commonUse: string[];
  famousSongs: string[];
  color: string;
}

export function ScaleHero({
  initialRoot = 'C',
  initialScaleType = 'major',
  showInfoButton = true,
}: ScaleHeroProps) {
  const [root, setRoot] = useState<NoteName>(initialRoot);
  const [scaleType, setScaleType] = useState<ScaleType>(initialScaleType);
  const [scaleInfo, setScaleInfo] = useState<ScaleInfo>(getScaleInfo(initialRoot, initialScaleType));

  // Update scale info when root or scale type changes
  useEffect(() => {
    setScaleInfo(getScaleInfo(root, scaleType));
  }, [root, scaleType]);

  // Format scale name for display
  const formatScaleName = (root: NoteName, type: ScaleType): string => {
    const scaleNames: Record<ScaleType, string> = {
      'major': 'Major',
      'minor': 'Minor', 
      'harmonic-minor': 'Harmonic Minor',
      'melodic-minor': 'Melodic Minor',
      'major-pentatonic': 'Major Pentatonic',
      'minor-pentatonic': 'Minor Pentatonic',
      'blues': 'Blues',
      'ionian': 'Ionian',
      'dorian': 'Dorian',
      'phrygian': 'Phrygian',
      'lydian': 'Lydian',
      'mixolydian': 'Mixolydian',
      'aeolian': 'Aeolian',
      'locrian': 'Locrian'
    };
    
    return `${root} ${scaleNames[type] || type}`;
  };

  // Get scale information based on type
  function getScaleInfo(root: NoteName, type: ScaleType): ScaleInfo {
    const scaleInfos: Record<string, ScaleInfo> = {
      'major': {
        description: 'The most common scale in Western music, known for its bright and happy sound.',
        mood: ['Happy', 'Joyful', 'Bright', 'Triumphant'],
        commonUse: ['Pop music', 'Rock anthems', 'Classical music', 'National anthems'],
        famousSongs: ['"Twinkle Twinkle Little Star"', '"Happy Birthday"', '"Don\'t Stop Believin\'"'],
        color: '#FF6B6B' // Red
      },
      'minor': {
        description: 'Creates a sad, melancholic, or mysterious atmosphere.',
        mood: ['Sad', 'Melancholic', 'Mysterious', 'Dramatic'],
        commonUse: ['Blues', 'Jazz ballads', 'Film soundtracks', 'Metal'],
        famousSongs: ['"Stairway to Heaven"', '"Nothing Else Matters"', '"Yesterday"'],
        color: '#4ECDC4' // Teal
      },
      'harmonic-minor': {
        description: 'A minor scale with a raised seventh degree, creating exotic and dramatic tension.',
        mood: ['Exotic', 'Dramatic', 'Mysterious', 'Arabic'],
        commonUse: ['Flamenco', 'Middle Eastern music', 'Metal solos', 'Neoclassical'],
        famousSongs: ['"Malagueña"', '"Hava Nagila"', '"Through the Fire and Flames" solos'],
        color: '#45B7D1' // Blue
      },
      'major-pentatonic': {
        description: 'A five-note scale that sounds uplifting and works over major chords.',
        mood: ['Uplifting', 'Bright', 'Simple', 'Folk-like'],
        commonUse: ['Blues', 'Rock solos', 'Country music', 'Traditional folk'],
        famousSongs: ['"My Girl"', '"Amazing Grace"', '"Sweet Home Alabama" riff'],
        color: '#96CEB4' // Green
      },
      'minor-pentatonic': {
        description: 'The most popular scale for rock and blues guitar solos.',
        mood: ['Bluesy', 'Rocking', 'Soulful', 'Gritty'],
        commonUse: ['Blues guitar', 'Rock solos', 'Funk riffs', 'Soul music'],
        famousSongs: ['"Smoke on the Water"', '"Sunshine of Your Love"', '"Purple Haze"'],
        color: '#FFEAA7' // Yellow
      },
      'blues': {
        description: 'Adds a "blue note" to the minor pentatonic for authentic blues sound.',
        mood: ['Bluesy', 'Soulful', 'Gritty', 'Expressive'],
        commonUse: ['Blues music', 'Rock \'n\' roll', 'Jazz', 'Funk'],
        famousSongs: ['"The Thrill is Gone"', '"Sweet Home Chicago"', '"Crossroads"'],
        color: '#DDA0DD' // Plum
      },
      'dorian': {
        description: 'A minor scale with a major sixth, creating a jazzy, funky vibe.',
        mood: ['Jazzy', 'Funky', 'Smooth', 'Sophisticated'],
        commonUse: ['Jazz', 'Funk', 'Hip-hop', 'Progressive rock'],
        famousSongs: ['"So What" (Miles Davis)', '"Scarborough Fair"', '"Oye Como Va"'],
        color: '#98D8C8' // Mint
      },
      'mixolydian': {
        description: 'A major scale with a flattened seventh, perfect for rock and blues.',
        mood: ['Rocking', 'Bluesy', 'Energetic', 'Groovy'],
        commonUse: ['Rock music', 'Blues', 'Funk', 'Grateful Dead jams'],
        famousSongs: ['"Sweet Child O\' Mine" riff', '"L.A. Woman"', '"Hey Jude" outro'],
        color: '#F7DC6F' // Gold
      }
    };

    return scaleInfos[type] || {
      description: 'A versatile musical scale with unique characteristics.',
      mood: ['Versatile', 'Expressive'],
      commonUse: ['Various musical styles'],
      famousSongs: ['Classic compositions'],
      color: '#BB8FCE' // Default purple
    };
  }

  const handleRootChange = (newRoot: NoteName) => {
    setRoot(newRoot);
  };

  const handleScaleTypeChange = (newScaleType: ScaleType) => {
    setScaleType(newScaleType);
  };

  const scaleName = formatScaleName(root, scaleType);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden rounded-2xl shadow-2xl mb-8"
        style={{ 
          background: `linear-gradient(135deg, ${scaleInfo.color}20 0%, rgba(255,255,255,0.1) 100%)`,
          border: `1px solid ${scaleInfo.color}30`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            {/* Left Column: Scale Information */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: scaleInfo.color }}
                >
                  <span className="text-5xl font-bold text-white">
                    {root.replace('#', '♯')}
                  </span>
                </div>
                
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-2">
                    {scaleName}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    {scaleInfo.description}
                  </p>
                </div>

                {showInfoButton && (
                  <div className="ml-auto">
                    <InfoButton 
                      title={`Learn about ${scaleName}`}
                      content={
                        <div className="space-y-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Educational information about {scaleName} scale:
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">Mood:</span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {scaleInfo.mood.join(', ')}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">Common Use:</span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {scaleInfo.commonUse.join(', ')}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">Famous Songs:</span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {scaleInfo.famousSongs.join(', ')}
                              </span>
                            </li>
                          </ul>
                        </div>
                      }
                    />
                  </div>
                )}
              </div>

              {/* Mood Tags */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Mood & Feel
                </h3>
                <div className="flex flex-wrap gap-2">
                  {scaleInfo.mood.map((moodItem) => (
                    <span
                      key={moodItem}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${scaleInfo.color}20`,
                        color: scaleInfo.color,
                        border: `1px solid ${scaleInfo.color}40`
                      }}
                    >
                      {moodItem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Usage Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Common Use
                  </h3>
                  <ul className="space-y-2">
                    {scaleInfo.commonUse.map((use, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-slate-500 dark:text-slate-400 mr-2">•</span>
                        <span className="text-slate-700 dark:text-slate-300">{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Famous Examples
                  </h3>
                  <ul className="space-y-2">
                    {scaleInfo.famousSongs.map((song, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-slate-500 dark:text-slate-400 mr-2">•</span>
                        <span className="text-slate-700 dark:text-slate-300">{song}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Elements */}
            <div className="md:w-64 flex flex-col items-center justify-center">
              {/* Circle of Fifths/Scale Circle Placeholder */}
              <div className="w-48 h-48 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                    {root.replace('#', '♯')}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Tonic
                  </div>
                </div>
              </div>

              {/* Scale Type Badge */}
              <div 
                className="px-6 py-3 rounded-full text-white font-semibold shadow-md"
                style={{ backgroundColor: scaleInfo.color }}
              >
                {scaleType.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ScaleDisplay Component */}
      <div className="mb-12">
        <ScaleDisplay
          root={root}
          scaleType={scaleType}
          showDegrees={true}
          showHarmonicField={true}
          onRootChange={handleRootChange}
          onScaleTypeChange={handleScaleTypeChange}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="px-4 py-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            onClick={() => {
              // In a real app, this would play the scale
              console.log(`Playing ${scaleName} scale`);
            }}
          >
            🎵 Play Scale
          </button>
          <button 
            className="px-4 py-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            onClick={() => {
              // In a real app, this would show exercises
              console.log(`Showing exercises for ${scaleName}`);
            }}
          >
            🏋️ Practice Exercises
          </button>
          <button 
            className="px-4 py-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            onClick={() => {
              // In a real app, this would save the scale
              console.log(`Saving ${scaleName} to favorites`);
            }}
          >
            💾 Save Scale
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScaleHero;