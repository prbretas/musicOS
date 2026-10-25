# MusicOS — Análise Financeira e Precificação

> **Versão:** 1.1 (Atualizado com decisões de custo)  
> **Data:** 23 de outubro de 2026  
> **Status:** Aprovado com ressalvas  
> **Doc Relacionado:** ARCHITECTURE.md, COMPETITIVE.md

---

## 1. Decisões de Custo Confirmadas

| Decisão | Status | Observação |
|---------|--------|------------|
| **AI Assistant** | ❌ Adiado | Deixar para fase posterior (usar Ollama no futuro) |
| **Upload de Áudio** | ❌ Limitado | Sem armazenamento cloud; LocalStorage apenas |
| **Auth** | ⏳ Pendente | Free tier vs pago (ver seção 2.3) |
| **Preço Pro** | ✅ R$9,90/mês | Preço acessível validado |
| **Preço Lifetime** | ✅ R$197 | 20x mensalidade |
| **N8N** | ⏳ Pendente | Self-hosted no início |

---

## 2. Custos de Infraestrutura

### 2.1 Custos Ativos (MVP Inicial)

| Serviço | Provider | Plano | Custo USD | Custo BRL | Status |
|---------|----------|-------|-----------|-----------|--------|
| **Domínio** | Namecheap | .app | $4/ano | R$50/ano | ✅ Necessário |
| **Hosting** | Vercel | Free | $0 | R$0 | ✅ Suficiente para MVP |
| **Database + Auth** | Supabase | Free? | $0 | R$0 | ⏳ Ver seção 2.3 |
| **Email** | Resend | Free tier | $0 | R$0 | ✅ 3.000 msgs/mês |
| **Monitoring** | Sentry | Free | $0 | R$0 | ✅ 5K errors/mês |
| **Analytics** | PostHog | Free | $0 | R$0 | ✅ 1M events/mês |

| | **TOTAL MENSAL** | **$0** | **R$0** |

**Cenário otimizado:** MVP com R$0 de custos fixos mensais!

### 2.2 Custos Variáveis (Por Usuário)

| Serviço | Custo Unitário | Aplicação |
|---------|----------------|-----------|
| **Stripe** | 2.9% + R$0,80 | Por transação de pagamento |
| **Armazenamento** | R$0 | LocalStorage do browser |
| **AI** | R$0 | Adiado para fase posterior |

### 2.3 Supabase: Free Tier vs Pro

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE: COMPARATIVO FREE vs PRO                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FREE TIER (Free Forever)                                           │
│  ├── Database:              500MB                                   │
│  ├── Auth:                  50.000 MAU                              │
│  ├── Storage:               1GB                                     │
│  ├── Edge Functions:        500K invocations                        │
│  ├── Realtime:              2M messages                             │
│  └── Row Level Security:    ✅ Incluso                              │
│                                                                     │
│  PRO PLAN ($25/mês)                                                 │
│  ├── Database:              8GB (+15.5GB)                           │
│  ├── Auth:                  250K MAU (+200K)                        │
│  ├── Storage:               1TB (+999GB)                            │
│  ├── Edge Functions:        2M invocations                          │
│  └── Suporte:               Prioritário                             │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  RECOMENDAÇÃO INICIAL:                                              │
│  Start com FREE TIER → Migrar para PRO quando:                      │
│  • DB > 500MB                                                       │
│  • Auth > 50.000 usuários ativos                                    │
│  • Precisar de mais storage                                         │
│                                                                     │
│  ESTIMATIVA DE CRESCIMENTO:                                         │
│  └── Supabase Pro necessário em ~12-18 meses                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Análise de Precificação

### 3.1 Benchmark de Mercado

| App | Preço BRL/mês | Observação |
|-----|---------------|------------|
| **Yousician** | R$89,90 | Gamificação |
| **Fender Songs** | R$29,90 | Letras + cifras |
| **Ultimate Guitar** | R$89,90/ano | Base de cifras |
| **MusicOS** | **R$9,90** | All-in-one acessível |

### 3.2 Precificação Aprovada

| Tier | Preço | Período | Lucro/Líquido |
|------|-------|---------|---------------|
| **Free** | R$0 | Forever | R$0 |
| **Pro** | **R$9,90** | Mês | ~R$7,50 |
| **Lifetime** | **R$197** | Único | ~R$164 |

### 3.3 Cálculo de Lucro (R$9,90)

```
Receita Bruta:              R$9,90
                           ──────────
Stripe (2.9%):              -R$0,29
Stripe (R$0,80):            -R$0,80
                           ──────────
LUCRO LÍQUIDO:              R$7,81

MARGEM: 79%
```

---

## 4. Estratégia de Custos Zero (MVP)

### 4.1 Stack Gratuito Inicial

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MVP COM CUSTO ZERO                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FRONTEND                                                           │
│  └── Vercel Free: Hosting, CI/CD, SSL                              │
│      ✅足够 para 100GB bandwidth/mês                                │
│                                                                     │
│  DATABASE + AUTH                                                    │
│  └── Supabase Free: 500MB DB, 50K auth                              │
│      ✅足够 para 10.000-50.000 usuários                             │
│                                                                     │
│  AUTOMATION                                                         │
│  └── N8N Self-hosted (VPS $5-10/mês) OU                            │
│      Verificar se CI/CD do GitHub Actions cobre necessidades?       │
│      → Decisão pendente                                             │
│                                                                     │
│  DOMÍNIO                                                            │
│  └── Namecheap .app: R$50/ano                                       │
│      ✅ Necessário                                                  │
│                                                                     │
│  EMAIL                                                              │
│  └── Resend Free: 3.000 msgs/mês                                    │
│      ✅足够 para MVP                                                │
│                                                                     │
│  ANALYTICS                                                          │
│  └── PostHog Free: 1M events/mês                                    │
│      ✅足够 para MVP                                                │
│                                                                     │
│  MONITORING                                                         │
│  └── Sentry Free: 5K errors/mês                                     │
│      ✅足够 para MVP                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Custos Futuros (Quando Crescer)

