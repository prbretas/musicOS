# MusicOS — Guia de Administração

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Status:** Documentação em Desenvolvimento  
> **Doc Relacionado:** ARCHITECTURE.md, MUSICOS-SPEC.md

---

## 1. Visão Geral do Sistema

### 1.1 Arquitetura Administrativa

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PAINEL DE ADMINISTRAÇÃO                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Usuários      │  │   Assinaturas   │  │   Analytics     │      │
│  │   (CRUD)        │  │   (Gerenciar)   │  │   (Métricas)    │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Exercícios    │  │   Conteúdo      │  │   Configuração  │      │
│  │   (Gerenciar)   │  │   Educacional   │  │   (Sistema)     │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Permissões de Admin

| Nível | Descrição | Acesso |
|-------|-----------|--------|
| **Super Admin** | Acesso total ao sistema | Todos os módulos |
| **Admin** | Gerenciamento de usuários e conteúdo | Usuários, Exercícios, Conteúdo |
| **Suporte** | Apenas visualização e tickets | Analytics limitado |

---

## 2. Gerenciamento de Usuários

### 2.1 Lista de Usuários

Acesse: Admin → Usuários

| Coluna | Descrição |
|--------|-----------|
| **ID** | UUID do usuário no Supabase |
| **Email** | Email de login |
| **Nome** | Nome exibido (se disponível) |
| **Plano** | Free / Pro / Lifetime |
| **Status** | Ativo / Suspenso / Cancelado |
| **Criado em** | Data de registro |
| **Último Login** | Último acesso |

### 2.2 Ações por Usuário

```typescript
// Tipos de ação disponíveis
type UserAction = 
  | 'view'           // Visualizar perfil completo
  | 'edit'           // Editar dados do usuário
  | 'upgrade'        // Fazer upgrade manual para Pro
  | 'suspend'        // Suspender conta temporariamente
  | 'cancel'         // Cancelar assinatura
  | 'impersonate'    // Fazer login como o usuário (debug)
  | 'export'         // Exportar dados do usuário
  | 'delete';        // Excluir conta (irreversível)
```

### 2.3 Alteração de Plano

Para alterar manualmente o plano de um usuário:

1. Acesse Admin → Usuários
2. Selecione o usuário
3. Clique em "Alterar Plano"
4. Selecione: Free / Pro / Lifetime
5. Confirme a alteração

> ⚠️ **Atenção**: Isso altera diretamente no banco de dados. Use apenas quando necessário.

---

## 3. Gestão de Assinaturas

### 3.1 Visualizar Assinaturas

Acesse: Admin → Assinaturas

| Coluna | Descrição |
|--------|-----------|
| **Usuário** | Email do usuário |
| **Plano** | Pro / Lifetime |
| **Status** | Ativa / Past Due / Cancelada |
| **Valor** | R$9,90 ou R$197 |
| **Data Início** | Quando começou |
| **Próximo Cobrança** | Data do próximo ciclo |
| **Stripe ID** | ID no Stripe (para debug) |

### 3.2 Ações de Assinatura

| Ação | Quando Usar |
|------|-------------|
| **Cancelar** | Usuário solicita cancelamento |
| **Reativar** | Usuário quer voltar antes do fim do período |
| **Estornar** | Reembolso de pagamento |
| **Estender Trial** | Adicionar dias de teste |

### 3.3 Fluxo de Cancelamento

```
Usuário solicita cancelamento
          │
          ▼
┌─────────────────────────┐
│ Cancelamento automático │
│ (ao fim do período)     │
└─────────────────────────┘
          │
          ▼
┌─────────────────────────┐
│ Email de confirmação    │
│ de cancelamento         │
└─────────────────────────┘
          │
          ▼
┌─────────────────────────┐
│ 30 dias após:           │
│ - Status: Cancelada     │
│ - Plano: Free           │
│ - Dados: Preservados    │
└─────────────────────────┘
```

---

## 4. Analytics e Métricas

### 4.1 Dashboard de Métricas

Acesse: Admin → Analytics

#### Métricas Principais

