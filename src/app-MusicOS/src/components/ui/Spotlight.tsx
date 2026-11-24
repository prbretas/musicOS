'use client';

/** Contêiner com luz que acompanha o mouse (classe .spotlight no CSS global). */

import type { HTMLAttributes, MouseEvent } from 'react';

export function Spotlight({ className = '', onMouseMove, ...props }: HTMLAttributes<HTMLDivElement>) {
  function move(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    onMouseMove?.(e);
  }
  return <div {...props} onMouseMove={move} className={`spotlight ${className}`} />;
}
