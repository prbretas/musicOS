import Link from 'next/link';
import { Fretboard } from '@/components/Fretboard';
import { ChordDiagram } from '@/components/ChordDiagram';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo ao MusicOS! 🎸</h1>
        <p className="text-purple-100 mb-6">
          Sua plataforma completa para aprender e praticar música
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/scales"
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg"
          >
            Explorar Escalas
          </Link>
          <Link
            href="/dashboard/chords"
            className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all backdrop-blur"
          >
            Ver Acordes
          </Link>
        </div>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Metrônomo',
            desc: 'Pratique sua timing',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            href: '/dashboard/tools',
            color: 'from-red-500 to-orange-500',
          },
          {
            title: 'Círculo das Quintas',
            desc: 'Entenda harmonia',
            icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
            href: '/dashboard/tools',
            color: 'from-yellow-500 to-amber-500',
          },
          {
            title: 'Afinações',
            desc: 'Guitarra e ukulele',
            icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
            href: '/dashboard/tools',
            color: 'from-green-500 to-emerald-500',
          },
          {
            title: 'Exercícios',
            desc: 'Melhore suas skills',
            icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
            href: '/dashboard/exercises',
            color: 'from-blue-500 to-indigo-500',
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.color} text-white mb-4`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{card.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Preview section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scale preview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              Preview: Dó Maior
            </h2>
            <Link
              href="/dashboard/scales"
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Ver mais →
            </Link>
          </div>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 overflow-x-auto">
            <Fretboard
              instrument="guitar"
              scale={{ root: 'C', type: 'maior', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }}
              showIntervals
            />
          </div>
        </div>

        {/* Chord preview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              Preview: Sol Maior
            </h2>
            <Link
              href="/dashboard/chords"
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Ver mais →
            </Link>
          </div>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6 flex justify-center">
            <ChordDiagram
              chord={{
                name: 'G',
                root: 'G',
                type: 'major',
                notes: ['G', 'B', 'D'],
                positions: [3, 2, 0, 0, 3, 3],
                fingering: [2, 1, 0, 0, 3, 3],
              }}
            />
          </div>
        </div>
      </div>

      {/* Pro banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Desbloqueie o MusicOS Pro</h3>
            <p className="text-amber-100">
              Afinações completas, acordes avançados, exercícios personalizados e mais!
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-amber-50 transition-all shadow-lg whitespace-nowrap"
          >
            Ver Planos
          </Link>
        </div>
      </div>
    </div>
  );
}