| Métrica | Descrição | Meta (mês 1) |
|---------|-----------|--------------|
| **Usuários Totais** | Cadastros acumulados | 1.000 |
| **Usuários Ativos** | MAU (mensal) | 500 |
| **Novos Usuários** | Cadastros no mês | 300 |
| **Taxa de Conversão** | Free → Pro | 5% |
| **Churn** | Cancelamentos/mês | <10% |
| **Exercícios Concluídos** | Total no mês | 5.000 |
| **Tempo Médio de Sessão** | Minutos por sessão | 8 min |

### 4.2 Funsil de Conversão

```
Visitas → Cadastros → Ativação → Primeiro Exercício → Upgrade
   │          │           │              │              │
   ▼          ▼           ▼              ▼              ▼
  100%      40%         60%            50%            5%
```

### 4.3 Relatórios Automáticos

| Relatório | Frequência | Envolvidos |
|-----------|------------|------------|
| **Daily Summary** | Diário | Admin email |
| **Weekly Report** | Segunda-feira | Admin email |
| **Monthly Revenue** | Dia 1 do mês | Admin email |
| **Churn Alert** | Quando churn > 10% | Admin email |

---

## 5. Gerenciamento de Exercícios

### 5.1 Lista de Exercícios

Acesse: Admin → Exercícios

| Coluna | Descrição |
|--------|-----------|
| **ID** | Identificador único |
| **Título** | Nome do exercício |
| **Tipo** | Escala / Acorde / Técnica |
| **Dificuldade** | Iniciante / Intermediário / Avançado |
| **Status** | Ativo / Rascunho / Desativado |
| **Usuários Feitos** | Contagem de conclusões |

### 5.2 Criar Novo Exercício

```
1. Clique em "Novo Exercício"
2. Preencha os campos:
   - Título: "Escala C Maior - Posição 1"
   - Tipo: Escala
   - Dificuldade: Iniciante
   - Tônica: C
   - Escala: Maior
   - BPM Padrão: 60
3. Adicione passos do exercício
4. Configure áudio (opcional)
5. Salve como Rascunho
6. Teste no modo preview
7. Ative quando pronto
```

### 5.3 Estrutura de um Exercício

```typescript
interface Exercise {
  id: string;
  title: string;
  type: 'scale' | 'chord' | 'technique' | 'progression';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Conteúdo
  tonic?: string;           // C, D, E, etc.
  scaleType?: string;       // maior, menor, pentatonic
  steps: ExerciseStep[];
  
  // Configuração
  defaultBpm: number;
  loops: boolean;
  requiresPro: boolean;
  
  // Metadados
  status: 'draft' | 'active' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
}

interface ExerciseStep {
  id: string;
  instruction: string;      // "Toque a escala ascendente"
  type: 'play' | 'practice' | 'rest';
  duration?: number;        // segundos
  notes?: string[];         // notas a tocar
  bpm?: number;             // BPM opcional
  metronomeEnabled: boolean;
}
```

---

## 6. Conteúdo Educacional

### 6.1 InfoButton Content

Acesse: Admin → Conteúdo Educacional → InfoButtons

| Seção | Status | Texto | Última Atualização |
|-------|--------|-------|-------------------|
| Ciclo de Quintas | ✅ Completo | 500 palavras | 24/10/2026 |
| Campo Harmônico | ✅ Completo | 800 palavras | 24/10/2026 |
| Escalas | ✅ Completo | 600 palavras | 24/10/2026 |
| Acordes | 🔵 Em Desenvolvimento | 0 palavras | — |
| Técnicas | 🔵 Em Desenvolvimento | 0 palavras | — |
| Metrônomo | 🔵 Pendente | 0 palavras | — |

### 6.2 Editar Conteúdo

Para editar um InfoButton:

1. Acesse Admin → Conteúdo Educacional
2. Selecione a seção
3. Edite o conteúdo no editor markdown
4. Visualize no preview
5. Salve e publique

#### Estrutura do Conteúdo

```markdown
---
# Estrutura padrão de InfoButton
title: "Nome da Seção"
category: "theory" | "practice" | "technique"

sections:
  - title: "O Que É"
    content: |
      Texto explicativo...
      
  - title: "Como Usar"
    content: |
      Passo a passo...
      
  - title: "Exemplos"
    content: |
      Casos práticos...
      
  - title: "Dicas"
    content: |
      Otimizações e macetes...
---

tags: [escala, teoria, intervalo]
related_exercises: ["EXS-001", "EXS-002"]
```

