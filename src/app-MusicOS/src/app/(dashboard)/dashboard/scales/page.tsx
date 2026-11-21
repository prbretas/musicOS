import { ScaleHero } from '@/components/ScaleHero';

export default function ScalesPage() {
  return (
    <div className="space-y-6">
      {/* Main ScaleHero Component */}
      <ScaleHero 
        initialRoot="C"
        initialScaleType="major"
        showInfoButton={true}
      />

      {/* Educational Section */}
      <div className="mt-12 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
          Por que Aprender Escalas?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-4">
              🎵 Benefícios Musicais
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <strong>Melhore a improvisação:</strong> Escalas fornecem as notas que você pode usar para solos
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <strong>Entenda a construção de acordes:</strong> Acordes são construídos a partir de graus da escala
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <strong>Desenvolva o ouvido musical:</strong> Reconheça padrões e intervalos na música
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <strong>Aprimore a técnica:</strong> Praticar escalas melhora a destreza dos dedos
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-4">
              🎸 Dicas Práticas
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <strong>Comece com maior e menor:</strong> Estas são a base da música ocidental
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <strong>Pratique devagar:</strong> Precisão é mais importante que velocidade
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <strong>Use um metrônomo:</strong> Desenvolva timing e ritmo consistentes
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <strong>Explore diferentes posições:</strong> Aprenda escalas em todo o braço do instrumento
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}