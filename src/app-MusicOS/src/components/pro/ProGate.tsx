'use client';

/**
 * Portão de recurso Pro.
 *
 * `useProFeature(id)` devolve `{ allowed, gate }`: se o usuário não pode usar
 * o recurso, `gate()` abre o modal de upgrade e retorna false. Use dentro de
 * handlers:
 *
 *   const tetrads = useProFeature('tetrads');
 *   onChange={(v) => tetrads.gate() && setTetrads(v)}
 *
 * `<ProGate feature="exercises">` embrulha um bloco inteiro: o conteúdo fica
 * visível porém esmaecido, com um selo PRO e um botão de desbloqueio.
 */

import type { ReactNode } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUpgrade } from './UpgradeProvider';
import { ProBadge } from './ProBadge';
import { canUse, FEATURES, type FeatureId } from '@/lib/features';

export function useProFeature(feature: FeatureId) {
  const { entitlement } = useAuth();
  const { openUpgrade } = useUpgrade();
  const allowed = canUse(entitlement.tier, feature);

  return {
    allowed,
    /** true se pode seguir; false (e abre o modal) se precisa de upgrade */
    gate: (): boolean => {
      if (allowed) return true;
      openUpgrade(feature);
      return false;
    },
    openUpgrade: () => openUpgrade(feature),
  };
}

export function ProGate({
  feature,
  children,
  className = '',
  title,
}: {
  feature: FeatureId;
  children: ReactNode;
  className?: string;
  /** Título mostrado no cartão de bloqueio (padrão: nome do recurso) */
  title?: string;
}) {
  const { allowed, openUpgrade } = useProFeature(feature);
  if (allowed) return <>{children}</>;

  const info = FEATURES[feature];

  return (
    <div className={`relative rounded-2xl ${className}`}>
      <div className="pro-locked rounded-2xl" onClick={openUpgrade} aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <button
          onClick={openUpgrade}
          className="card max-w-sm w-full p-5 text-left hover:border-pro-400/60 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-2">
            <ProBadge />
            <span className="text-xs text-slate-400">Recurso do plano Pro</span>
          </div>
          <p className="font-bold text-white text-lg">{title ?? info.label}</p>
          <p className="text-sm text-slate-400 mt-1">{info.description}</p>
          <span className="btn-pro mt-4 w-full group-hover:brightness-110">Desbloquear</span>
        </button>
      </div>
    </div>
  );
}

/** Rótulo com selo PRO quando o usuário ainda não tem acesso ao recurso. */
export function ProLabel({ feature, children }: { feature: FeatureId; children: ReactNode }) {
  const { allowed } = useProFeature(feature);
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      {!allowed && <ProBadge />}
    </span>
  );
}
