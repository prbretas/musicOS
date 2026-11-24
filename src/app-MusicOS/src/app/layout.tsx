import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { UpgradeProvider } from '@/components/pro/UpgradeProvider';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'MusicOS — Estúdio de teoria musical para quem toca',
    template: '%s · MusicOS',
  },
  description:
    'Escalas, campo harmônico, braço da guitarra, CAGED, ciclo de quintas, metrônomo, afinador e treino auditivo. Grátis para começar, Pro para ir além.',
  manifest: '/manifest.json',
  applicationName: 'MusicOS',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'MusicOS',
    title: 'MusicOS — Estúdio de teoria musical para quem toca',
    description: 'Escalas, acordes, braço, CAGED, afinador e exercícios num só lugar.',
  },
  icons: { icon: '/icon.svg', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#0b0d12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen">
        {/* Fundo animado (aurora) atrás de todas as páginas */}
        <div className="aurora no-print" aria-hidden="true">
          <span className="aurora-blob aurora-1" />
          <span className="aurora-blob aurora-2" />
          <span className="aurora-blob aurora-3" />
          <span className="aurora-grid" />
        </div>
        <AuthProvider>
          <UpgradeProvider>{children}</UpgradeProvider>
          <AnalyticsProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
