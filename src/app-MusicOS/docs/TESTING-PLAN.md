# MusicOS — Plano de Testes Completo

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Stack de Testes:** Vitest + React Testing Library + Playwright

---

## 1. Estratégia de Testes

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PIRÂMIDE DE TESTES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                        E2E (Playwright)                             │
│                    ╱──────────────────╲                             │
│                   ╱                    ╲                            │
│                  ╱      10-15%          ╲                           │
│                 ╱                        ╲                          │
│                ┌──────────────────────────┐                        │
│               │    Integração (API/DB)     │                       │
│              │        20-25%              │                       │
│             │                              │                       │
│            │    Unitários (Vitest)         │                      │
│           │          60-70%               │                      │
│          │                                 │                      │
│         ▼─────────────────────────────────▼                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tipos de Testes

### 2.1 Testes Unitários

| Escopo | O Que Testa | Exemplos |
|--------|-------------|----------|
| **Componentes UI** | Renderização, estados, eventos | InfoButton abre/fecha |
| **Hooks** | Lógica de estado e side effects | useEducationalContent |
| **Lib/Funções** | Funções utilitárias | getNoteFromPitch, getInterval |
| **Stores** | Zustand state management | preferências salvas |

### 2.2 Testes de Integração

| Escopo | O Que Testa | Exemplos |
|--------|-------------|----------|
| **Componente + Hook** | Integração com hooks customizados | Fretboard + useAudio |
| **Pages + Components** | Renderização de páginas completas | Landing Page |
| **Database + Auth** | Supabase auth + proteção de rotas | Middleware |

### 2.3 Testes E2E (Playwright)

| Escopo | O Que Testa | Exemplos |
|--------|-------------|----------|
| **User Flows** | Fluxos completos do usuário | Login → Dashboard |
| **Checkout** | Fluxo de pagamento Stripe | Seleção → Pagamento |
| **Features** | Funcionalidades completas | Escala → Fretboard → Áudio |

---

## 3. Estrutura de Arquivos

```
src/app-MusicOS/
├── src/
│   ├── __tests__/                    # Tests Unitários
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── InfoButton.test.tsx
│   │   │   │   └── Button.test.tsx
│   │   │   ├── fretboard/
│   │   │   │   └── Fretboard.test.tsx
│   │   │   └── chords/
│   │   │       └── ChordDiagram.test.tsx
│   │   ├── hooks/
│   │   │   └── useEducationalContent.test.ts
│   │   ├── lib/
│   │   │   └── music/
│   │   │       ├── theory.test.ts
│   │   │       └── scales.test.ts
│   │   └── stores/
│   │       └── usePreferencesStore.test.ts
│   │
│   ├── __integration__/              # Tests de Integração
│   │   ├── pages/
│   │   │   ├── home.test.tsx
│   │   │   ├── dashboard.test.tsx
│   │   │   └── pricing.test.tsx
│   │   └── auth/
│   │       └── auth.test.ts
│   │
│   └── e2e/                          # Tests E2E (Playwright)
│       ├── home.spec.ts
│       ├── scales.spec.ts
│       ├── chords.spec.ts
│       ├── checkout.spec.ts
│       └── auth.spec.ts
│
├── vitest.config.ts                  # Configuração Vitest
├── playwright.config.ts              # Configuração Playwright
└── tsconfig.json                     # Paths para @/tests
```

---

## 4. Configuração do Ambiente

### 4.1 Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 4.2 Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4.3 Setup de Testes

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';

// Mock de audio para testes de componentes sonoros
const audioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { setValueAtTime: vi.fn() },
  })),
};

global.AudioContext = vi.fn(() => audioContext) as any;
global.webkitAudioContext = vi.fn(() => audioContext) as any;

// Cleanup após cada teste
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  // Limpar localStorage
  localStorage.clear();
});
```

---

## 5. Testes Unitários — Componentes

### 5.1 InfoButton Test

```typescript
// src/__tests__/components/ui/InfoButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoButton } from '@/components/ui/InfoButton';

