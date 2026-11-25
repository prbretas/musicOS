import Link from 'next/link';
import { LogoMark } from '@/components/ui/Logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-600 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <LogoMark className="w-6 h-6" />
          <span>MusicOS © {new Date().getFullYear()} · Estude música com ferramentas profissionais.</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/pricing" className="hover:text-slate-300">
            Planos
          </Link>
          <Link href="/terms" className="hover:text-slate-300">
            Termos
          </Link>
          <Link href="/privacy" className="hover:text-slate-300">
            Privacidade
          </Link>
          <a href="mailto:suporte@musicos.app" className="hover:text-slate-300">
            Suporte
          </a>
        </nav>
      </div>
    </footer>
  );
}
