/**
 * Ícones de traço (24×24, currentColor). Desenhados aqui para não depender
 * de nomes que variam entre versões de bibliotecas de ícones.
 */

import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Escala: degraus subindo */
export const IconScale = (p: P) => (
  <Base {...p}>
    <path d="M3 19h4v-4h4v-4h4V7h4V3" />
    <circle cx="5" cy="19" r="1" fill="currentColor" />
    <circle cx="19" cy="5" r="1" fill="currentColor" />
  </Base>
);
/** Campo harmônico: camadas */
export const IconLayers = (p: P) => (
  <Base {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Base>
);
/** Ciclo de quintas */
export const IconCircle = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M21 12h-2M12 21v-2M3 12h2" />
  </Base>
);
/** Braço do instrumento */
export const IconFretboard = (p: P) => (
  <Base {...p}>
    <rect x="2" y="7" width="20" height="10" rx="2" />
    <path d="M7 7v10M12 7v10M17 7v10" />
    <circle cx="9.5" cy="12" r="1" fill="currentColor" />
    <circle cx="14.5" cy="10" r="1" fill="currentColor" />
  </Base>
);
/** Acordes: grade de diagrama */
export const IconChord = (p: P) => (
  <Base {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M5 8h14M5 13h14M5 18h14M9.5 3v18M14.5 3v18" />
    <circle cx="9.5" cy="10.5" r="1.4" fill="currentColor" />
    <circle cx="14.5" cy="15.5" r="1.4" fill="currentColor" />
  </Base>
);
/** Teclado */
export const IconPiano = (p: P) => (
  <Base {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M7 19v-5M12 19v-5M17 19v-5" />
    <path d="M6 5v9h2V5M11 5v9h2V5M16 5v9h2V5" fill="currentColor" stroke="none" />
  </Base>
);
/** Tablatura */
export const IconTab = (p: P) => (
  <Base {...p}>
    <path d="M3 6h18M3 10h18M3 14h18M3 18h18" opacity=".55" />
    <path d="M8 4v16M16 4v16" />
  </Base>
);
/** Treino auditivo */
export const IconEar = (p: P) => (
  <Base {...p}>
    <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="1.5" />
    <rect x="17" y="14" width="4" height="6" rx="1.5" />
  </Base>
);
export const IconMetronome = (p: P) => (
  <Base {...p}>
    <path d="M9 3h6l4 18H5L9 3Z" />
    <path d="m12 16 5-9" />
    <path d="M7.5 16h9" />
  </Base>
);
export const IconMic = (p: P) => (
  <Base {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Base>
);
export const IconBook = (p: P) => (
  <Base {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
    <path d="M4 19a2 2 0 0 1 2-2h13" />
  </Base>
);
export const IconPrint = (p: P) => (
  <Base {...p}>
    <path d="M7 9V3h10v6" />
    <rect x="3" y="9" width="18" height="8" rx="2" />
    <path d="M7 14h10v7H7z" />
  </Base>
);
export const IconMenu = (p: P) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);
export const IconClose = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);
export const IconArrowRight = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);
export const IconSparkles = (p: P) => (
  <Base {...p}>
    <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
  </Base>
);
export const IconCrown = (p: P) => (
  <Base {...p}>
    <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8Z" />
  </Base>
);
