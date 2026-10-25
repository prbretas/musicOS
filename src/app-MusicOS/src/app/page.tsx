import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MusicOS
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          O sistema operacional da sua jornada musical. Teoria e prática integradas
          em uma plataforma completa e acessível.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Começar Grátis
          </Link>
          <Link
            href="#features"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Ver Features
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo Que Você Precisa Para Aprender Música
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Teoria */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📐</div>
            <h3 className="text-xl font-semibold mb-2">Teoria Musical</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Escalas, modos, campo harmônico e círculo de quintas explicados
              de forma visual e interativa.
            </p>
          </div>

          {/* Prática */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎸</div>
            <h3 className="text-xl font-semibold mb-2">Fretboard Interativo</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Veja as notas no braço do instrumento, destaque de escalas e
              acordes com áudio em tempo real.
            </p>
          </div>

          {/* Educacional */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Educação Contextual</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Explicações em cada seção. Clique no &quot;i&quot; para entender
              os conceitos enquanto pratica.
            </p>
          </div>

          {/* Exercícios */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Exercícios Guiados</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Gerador de exercícios de escalas, progressões e técnicas
              com metrônomo integrado.
            </p>
          </div>

          {/* Multi-instrumento */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold mb-2">Multi-instrumento</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Guitarra, violão, ukulele, baixo e mais. Todos com afinações
              customizáveis.
            </p>
          </div>

          {/* Preço */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Acessível</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Por apenas <strong>R$9,90/mês</strong>, 89% mais barato que
              apps similares. Versão gratuita disponível.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Planos</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <p className="text-4xl font-black text-blue-600 mb-6">R$0</p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Para experimentar</p>
              <ul className="space-y-3 mb-8">
                <li>✅ 5 tonalidades básicas</li>
                <li>✅ Escalas Maior/Menor</li>
                <li>✅ Fretboard interativo</li>
                <li>✅ Acordes essenciais</li>
                <li>✅ Metrônomo básico</li>
              </ul>
              <Link
                href="/login"
                className="block text-center py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Pro */}
            <div className="p-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg text-white relative">
              <div className="absolute -top-4 right-8 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                Mais Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <p className="text-4xl font-black mb-6">R$9,90<span className="text-lg font-normal">/mês</span></p>
              <p className="opacity-90 mb-6">Para músicos dedicados</p>
              <ul className="space-y-3 mb-8">
                <li>✅ Todas as 12 tonalidades</li>
                <li>✅ Todos os modos gregos</li>
                <li>✅ Multi-instrumento completo</li>
                <li>✅ Campo harmônico completo</li>
                <li>✅ Exercícios ilimitados</li>
                <li>✅ Técnicas instrumentais</li>
                <li>✅ Progresso sincronizado</li>
              </ul>
              <Link
                href="/login"
                className="block text-center py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                Assinar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 MusicOS. Desenvolvido com ❤️ para músicos.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Evolução do projeto musicpages
          </p>
        </div>
      </footer>
    </div>
  );
}