---

## 7. Configurações do Sistema

### 7.1 Configurações Gerais

Acesse: Admin → Configurações → Geral

| Parâmetro | Valor Padrão | Descrição |
|-----------|--------------|-----------|
| **Nome do App** | MusicOS | Nome exibido |
| **URL Principal** | https://music-os.com | Domínio |
| **Modo Manutenção** | Desligado | Bloqueia acesso de usuários |
| **Versão** | 1.0.0 | Versão atual |

### 7.2 Configurações de Pagamento

Acesse: Admin → Configurações → Pagamentos

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Stripe Mode** | Test / Production | Ambiente de testes |
| **Preço Pro** | R$9,90 | Mensal |
| **Preço Lifetime** | R$197 | Único |
| **Taxa de Teste** | R$1,00 | Para testes |

### 7.3 Configurações de Email

Acesse: Admin → Configurações → Email

| Parâmetro | Valor |
|-----------|-------|
| **Provider** | Resend |
| **Email de Suporte** | suporte@music-os.com |
| **Email de vendas** | vendas@music-os.com |
| **Template Boas-Vindas** | ✅ Configurado |
| **Template Upgrade** | ✅ Configurado |
| **Template Cancelamento** | ✅ Configurado |

---

## 8. Integração com Stripe

### 8.1 Webhooks Monitorados

Acesse: Admin → Integrações → Stripe

| Evento | Descrição | Ação Automática |
|--------|-----------|-----------------|
| `checkout.session.completed` | Pagamento sucesso | Upgrade para Pro |
| `customer.subscription.deleted` | Cancelamento | Downgrade para Free |
| `invoice.payment_failed` | Falha pagamento | Email de alerta |
| `customer.subscription.updated` | Alteração | Atualiza dados |

### 8.2 Teste de Webhook

Para testar webhooks em desenvolvimento:

```bash
# Usar Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 8.3 Regras de Negócio

| Cenário | Ação |
|---------|------|
| Usuário faz checkout → sucesso | Pro por 30 dias |
| Trial de 7 dias (se ativado) | Pro trial, cobra no dia 8 |
| Cancelamento → ativo | Mantém Pro até fim do período |
| Cancelamento → past due | Imediato para Free |

---

## 9. Logs e Debug

### 9.1 Logs de Sistema

Acesse: Admin → Logs

| Tipo | Retention | Descrição |
|------|-----------|-----------|
| **Auth** | 7 dias | Login, logout, errors |
| **Stripe** | 30 dias | Webhooks, payments |
| **Database** | 7 dias | Queries lentas, errors |
| **Audio** | 1 dia | Playback errors |

### 9.2 Debug de Usuário

Para fazer impersonation e debugar:

1. Admin → Usuários
2. Selecione o usuário
3. Clique em "Impersonate"
4. Faça login como o usuário
5. Execute as ações problemáticas
6. Clique em "Sair do Impersonate"

> ⚠️ **Atenção**: Todas as ações são logadas. Use apenas para debug.

### 9.3 Health Check

Endpoints de health check:

| Endpoint | Descrição | Status |
|----------|-----------|--------|
| `GET /api/health` | Health geral | ✅ |
| `GET /api/health/db` | Conexão DB | ✅ |
| `GET /api/health/stripe` | Stripe API | ✅ |
| `GET /api/health/auth` | Auth service | ✅ |

---

## 10. Segurança e Permissões

### 10.1 Roles de Admin

```typescript
// Tipos de roles
type AdminRole = 'super_admin' | 'admin' | 'support';

