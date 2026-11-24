import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { UpgradeProvider } from '@/components/pro/UpgradeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display', display: 'swap' });

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
    <html lang="pt-BR" className={`dark ${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen">
        <AuthProvider>
          <UpgradeProvider>{children}</UpgradeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
