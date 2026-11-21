/**
 * Demo Page for ScaleHero Component
 * Demonstrates the ScaleHero and ScaleDisplay components working together
 */

import { ScaleHero } from '@/components/ScaleHero';

export default function ScaleHeroDemoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            ScaleHero Component Demo
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            This page demonstrates the ScaleHero component (CMP-005) and ScaleDisplay component (CMP-004) 
            working together to provide a complete scale exploration interface.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              CMP-004: ScaleDisplay
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
              CMP-005: ScaleHero
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
              CORE-001: Music Theory Engine
            </span>
          </div>
        </div>

        {/* Main Demo Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-6">
            Interactive Scale Explorer
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            The ScaleHero component provides a hero section with detailed information about the active scale,
            while the ScaleDisplay component shows the actual scale notes, degrees, and harmonic field.
            They work together seamlessly - changing the root or scale type in ScaleDisplay automatically updates the ScaleHero.
          </p>
          
          <ScaleHero 
            initialRoot="C"
            initialScaleType="major"
            showInfoButton={true}
          />
        </div>

        {/* Component Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
              ScaleHero Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Detailed scale information</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Mood & feel descriptions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Common usage examples</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Famous song references</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Educational InfoButton integration</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
              ScaleDisplay Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Visual scale note display</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Scale degree labels</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Harmonic field chords</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Interactive root note selector</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Scale type dropdown</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
              Music Theory Engine
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">14 scale types supported</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">12 root notes</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Harmonic field generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Scale degree calculation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Chord construction</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
            Try Different Scales
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Change the scale type and root note to explore different musical scales. Each scale has unique characteristics.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Blues Scale</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Perfect for authentic blues and rock &apos;n&apos; roll sound.
              </p>
              <ScaleHero 
                initialRoot="A"
                initialScaleType="blues"
                showInfoButton={false}
              />
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Minor Pentatonic</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                The most popular scale for rock and blues guitar solos.
              </p>
              <ScaleHero 
                initialRoot="E"
                initialScaleType="minor-pentatonic"
                showInfoButton={false}
              />
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Dorian Mode</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Creates a jazzy, funky vibe perfect for improvisation.
              </p>
              <ScaleHero 
                initialRoot="D"
                initialScaleType="dorian"
                showInfoButton={false}
              />
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Harmonic Minor</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Creates exotic and dramatic tension in melodies.
              </p>
              <ScaleHero 
                initialRoot="G"
                initialScaleType="harmonic-minor"
                showInfoButton={false}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            This demo showcases the complete implementation of P0 issues CMP-004 (ScaleDisplay) and CMP-005 (ScaleHero).
            Both components are now ready for integration into the main application.
          </p>
          <div className="mt-4">
            <a 
              href="/dashboard/scales"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Scales Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}