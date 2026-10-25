/**
 * InfoButton.tsx — Componente de Ajuda Contextual
 * 
 * Este componente exibe um botão de informação que, quando clicado,
 * mostra um popup com conteúdo educacional contextual.
 * 
 * É parte fundamental do sistema educacional do MusicOS, permitindo
 * que o usuário entenda conceitos teóricos enquanto usa as ferramentas.
 * 
 * @see docs/EDUCATIONAL.md para detalles sobre a estratégia educacional
 */

// ============================================
// IMPORTS
// ============================================

"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

// ============================================
// TIPOS (INTERFACES)
// ============================================

/**
 * Props do componente InfoButton
 * 
 * @param content - O conteúdo a ser exibido (string ou React node)
 * @param title - Título do popup (opcional)
 * @param position - Posição do popup: top-right, top-left, ou inline
 * @param size - Tamanho do botão: sm, md, lg
 */
interface InfoButtonProps {
  content: string | React.ReactNode;
  title?: string;
  position?: "top-right" | "top-left" | "inline";
  size?: "sm" | "md" | "lg";
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * InfoButton - Componente de ajuda contextual
 * 
 * Exibe um botão com ícone de informação que, ao ser clicado,
 * abre um popup com conteúdo educacional relevante.
 * 
 * Uso típico:
 * ```tsx
 * <InfoButton 
 *   content="O ciclo de quintas é uma sequência de notas..."
 *   title="Ciclo de Quintas"
 *   position="top-right"
 * />
 * ```
 */
export function InfoButton({ 
  content, 
  title = "Informações", 
  position = "top-right",
  size = "sm"
}: InfoButtonProps) {
  // Estado para controlar se o popup está aberto ou fechado
  const [isOpen, setIsOpen] = useState(false);

  // ============================================
  // ESTILOS DINÂMICOS
  // ============================================
  
  // Classes Tailwind para cada tamanho de botão
  const sizeClasses = {
    sm: "w-5 h-5 text-xs",    // Pequeno: 20x20px
    md: "w-6 h-6 text-sm",    // Médio: 24x24px
    lg: "w-7 h-7 text-base"   // Grande: 28x28px
  };

  // Tamanhos do ícone interno para cada tamanho
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  // Classes de posição do popup relativo ao botão
  const positionClasses = {
    "top-right": "-top-2 -right-2",  // Popup aparece acima, à direita
    "top-left": "-top-2 -left-2",    // Popup aparece acima, à esquerda
    "inline": "static ml-2"          // Popup aparece inline com o texto
  };

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  return (
    // Container posicionado relativamente para permitir absolute children
    <div className="relative inline-block">
      
      {/* 
       * BOTÃO DE INFO
       * Um botão circular azul com ícone de informação (i)
       */}
      <button
        onClick={() => setIsOpen(!isOpen)}  // Alterna estado isOpen
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center rounded-full 
          bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 
          font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors
          cursor-help info-button z-10
        `}
        aria-label="Mais informações"
        title={title}
      >
        {/* Ícone de informação importado de lucide-react */}
        <Info size={iconSizes[size]} />
      </button>

      {/* 
       * POPUP DE CONTEÚDO
       * Appears only when isOpen is true
       * Usa animação fade-in e zoom-in para suavidade
       */}
      {isOpen && (
        <div 
          className={`
            absolute z-50 w-72 p-4 
            bg-white dark:bg-gray-800 rounded-lg shadow-xl 
            border border-gray-200 dark:border-gray-700
            animate-in fade-in zoom-in duration-200
            ${position === "top-right" ? "top-6 right-0 mt-2" : 
              position === "top-left" ? "top-6 left-0 mt-2" : 
              "static ml-2"}
          `}
        >
          {/* Header: Título + Botão de fechar */}
          <div className="flex justify-between items-start mb-2">
            {title && (
              <h4 className="font-bold text-sm text-gray-900 dark:text-white pr-2">
                {title}
              </h4>
            )}
            <button 
              onClick={() => setIsOpen(false)}  // Fecha o popup
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* 
           * CORPO DO CONTEÚDO
           * Suporta tanto string (com formatação de parágrafos) 
           * quanto React nodes customizados
           */}
          <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {typeof content === "string" ? (
              // Se conteúdo é string, faz split por novas linhas
              <div className="prose prose-sm dark:prose-invert">
                {content.split('\n').map((line, i) => (
                  // Cada linha vira um parágrafo
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            ) : (
              // Se conteúdo é React node, renderiza diretamente
              content
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// BANCO DE CONTEÚDO EDUCACIONAL
// ============================================

/**
 * Banco de textos educacionais pré-definidos
 * 
 * Cada entrada contém:
 * - title: Título da seção
 * - content: Texto educacional formatado com markdown
 * 
 * @example
 * // Uso com hook:
 * const content = educationalContent["circle-of-fifths"];
 * // Resultado: { title: "O Ciclo de Quintas", content: "..." }
 */
export const educationalContent: Record<string, { title: string; content: string }> = {
  "circle-of-fifths": {
    title: "O Ciclo de Quintas",
    content: `O **Ciclo de Quintas** é uma sequência de tons que passa por todas as 12 notas musicais, subindo cada vez uma quinta acima (7 semitons).

**Como usar no estudo:**
1. Pratique os acordes em cada grau
2. Use para transpor progressões
3. As notas de cada acorde são base para solos

**Exemplo:** A progressão I-IV-V-I (C-F-G-C) é uma das mais usadas na música ocidental!

**Dica:** Comece devagar (60 BPM) e aumente gradualmente.`
  },
  "scales": {
    title: "Entendendo Escalas",
    content: `As **escalas** são como um "cardápio de notas" que você pode usar para tocar melodias e solos.

**A Escala Maior:**
Segue o padrão T-T-S-T-T-T-S (Tom-Tom-Semitom).

**Como memorizar:**
1. Aprenda os intervalos (2ª, 3ª, 4ª, etc.)
2. Pratique no fretboard em uma posição
3. Expanda para outras posições gradualmente

**Dica:** Não decore todas as notas de uma vez. Comece com uma posição!`
  },
  "chord-field": {
    title: "O Campo Harmônico",
    content: `O **Campo Harmônico** de uma tonalidade contém os 7 acordes que "pertencem" àquela escala.

**Os 7 Graus e Suas Funções:**
- **I (Tônica):** Estável, ponto de descanso
- **ii (Supertônica):** Instável, tensão suave
- **iii (Mediante):** Estável-macio
- **IV (Subdominante):** Instável, prepara dominante
- **V (Dominante):** Tensivo, quer resolver
- **vi (Relativo menor):** Estável-macio
- **vii° (Sensível):** Muito tensivo

**Dica:** Cada grau tem uma "função" na música.`
  },
  "metronome": {
    title: "Usando o Metrônomo",
    content: `O **metrônomo** é sua ferramenta mais importante para desenvolver ritmo.

**Por que usar?**
- Mantém o tempo constante
- Ajuda a identificar variações de velocidade
- Desenvolve disciplina rítmica

**Dicas de prática:**
- Comece 20-30 BPM mais lento que o alvo
- Aumente 5-10 BPM quando dominar
- Use subdivisions (colcheias) para desafiar

**Regra de ouro:** Tocar devagar e preciso é mais valioso que rápido e errado!`
  },
  "fretboard": {
    title: "Navegando o Fretboard",
    content: `O **fretboard** mostra as notas ao longo das cordas do instrumento.

**Dicas para memorizar:**
1. Encontre todas as Cs primeiro (são suas "bússolas")
2. Aprenda os intervalos de uma nota
3. Pratique escalas em diferentes posições

**Sistema CAGED:**
Divide o fretboard em 5 posições baseadas nas formas de acorde abertas.

**Quanto mais você praticar, mais natural se torna!**`
  }
};

// ============================================
// HOOK PERSONALIZADO
// ============================================

/**
 * Hook para buscar conteúdo educacional por seção
 * 
 * @param sectionId - ID da seção (ex: "circle-of-fifths", "scales")
 * @returns Objeto com title e content, ou null se não encontrado
 * 
 * @example
 * ```tsx
 * const content = useEducationalContent("circle-of-fifths");
 * if (content) {
 *   return <InfoButton content={content.content} title={content.title} />;
 * }
 * ```
 */
export function useEducationalContent(sectionId: string) {
  const content = educationalContent[sectionId];
  return content || null;
}