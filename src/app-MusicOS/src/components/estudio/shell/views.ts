/**
 * Áreas do Estúdio. Uma área aparece por vez; o endereço (#braco, #acordes…)
 * guarda a área atual, então dá para voltar, recarregar e compartilhar o link.
 */

import type { ComponentType, SVGProps } from 'react';
import {
  IconChord,
  IconCircle,
  IconEar,
  IconFretboard,
  IconLayers,
  IconPiano,
  IconScale,
  IconTab,
} from '@/components/ui/icons';

export type ViewId = 'escala' | 'campo' | 'ciclo' | 'braco' | 'acordes' | 'teclado' | 'pratica' | 'treino';

export interface ViewDef {
  id: ViewId;
  label: string;
  /** Rótulo curto (barra inferior do celular) */
  short: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const VIEW_GROUPS: { label: string; views: ViewDef[] }[] = [
  {
    label: 'Teoria',
    views: [
      { id: 'escala', label: 'Escala', short: 'Escala', description: 'Sonoridade, uso e intervalos', Icon: IconScale },
      { id: 'campo', label: 'Notas e campo harmônico', short: 'Campo', description: 'Graus, notas e acordes da escala', Icon: IconLayers },
      { id: 'ciclo', label: 'Ciclo de quintas', short: 'Ciclo', description: 'Tonalidades vizinhas e relativas', Icon: IconCircle },
    ],
  },
  {
    label: 'Instrumento',
    views: [
      { id: 'braco', label: 'Braço', short: 'Braço', description: 'Escala no braço, CAGED e afinações', Icon: IconFretboard },
      { id: 'acordes', label: 'Acordes', short: 'Acordes', description: 'Tríades, tétrades e extensões', Icon: IconChord },
      { id: 'teclado', label: 'Teclado e piano', short: 'Teclado', description: 'Escala e acordes no teclado', Icon: IconPiano },
    ],
  },
  {
    label: 'Prática',
    views: [
      { id: 'pratica', label: 'Tablaturas', short: 'Prática', description: 'Técnica, riffs, arpejos e melodias', Icon: IconTab },
      { id: 'treino', label: 'Treino e CAGED', short: 'Treino', description: 'Ouvido, escalas no CAGED e ranking', Icon: IconEar },
    ],
  },
];

export const VIEWS: ViewDef[] = VIEW_GROUPS.flatMap((g) => g.views);

export function getView(id: ViewId): ViewDef {
  return VIEWS.find((v) => v.id === id)!;
}

export function groupOf(id: ViewId): string {
  return VIEW_GROUPS.find((g) => g.views.some((v) => v.id === id))!.label;
}

/** Endereços antigos (página única) continuam funcionando */
const LEGACY: Record<string, { view: ViewId; tab?: string }> = {
  intervalos: { view: 'escala' },
  transpositor: { view: 'campo' },
  tetrades: { view: 'acordes', tab: 'tetrades' },
  exercicios: { view: 'treino' },
};

export function parseHash(hash: string): { view: ViewId; tab?: string } | null {
  const id = hash.replace(/^#/, '');
  if (!id) return null;
  if (VIEWS.some((v) => v.id === id)) return { view: id as ViewId };
  return LEGACY[id] ?? null;
}

/** Atalhos da barra inferior do celular */
export const MOBILE_TABS: ViewId[] = ['escala', 'braco', 'acordes', 'pratica', 'treino'];