describe('InfoButton', () => {
  // TEST: Renderização básica
  it('renderiza o botão de informação', () => {
    render(<InfoButton content="Conteúdo de teste" />);
    
    expect(screen.getByRole('button', { name: /mais informações/i })).toBeInTheDocument();
  });

  // TEST: Popup abre no clique
  it('abre o popup quando clicado', () => {
    render(
      <InfoButton 
        content="Conteúdo de teste" 
        title="Título Teste"
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Título Teste')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo de teste')).toBeInTheDocument();
  });

  // TEST: Popup fecha no clique do X
  it('fecha o popup ao clicar no X', () => {
    render(<InfoButton content="Conteúdo de teste" title="Título" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const closeButton = screen.getByRole('button', { name: /fechar/i });
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Título')).not.toBeInTheDocument();
  });

  // TEST: Renderiza conteúdo com múltiplas linhas
  it('renderiza múltiplas linhas de conteúdo', () => {
    const multiLineContent = `Linha 1
Linha 2
Linha 3`;
    
    render(<InfoButton content={multiLineContent} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Linha 1')).toBeInTheDocument();
    expect(screen.getByText('Linha 2')).toBeInTheDocument();
    expect(screen.getByText('Linha 3')).toBeInTheDocument();
  });

  // TEST: Tamanhos diferentes
  it('renderiza em diferentes tamanhos', () => {
    const { rerender } = render(
      <InfoButton content="Teste" size="sm" />
    );
    expect(screen.getByRole('button')).toHaveClass('w-5');
    
    rerender(<InfoButton content="Teste" size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('w-7');
  });

  // TEST: Posições diferentes
  it('posiciona corretamente em diferentes posições', () => {
    const { container: container1 } = render(
      <InfoButton content="Teste" position="top-right" />
    );
    expect(container1.querySelector('.absolute')).toHaveClass('right-0');
    
    const { container: container2 } = render(
      <InfoButton content="Teste" position="top-left" />
    );
    expect(container2.querySelector('.absolute')).toHaveClass('left-0');
  });
});
```

### 5.2 Fretboard Test

```typescript
// src/__tests__/components/fretboard/Fretboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Fretboard } from '@/components/Fretboard';

describe('Fretboard', () => {
  const defaultProps = {
    instrument: 'guitar' as const,
  };

  // TEST: Renderização básica
  it('renderiza o fretboard com 6 cordas', () => {
    render(<Fretboard {...defaultProps} />);
    
    // 6 linhas de cordas
    expect(screen.getAllByRole('button', { name: /corda/i })).toHaveLength(6);
  });

  // TEST: Casa 0 (corda solta)
  it('mostra indicador de corda solta na casa 0', () => {
    render(<Fretboard {...defaultProps} />);
    
    const openStringIndicators = screen.getAllByText('○');
    expect(openStringIndicators.length).toBeGreaterThan(0);
  });

  // TEST: Destaque de nota
  it('destaca notas da escala fornecida', () => {
    render(
      <Fretboard 
        {...defaultProps}
        scale={{
          root: 'C',
          type: 'maior',
          notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        }}
      />
    );
    
    // Verifica se há elementos vermelhos (root)
    const rootNotes = screen.getAllByText('C');
    expect(rootNotes.length).toBeGreaterThan(0);
  });

  // TEST: Clique em nota chama callback
  it('chama onNoteClick ao clicar em uma nota', () => {
    const handleNoteClick = vi.fn();
    
    render(
      <Fretboard 
        {...defaultProps}
        onNoteClick={handleNoteClick}
      />
    );
    
    const noteButton = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'C' || btn.textContent === 'A'
    );
    
    if (noteButton) {
      fireEvent.click(noteButton);
      expect(handleNoteClick).toHaveBeenCalled();
    }
  });

  // TEST: Interval display
  it('mostra intervalos quando showIntervals é true', () => {
    render(
      <Fretboard 
        {...defaultProps}
        scale={{
          root: 'C',
          type: 'maior',
          notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        }}
        showIntervals
      />
    );
    
    // Verifica se há indicadores de intervalo (R, M2, M3, etc.)
    expect(screen.getAllByText(/[RMP]/)).toBeTruthy();
  });

  // TEST: Ukulele
  it('renderiza ukulele com 4 cordas', () => {
    render(<Fretboard instrument="ukulele" />);
    
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });
});
```

### 5.3 ChordDiagram Test

```typescript
// src/__tests__/components/chords/ChordDiagram.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChordDiagram } from '@/components/ChordDiagram';

describe('ChordDiagram', () => {
  const mockChord = {
    name: 'C',
    root: 'C',
    notes: ['C', 'E', 'G'],
    positions: [-1, 3, 2, 0, 1, 0],  // C na positions: E-A-D-G-B-E
    fingering: [null, 2, 1, 0, 0, null],
  };

  // TEST: Renderização básica
  it('renderiza o nome do acorde', () => {
    render(<ChordDiagram chord={mockChord} />);
    
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  // TEST: Indicadores de corda aberta/morta
  it('mostra círculo para cordas abertas', () => {
    render(<ChordDiagram chord={mockChord} />);
    
    expect(screen.getByText('○')).toBeInTheDocument();
  });

  // TEST: Número da casa
  it('mostra número da casa nos dedos', () => {
    render(<ChordDiagram chord={mockChord} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  // TEST: Notas do acorde
  it('mostra as notas do acorde', () => {
    render(<ChordDiagram chord={mockChord} />);
    
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  // TEST: Clique em casa
  it('chama onFretClick ao clicar em uma casa', () => {
    const handleFretClick = vi.fn();
    
    render(
      <ChordDiagram 
        chord={mockChord}
        onFretClick={handleFretClick}
      />
    );
    
    const fretButton = screen.getByText('3');
    fireEvent.click(fretButton);
    
    expect(handleFretClick).toHaveBeenCalled();
  });

  // TEST: Diferentes tamanhos
  it('renderiza em diferentes tamanhos', () => {
    const { rerender } = render(
      <ChordDiagram chord={mockChord} size="sm" />
    );
    expect(screen.getByText('C').closest('div')).toHaveClass('w-32');
    
    rerender(<ChordDiagram chord={mockChord} size="lg" />);
    expect(screen.getByText('C').closest('div')).toHaveClass('w-64');
  });
});
```

---

## 6. Testes Unitários — Hooks

### 6.1 useEducationalContent Test

```typescript
// src/__tests__/hooks/useEducationalContent.test.ts
import { renderHook } from '@testing-library/react';
import { useEducationalContent } from '@/components/ui/InfoButton';

describe('useEducationalContent', () => {
  it('retorna null para conteúdo inexistente', () => {
    const { result } = renderHook(() => 
      useEducationalContent('conteudo-inexistente')
    );
    
    expect(result.current).toBeNull();
  });

  it('retorna conteúdo para ID válido', () => {
    const { result } = renderHook(() => 
      useEducationalContent('circle-of-fifths')
    );
    
    expect(result.current).not.toBeNull();
    expect(result.current!.title).toBe('O Ciclo de Quintas');
  });

  it('retorna todas as chaves de conteúdo', () => {
    const { result } = renderHook(() => 
      useEducationalContent('scales')
    );
    
    expect(result.current!.title).toBe('Entendendo Escalas');
  });
});
```

---

## 7. Testes Unitários — Lib/Música

### 7.1 Music Theory Engine Tests

```typescript
// src/__tests__/lib/music/theory.test.ts
import { describe, it, expect } from 'vitest';
import { 
  getNoteFromPitch, 
  getInterval, 
  NOTES,
  scaleFormulas,
} from '@/lib/music/theory';

describe('Music Theory Utils', () => {
  describe('getNoteFromPitch', () => {
    it('extrai nota de pitch com oitava', () => {
      expect(getNoteFromPitch('E4')).toBe('E');
      expect(getNoteFromPitch('A2')).toBe('A');
      expect(getNoteFromPitch('C#3')).toBe('C#');
    });

    it('retorna C para pitch inválido', () => {
      expect(getNoteFromPitch('X4')).toBe('C');
    });
  });

  describe('getInterval', () => {
    it('calcula intervalo entre notas', () => {
      expect(getInterval('C', 'G')).toBe(7);  // Quinta perfeita
      expect(getInterval('C', 'E')).toBe(4);  // Terça maior
      expect(getInterval('C', 'C')).toBe(0);  // Uníssono
    });

    it('lida com sustenidos', () => {
      expect(getInterval('C', 'F#')).toBe(6);
    });

    it('calcula intervalos circulares', () => {
      expect(getInterval('G', 'C')).toBe(5);  // Volta para C
    });
  });

  describe('Escalas', () => {
    it('calcula escala maior corretamente', () => {
      const majorScale = getScaleNotes('C', 'maior');
      expect(majorScale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('calcula escala menor corretamente', () => {
      const minorScale = getScaleNotes('A', 'menor');
      expect(minorScale).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });

    it('lida com escalas com sustenidos', () => {
      const scale = getScaleNotes('G', 'maior');
      expect(scale).toContain('F#');
    });
  });

  describe('Acordes', () => {
    it('calcula acorde maior', () => {
      const chord = getChordNotes('C', 'maior');
      expect(chord).toEqual(['C', 'E', 'G']);
    });

    it('calcula acorde menor', () => {
      const chord = getChordNotes('Am', 'menor');
      expect(chord).toEqual(['A', 'C', 'E']);
    });

    it('calcula acorde 7', () => {
      const chord = getChordNotes('G', '7');
      expect(chord).toEqual(['G', 'B', 'D', 'F']);
    });
  });
});
```

---

## 8. Testes de Integração

### 8.1 Landing Page Test

```typescript
// src/__integration__/pages/home.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

describe('Landing Page Integration', () => {
  // TEST: Hero Section renderiza
  it('renderiza a Hero Section com CTA', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/aprenda música/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /começar/i })).toBeInTheDocument();
  });

  // TEST: Features Section
  it('renderiza seção de features', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/teoria musical/i)).toBeInTheDocument();
    expect(screen.getByText(/exercícios/i)).toBeInTheDocument();
  });

  // TEST: Pricing Section
  it('renderiza pricing com opções Free e Pro', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/grátis/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$9,90/i)).toBeInTheDocument();
  });

  // TEST: Scroll suave ancora
  it('implementa scroll suave para seções', () => {
    const { container } = render(<HomePage />);
    
    const anchor = container.querySelector('a[href="#pricing"]');
    expect(anchor).toBeInTheDocument();
  });
});
```

### 8.2 Dashboard Auth Test

```typescript
// src/__integration__/auth/auth.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { createMockRouter } from '@/test/utils/mockRouter';

// Mock do Supabase
vi.mock('@supabase/ssr', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

describe('Authentication Integration', () => {
  it('login com email e senha', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ data: { user: {} } });
    
    // Mock da função de login
    render(<LoginPage onLogin={mockSignIn} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'teste@exemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senha123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'teste@exemplo.com',
        password: 'senha123',
      });
    });
  });
});
```

---

## 9. Testes E2E (Playwright)

### 9.1 User Flow: Login to Dashboard

```typescript
// src/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('fluxo completo de login', async ({ page }) => {
    // 1. Preenche email
    await page.fill('input[name="email"]', 'teste@music-os.com');
    
    // 2. Preenche senha
    await page.fill('input[name="password"]', 'senha123');
    
    // 3. Clica em entrar
    await page.click('button[type="submit"]');
    
    // 4. Verifica redirect para dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // 5. Verifica que está logado
    await expect(page.locator('text=Bem-vindo')).toBeVisible();
  });

  test('login com Google', async ({ page }) => {
    // Clica no botão do Google
    await page.click('button:has-text("Google")');
    
    // Verifica redirect para auth do Google
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });

  test('validação de login inválido', async ({ page }) => {
    await page.fill('input[name="email"]', 'email-invalido');
    await page.fill('input[name="password"]', 'senha-curta');
    await page.click('button[type="submit"]');
    
    // Verifica mensagem de erro
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });
});
```

### 9.2 User Flow: Escala Completa

```typescript
// src/e2e/scales.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Módulo de Escalas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Escalas');
  });

  test('seleciona escala e vê notas destacadas', async ({ page }) => {
    // 1. Seleciona tônica C
    await page.click('button:has-text("C")');
    
    // 2. Seleciona escala Maior
    await page.click('button:has-text("Maior")');
    
    // 3. Verifica que notas aparecem destacadas
    const highlightedNotes = page.locator('.bg-red-500, .bg-blue-500');
    await expect(highlightedNotes.first()).toBeVisible();
    
    // 4. Clica em uma nota
    await highlightedNotes.first().click();
    
    // 5. Verifica que som foi tocado (ouvido ou indicador)
    // O som pode ser verificado via mock ou indicador visual
  });

  test('muda instrumento para ukulele', async ({ page }) => {
    await page.click('text=Ukulele');
    
    // Verifica que fretboard agora tem 4 cordas
    const fretboardStrings = page.locator('[class*="border-slate-600"]');
    await expect(fretboardStrings).toHaveCount(4);
  });

  test('muda para escala menor', async ({ page }) => {
    await page.click('button:has-text("C")');
    await page.click('button:has-text("Menor")');
    
    // Verifica mudança visual (cores diferentes)
    await expect(page.locator('text=Dó menor')).toBeVisible();
  });
});
```

### 9.3 User Flow: Checkout Stripe

```typescript
// src/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('seleciona Pro e vai para checkout', async ({ page }) => {
    // 1. Clica em Assinar Pro
    await page.click('button:has-text("Assinar Pro")');
    
    // 2. Verifica redirect para Stripe
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });

  test('seleciona Lifetime e verifica preço', async ({ page }) => {
    // 1. Clica em Lifetime
    await page.click('button:has-text("Lifetime")');
    
    // 2. Verifica preço correto
    await expect(page.locator('text=R$197')).toBeVisible();
  });
});
```

---

## 10. Cobertura de Testes Recomendada

### 10.1 Targets por Tipo

| Tipo | Target de Cobertura |
|------|-------------------|
| **Unitários** | 80%+ |
| **Integração** | 70%+ |
| **E2E** | Fluxos críticos 100% |
| **Geral** | 75%+ |

### 10.2 Critérios de Qualidade

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CHECKLIST DE QUALIDADE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TESTES UNITÁRIOS                                                   │
│  [ ] InfoButton: 5+ testes                                          │
│  [ ] Fretboard: 8+ testes                                           │
│  [ ] ChordDiagram: 6+ testes                                        │
│  [ ] Music Theory: 15+ testes                                       │
│  [ ] Stores: 5+ testes                                              │
│                                                                     │
│  TESTES DE INTEGRAÇÃO                                               │
│  [ ] Landing Page: 4+ testes                                        │
│  [ ] Auth Flow: 3+ testes                                           │
│  [ ] Dashboard: 5+ testes                                           │
│                                                                     │
│  TESTES E2E                                                         │
│  [ ] Login → Dashboard                                              │
│  [ ] Escala → Fretboard → Play                                      │
│  [ ] Acorde → Diagram → Play                                        │
│  [ ] Pricing → Checkout → Success                                   │
│  [ ] Metrônomo: Start/Stop/BPM                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. Scripts NPM

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run src/__tests__",
    "test:integration": "vitest run src/__integration__",
    "test:e2e": "playwright test src/e2e",
    "test:e2e:ui": "playwright test src/e2e --ui",
    "test:e2e:headed": "playwright test src/e2e --headed",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

---

## 12. CI/CD com Testes

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
        env:
          CI: true

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## 13. Próximos Passos Imediatos

1. **Criar arquivos de configuração** (vitest.config.ts, playwright.config.ts)
2. **Criar diretórios de testes** (src/__tests__, src/__integration__, src/e2e)
3. **Escrever primeiros testes unitários** (InfoButton, Fretboard)
4. **Configurar CI/CD** com GitHub Actions
5. **Executar e validar cobertura**

---

*Documento atualizado em 24 de outubro de 2026*  
*Versão 1.0 — Plano de Testes Completo*