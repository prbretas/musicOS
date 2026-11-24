/** Selo dourado "PRO" — aparece ao lado de todo recurso pago quando o usuário não é Pro. */

export function ProBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`badge-pro ${className}`} title="Recurso do plano Pro">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.9 6.6L22 9.3l-5.3 4.9L18.2 22 12 18.4 5.8 22l1.5-7.8L2 9.3l7.1-.7L12 2z" />
      </svg>
      Pro
    </span>
  );
}