| Quando | Upgrade | Custo Mensal |
|--------|---------|--------------|
| >50.000 usuários | Supabase Pro | R$145 |
| >100GB bandwidth | Vercel Pro | R$115 |
| >100GB storage | Supabase Pro | Já incluso |
| >500 usuários Pro | N8N Cloud | R$115 |

---

## 5. Projeções de Receita (MVP com Custo Zero)

### 5.1 Custos Fixos Mensais (Inicial)

| Item | Custo |
|------|-------|
| Domínio (prorrateado) | R$4/mês |
| **Total** | **R$4/mês** |

### 5.2 Cenário Conservador (R$9,90)

| Mês | Usuários Pro | MRR | Custos | Lucro/Liquid |
|-----|--------------|-----|--------|--------------|
| 1 | 10 | R$99 | R$4 | R$95 |
| 3 | 60 | R$594 | R$4 | R$590 |
| 6 | 200 | R$1.980 | R$4 | R$1.976 |
| 12 | 600 | R$5.940 | R$50 | R$5.890 |

### 5.3 Break-Even Point

```
Custos Fixos Mensais:       R$4
Lucro por Usuário Pro:      R$7,81

Break-Even Point:           4 ÷ 7,81 = **1 usuário Pro/mês**

OU SEJA: PRATICAMENTE INSTANTÂNEO!
```

---

## 6. Storage: LocalStorage Strategy

### 6.1 O Que Armazenar no LocalStorage

| Dado | Limite | Justificativa |
|------|--------|---------------|
| **Preferências do usuário** | ~10KB | Tema, instrumento, tuning |
| **Último arquivo de áudio** | ~50MB | Prática de música (1 arquivo) |
| **Favoritos/salvos** | ~100KB | Escalas e acordes salvos |
| **Progresso local** | ~50KB | Dados de progresso |

### 6.2 O Que NÃO Armazenar

| Dado | Razão |
|------|-------|
| Uploads de múltiplos áudios | Consumiria storage rapidamente |
| Backups de usuários | Não é necessário para MVP |
| Imagens/fotos | Não faz parte do core |

### 6.3 Gerenciamento de Storage

```typescript
// lib/storage-manager.ts

const LOCALSTORAGE_LIMIT = 50 * 1024 * 1024; // 50MB

export function saveToLocalStorage(key: string, data: any): void {
  try {
    const serialized = JSON.stringify(data);
    const currentSize = getUsedStorage();
    
    if (currentSize + serialized.length > LOCALSTORAGE_LIMIT) {
      // Limpar dados antigos ou alertar usuário
      cleanupOldestData();
    }
    
    localStorage.setItem(key, serialized);
  } catch (e) {
    // Storage cheio - alertar usuário
    showStorageFullAlert();
  }
}

export function saveAudioFile(file: File): void {
  // Salvar apenas 1 arquivo de áudio por vez
  const reader = new FileReader();
  reader.onload = () => {
    // Converter para base64 e salvar
    localStorage.setItem('last_audio_file', reader.result as string);
  };
  reader.readAsDataURL(file);
}
```

---

## 7. Resumo: Custos por Fase

| Fase | Custos Mensais | Quando Ativar |
|------|----------------|---------------|
| **MVP (Fase 1)** | R$4 (domínio) | Day 1 |
| **Growth (Fase 2)** | R$115 (Vercel Pro) | >100GB bandwidth |
| **Scale (Fase 3)** | R$260 (Vercel + Supabase Pro + N8N Cloud) | >50K usuários |

---

## 8. Recomendações Finais

### 8.1 Decisões Aprovadas

| Decisão | Valor |
|---------|-------|
| **Preço Pro** | R$9,90/mês |
| **Preço Lifetime** | R$197 |
| **AI Assistant** | Adiado (Ollama no futuro) |
| **Storage** | LocalStorage apenas (sem cloud) |
| **Supabase** | Free tier inicial |

### 8.2 Pendências a Decidir

| Item | Pergunta |
|------|----------|
| **N8N** | Self-hosted ($5-10 VPS) ou usar GitHub Actions + webhooks manuais? |

---

## 9. Appendix: Stack de Custo Zero Completo

| Serviço | Provider | Plano Gratuito | Limite |
|---------|----------|----------------|--------|
| **Frontend** | Vercel | Free | 100GB bandwidth |
| **Database** | Supabase | Free | 500MB DB, 50K auth |
| **Auth** | Supabase | Free | Incluso no DB |
| **Domain** | Namecheap | Pago | $4/ano |
| **Email** | Resend | Free | 3.000 msgs/mês |
| **Analytics** | PostHog | Free | 1M events/mês |
| **Monitoring** | Sentry | Free | 5K errors/mês |
| **CI/CD** | GitHub Actions | Free | 2.000 min/mês |
| **Automation** | ? | ? | Decidir |

---

*Documento atualizado em 23 de outubro de 2026*  
*Versão 1.1 — Decisões de custo aplicadas*