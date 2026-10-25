# MusicOS — Requisitos Funcionais e Não Funcionais

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Status:** Aprovado  
> **Doc Relacionado:** product.md, tech.md

---

## 1. Requisitos Funcionais (RF)

### 1.1 Sistema de Autenticação (RF-AUTH)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-AUTH-001 | Usuário deve poder criar conta com email e senha | P0 | Free |
| RF-AUTH-002 | Usuário deve poder fazer login com conta Google | P0 | Free |
| RF-AUTH-003 | Usuário deve poder recuperar senha via email | P0 | Free |
| RF-AUTH-004 | Usuário deve poder fazer logout | P0 | Free |
| RF-AUTH-005 | Sistema deve manter sessão ativa (remember me) | P0 | Free |
| RF-AUTH-006 | Sistema deve proteger rotas privadas | P0 | Free |
| RF-AUTH-007 | Usuário Pro deve ter acesso a features exclusivas | P0 | Pro |
| RF-AUTH-008 | Usuário Lifetime deve ter acesso permanente | P0 | Lifetime |

### 1.2 Módulo de Escalas (RF-SCALE)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-SCALE-001 | Usuário deve poder selecionar tônica (C) | P0 | Free |
| RF-SCALE-002 | Usuário deve poder selecionar tônica (G, F, A, E) | P0 | Free |
| RF-SCALE-003 | Usuário deve poder selecionar todas as 12 tônicas | P0 | Pro |
| RF-SCALE-004 | Usuário deve poder selecionar escala Maior | P0 | Free |
| RF-SCALE-005 | Usuário deve poder selecionar escala Menor | P0 | Free |
| RF-SCALE-006 | Usuário deve poder selecionar modos gregos | P0 | Pro |
| RF-SCALE-007 | Usuário deve poder selecionar Pentatônica | P0 | Pro |
| RF-SCALE-008 | Usuário deve poder selecionar Blues | P0 | Pro |
| RF-SCALE-009 | Sistema deve exibir notas da escala | P0 | Free |
| RF-SCALE-010 | Sistema deve destacar notas no fretboard | P0 | Free |
| RF-SCALE-011 | Sistema deve exibir intervalos da escala | P0 | Free |
| RF-SCALE-012 | Sistema deve gerar campo harmônico | P0 | Pro |

### 1.3 Módulo de Acordes (RF-CHORD)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-CHORD-001 | Usuário deve poder selecionar acorde por nome | P0 | Free |
| RF-CHORD-002 | Sistema deve exibir diagrama do acorde | P0 | Free |
| RF-CHORD-003 | Sistema deve mostrar posições dos dedos | P0 | Free |
| RF-CHORD-004 | Usuário deve poder ouvir o acorde | P0 | Free |
| RF-CHORD-005 | Sistema deve exibir campo harmônico | P0 | Pro |
| RF-CHORD-006 | Usuário deve poder ver progressões comuns | P0 | Free |
| RF-CHORD-007 | Sistema deve permitir inversões de acorde | P0 | Pro |
| RF-CHORD-008 | Sistema deve exibir notas do acorde | P0 | Free |

### 1.4 Fretboard Interativo (RF-FRET)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-FRET-001 | Sistema deve exibir fretboard completo | P0 | Free |
| RF-FRET-002 | Sistema deve destacar notas da escala | P0 | Free |
| RF-FRET-003 | Usuário deve poder clicar em notas para ouvir | P0 | Free |
| RF-FRET-004 | Usuário deve poder selecionar instrumento | P0 | Free |
| RF-FRET-005 | Sistema deve suportar Guitarra 6 cordas | P0 | Free |
| RF-FRET-006 | Sistema deve suportar Ukulele | P0 | Pro |
| RF-FRET-007 | Sistema deve suportar Baixo 4 cordas | P0 | Pro |
| RF-FRET-008 | Sistema deve suportar Violão | P0 | Pro |
| RF-FRET-009 | Usuário deve poder mudar afinação | P0 | Pro |
| RF-FRET-010 | Sistema deve exibir número das casas | P0 | Free |
| RF-FRET-011 | Sistema deve exibir marcadores de posição | P0 | Free |

### 1.5 Sistema Educacional (RF-EDU)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-EDU-001 | InfoButton deve explicar Ciclo de Quintas | P0 | Free |
| RF-EDU-002 | InfoButton deve explicar Campo Harmônico | P0 | Free |
| RF-EDU-003 | InfoButton deve explicar Escalas | P0 | Free |
| RF-EDU-004 | InfoButton deve explicar Acordes | P0 | Free |
| RF-EDU-005 | InfoButton deve explicar Técnicas | P0 | Pro |
| RF-EDU-006 | InfoButton deve explicar Metrônomo | P0 | Free |
| RF-EDU-007 | Sistema deve permitir fechar popup | P0 | Free |
| RF-EDU-008 | Sistema deve permitir resize do popup | P0 | Free |