// Permissões por role
const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ['*'], // Acesso total
  admin: [
    'users:read', 'users:write',
    'subscriptions:read', 'subscriptions:write',
    'exercises:read', 'exercises:write',
    'content:read', 'content:write',
    'analytics:read',
    'settings:read', 'settings:write',
  ],
  support: [
    'users:read',
    'content:read',
    'analytics:read',
  ],
};
```

### 10.2 Audit Log

Todas as ações administrativas são logadas:

| Campo | Descrição |
|-------|-----------|
| **admin_id** | ID do admin que executou |
| **action** | ação executada |
| **target_id** | ID do alvo (usuário, etc.) |
| **details** | Detalhes da ação |
| **timestamp** | Quando ocorreu |
| **ip_address** | IP do admin |

### 10.3 Bloqueio de Usuário

Quando um usuário é bloqueado:

1. JWT do usuário é revogado
2. Todos os refresh tokens são invalidados
3. Usuário é notificado por email
4. Dados são preservados por 30 dias
5. Após 30 dias, dados são anonimizados

---

## 11. Backup e Recuperação

### 11.1 Backup Automático

| Tipo | Frequência | Retention |
|------|------------|-----------|
| Database (Supabase) | Diário | 7 dias |
| Configurações | A cada alteração | Versões infinitas |
| Logs | Horário | 30 dias |

### 11.2 Restore Procedure

```typescript
// Procedimento de restore (pseudo-código)
async function restoreFromBackup(backupId: string) {
  // 1. Baixar backup do Supabase
  const backup = await downloadBackup(backupId);
  
  // 2. Confirmar com admin
  if (!await confirmRestore()) return;
  
  // 3. Parar writes no sistema
  await setMaintenanceMode(true);
  
  // 4. Restore database
  await supabase.restore(backup);
  
  5. Reiniciar sistema
  await setMaintenanceMode(false);
}
```

---

## 12. Troubleshooting Comum

### 12.1 Problemas de Usuário

| Problema | Solução |
|----------|---------|
| "Não consigo fazer login" | Reset password, verificar email |
| "Áudio não funciona" | Verificar permissões navegador |
| "Não vejo exercises" | Verificar tier do usuário |
| "Pagamento falhou" | Verificar cartão, Stripe |

### 12.2 Problemas de Sistema

| Problema | Diagnóstico | Solução |
|----------|-------------|---------|
| "DB lento" | Ver logs de query | Otimizar índices |
| "Webhook falhando" | Ver Stripe dashboard | Corrigir payload |
| "Email não enviado" | Ver logs Resend | Corrigir template |
| "Auth error" | Verificar JWT | Fazer refresh |

### 12.3 Contato de Emergência

| Situação | Contato |
|----------|---------|
| Sistema fora do ar | Supabase Status + PagerDuty |
| Problema de segurança | security@music-os.com |
| Spam/Fraude | abuse@music-os.com |
| Issues técnicos | github.com/music-os/issues |

---

## 13. Comandos CLI de Admin

### 13.1 Disponíveis

```bash
# Gerenciamento de usuários
npm run admin:user:list              # Lista todos os usuários
npm run admin:user:get <email>       # Busca usuário por email
npm run admin:user:upgrade <email>   # Faz upgrade manual
npm run admin:user:suspend <email>   # Suspende usuário

# Gerenciamento de exercícios
npm run admin:exercise:list          # Lista exercícios
npm run admin:exercise:create        # Cria exercício
npm run admin:exercise:activate <id> # Ativa exercício

# Sistema
npm run admin:maintenance:enable    # Ativa modo manutenção
npm run admin:maintenance:disable   # Desativa modo manutenção
npm run admin:backup:create         # Cria backup manual
npm run admin:cache:clear           # Limpa cache
```

---

## 14. Checklist de Boas Práticas

### Diariamente

- [ ] Verificar dashboard de métricas
- [ ] Checar alertas de error (Sentry)
- [ ] Responder tickets de suporte

### Semanalmente

- [ ] Revisar logs de segurança
- [ ] Atualizar conteúdo educacional
- [ ] Analisar taxa de conversão
- [ ] Ajustar exercícios conforme feedback

### Mensalmente

- [ ] Revisar churn e causas
- [ ] Atualizar pricing se necessário
- [ ] Fazer backup completo
- [ ] Revisar permissões de admins

---

## 15. Próximos Passos

1. Configurar Supabase Admin Console
2. Configurar Stripe Dashboard
3. Configurar Resend para emails transacionais
4. Criar primeiros admins do sistema
5. Testar todos os fluxos de admin

---

*Documento atualizado em 24 de outubro de 2026*  
*Versão 1.0 — Guia de Administração*