### 1.6 Metrônomo (RF-MET)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-MET-001 | Sistema deve emitir click rítmico | P0 | Free |
| RF-MET-002 | Usuário deve poder ajustar BPM (20-300) | P0 | Free |
| RF-MET-003 | Usuário deve poder iniciar/parar | P0 | Free |
| RF-MET-004 | Sistema deve exibir BPM atual | P0 | Free |
| RF-MET-005 | Sistema deve suportar diferentes time signatures | P0 | Pro |
| RF-MET-006 | Sistema deve ter som configurável | P0 | Free |

### 1.7 Áudio (RF-AUDIO)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-AUDIO-001 | Sistema deve tocar nota ao clicar | P0 | Free |
| RF-AUDIO-002 | Sistema deve tocar acorde ao clicar | P0 | Free |
| RF-AUDIO-003 | Áudio deve ter envelope ADSR configurável | P0 | Free |
| RF-AUDIO-004 | Sistema deve ter volume ajustável | P0 | Free |
| RF-AUDIO-005 | Sistema deve ter diferentes timbres | P0 | Free |
| RF-AUDIO-006 | Áudio deve funcionar offline (cache) | P1 | Free |

### 1.8 Exercícios (RF-EXE)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-EXE-001 | Sistema deve listar exercícios disponíveis | P0 | Free |
| RF-EXE-002 | Usuário deve poder selecionar exercício | P0 | Free |
| RF-EXE-003 | Sistema deve exibir instruções do exercício | P0 | Free |
| RF-EXE-004 | Sistema deve ter metrônomo integrado | P0 | Pro |
| RF-EXE-005 | Sistema deve ter feedback visual | P0 | Pro |
| RF-EXE-006 | Usuário deve poder controlar velocidade | P0 | Pro |
| RF-EXE-007 | Sistema deve gerar exercícios aleatórios | P1 | Pro |
| RF-EXE-008 | Sistema deve salvar progresso | P0 | Free |

### 1.9 Pagamentos (RF-PAY)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-PAY-001 | Usuário deve poder fazer upgrade para Pro | P0 | Free |
| RF-PAY-002 | Usuário deve poder comprar Lifetime | P0 | Free |
| RF-PAY-003 | Sistema deve processar pagamento via Stripe | P0 | Free |
| RF-PAY-004 | Sistema deve enviar email de confirmação | P0 | Free |
| RF-PAY-005 | Sistema deve restaurar compra (multi-device) | P0 | Free |
| RF-PAY-006 | Sistema deve gerenciar cancelamento | P0 | Free |

### 1.10 Preferências do Usuário (RF-PREF)

| ID | Descrição | Prioridade | Tier |
|----|-----------|------------|------|
| RF-PREF-001 | Usuário deve poder escolher instrumento padrão | P0 | Free |
| RF-PREF-002 | Usuário deve poder escolher tema (dark/light) | P0 | Free |
| RF-PREF-003 | Usuário deve poder escolher volume | P0 | Free |
| RF-PREF-004 | Sistema deve salvar preferências | P0 | Free |
| RF-PREF-005 | Sistema deve sincronizar preferências (cloud) | P0 | Pro |

---

## 2. Requisitos Não Funcionais (RNF)

### 2.1 Performance (RNF-PERF)

| ID | Descrição | Meta |
|----|-----------|------|
| RNF-PERF-001 | Tempo de carregamento inicial | < 3 segundos (3G) |
| RNF-PERF-002 | Tempo de renderização de componentes | < 100ms |
| RNF-PERF-003 | Áudio deve responder em | < 50ms |
| RNF-PERF-004 | Metrônomo deve ter precisão de | ±1ms |
| RNF-PERF-005 | Transições de página | < 300ms |
| RNF-PERF-006 | Busca em local DB | < 50ms |

### 2.2 Disponibilidade (RNF-AVAIL)

| ID | Descrição | Meta |
|----|-----------|------|
| RNF-AVAIL-001 | Uptime do serviço | 99.5% |
| RNF-AVAIL-002 | Manutenções programadas | Notificação 24h antes |
| RNF-AVAIL-003 | Fallback offline | Funcionalidades básicas |
| RNF-AVAIL-004 | Recuperação de desastres | RTO < 4h |

### 2.3 Segurança (RNF-SEC)

| ID | Descrição | Meta |
|----|-----------|------|
| RNF-SEC-001 | Dados em trânsito | TLS 1.3 |
| RNF-SEC-002 | Dados em repouso (DB) | Criptografia AES-256 |
| RNF-SEC-003 | Senhashasheadas | bcrypt (cost 12) |
| RNF-SEC-004 | JWT expiration | 7 dias |
| RNF-SEC-005 | Rate limiting | 100 req/min por IP |
| RNF-SEC-006 | CORS configurado | Whitelist only |
| RNF-SEC-007 | Headers de segurança | CSP, X-Frame, HSTS |
| RNF-SEC-008 | Auditoria de logs | 30 dias |

### 2.4 Usabilidade (RNF-USA)

| ID | Descrição | Meta |
|----|-----------|------|
| RNF-USA-001 | Mobile-first design | 60% mobile |
| RNF-USA-002 | WCAG 2.1 AA | Acessibilidade |
| RNF-USA-003 | Suporte a gestos | Swipe, pinch |
| RNF-USA-004 | Loading states | Feedback visual |
| RNF-USA-005 | Error messages | Helpful, acionáveis |
| RNF-USA-006 | Internacionalização | pt-BR (inicial) |

### 2.5 Escala (RNF-SCA)

| ID | Descrição | Meta |
|----|-----------|------|
| RNF-SCA-001 | Usuários concorrentes | 1.000 |
| RNF-SCA-002 | Database queries/segundo | 100 |
| RNF-SCA-003 | Storage por usuário | 50MB |
| RNF-SCA-004 | Bandwidth/usuário/mês | 100MB |

### 2.6 Manutenibilidade (RNF-MAN)

| ID | Descrição | Meta |
|----|-----------|------|
| RNF-MAN-001 | Cobertura de testes unitários | 80% |
| RNF-MAN-002 | Cobertura de testes E2E | Fluxos críticos |
| RNF-MAN-003 | Complexidade ciclomática | < 10 por função |
| RNF-MAN-004 | Documentação de APIs | OpenAPI 3.0 |
| RNF-MAN-005 | Logging estruturado | JSON format |
| RNF-MAN-006 | Monitoring | Datadog/Prometheus |

---

## 3. Requisitos de Dados

### 3.1 Limites de Storage

| Recurso | Free | Pro | Lifetime |
|---------|------|-----|----------|
| **LocalStorage** | 50MB | 50MB | 50MB |
| **Cloud Storage** | 0 | 1GB | 5GB |
| **Exercícios offline** | 5 | 50 | 100 |
| **Progressão de sessão** | Last 7 days | 30 days | Unlimited |

### 3.2 Limites de Features

| Feature | Free | Pro | Lifetime |
|---------|------|-----|----------|
| **Tonalidades** | 5 | 12 | 12 |
| **Instrumentos** | 1 | 4 | 4 |
| **Escalas** | 2 | 20+ | 20+ |
| **Exercícios/dia** | 10 | Unlimited | Unlimited |
| **InfoButtons** | 5 | 20+ | 20+ |

---

## 4. Requisitos de Integração

### 4.1 APIs Externas

| Serviço | Propósito | Tipo |
|---------|-----------|------|
| **Supabase** | Database + Auth | REST API |
| **Stripe** | Pagamentos | REST API + Webhooks |
| **Resend** | Emails transacionais | REST API |
| **PostHog** | Analytics | SDK |

### 4.2 Webhooks

| Evento | Destinatário | Payload |
|--------|--------------|---------|
| `checkout.session.completed` | Backend | Stripe event |
| `customer.subscription.deleted` | Backend | Stripe event |
| `invoice.payment_failed` | Backend + User | Stripe + Email |

---

## 5. Constraints

| ID | Descrição |
|----|-----------||
| CON-001 | Deve funcionar em browsers modernos (Chrome, Firefox, Safari, Edge) |
| CON-002 | Deve funcionar em iOS 14+ e Android 10+ |
| CON-003 | Deve usar Supabase Free Tier (sem custos de DB) |
| CON-004 | Deve usar Vercel Free Tier (sem custos de hosting) |
| CON-005 | Não pode usar WebSockets (limite Free Tier) |
| CON-006 | Deve ser Progressive Web App (PWA) |
| CON-007 | Deve funcionar offline (funcionalidades básicas) |
| CON-008 | Custo mensal máximo: R$4 (domínio) |

---

## 6. Critérios de Aceitação Gerais

### 6.1 Definition of Done (DoD)

- [ ] Código revisado por pares
- [ ] Testes unitários passando (80%+ coverage)
- [ ] Testes de integração passando
- [ ] Testes E2E passando
- [ ] Lint passando
- [ ] Build passando
- [ ] Documentação atualizada
- [ ]部署 verificado em staging
- [ ] Metrics configuradas
- [ ] Rollback plan documentado

---

*Documento aprovado em 24 de outubro de 2026*  
*Versão 1.0*