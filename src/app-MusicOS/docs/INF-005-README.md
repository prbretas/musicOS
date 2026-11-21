# INF-005: Setup Supabase Free Tier

## Status: 🟡 In Progress

## Descrição
Configurar o Supabase Free Tier para fornecer autenticação, banco de dados PostgreSQL, API GraphQL/REST e armazenamento de arquivos para o MusicOS.

## Critérios de Aceitação
- [ ] Projeto Supabase criado (Free Tier)
- [ ] Variáveis de ambiente configuradas
- [ ] Schema do banco de dados criado
- [ ] RLS policies configuradas
- [ ] Dados de exemplo inseridos
- [ ] Testes de conexão implementados
- [ ] Scripts de seed e teste disponíveis

## Progresso

### ✅ Concluído
1. **Documentação completa** criada em `docs/SUPABASE-SETUP.md`
2. **Testes de conexão** implementados em `src/lib/supabase/test-connection.ts`
3. **Script de seed** criado em `scripts/seed-database.ts`
4. **Testes unitários** criados em `src/__tests__/supabase/setup.test.ts`
5. **Scripts npm** adicionados ao `package.json`:
   - `npm run supabase:test` - Testa conexão
   - `npm run supabase:seed` - Popula banco com dados exemplo
   - `npm run supabase:setup` - Executa ambos

### 🔄 Pendente (Ação do Usuário)
1. **Criar projeto no Supabase:**
   - Acesse [https://app.supabase.com](https://app.supabase.com)
   - Crie novo projeto "music-os" no Free Tier
   - Obtenha URL e chaves de API

2. **Configurar variáveis de ambiente:**
   - Atualize `.env.local` com as credenciais reais
   - Não use valores de demonstração

3. **Executar schema SQL:**
   - Copie SQL de `docs/SUPABASE-SETUP.md`
   - Execute no SQL Editor do Supabase

4. **Testar configuração:**
   ```bash
   npm run supabase:setup
   npm test -- setup.test.ts
   ```

## Instruções para Completar

### Passo 1: Criar Projeto Supabase
1. Acesse https://app.supabase.com
2. Clique em "New Project"
3. Preencha:
   - **Name:** `music-os-dev` (sugestão)
   - **Database Password:** Escolha senha segura
   - **Region:** Escolha mais próxima (ex: São Paulo)
   - **Pricing:** Free Tier

### Passo 2: Obter Credenciais
Após criação:
1. Vá para **Settings → API**
2. Anote:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon/public key** (chave longa)
   - **service_role key** (mantenha segura)

### Passo 3: Configurar Environment
Edite `src/app-MusicOS/.env.local`:

```bash
# Substitua com suas credenciais
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Stripe (manter demo por enquanto)
STRIPE_SECRET_KEY=sk_test_demo
STRIPE_PUBLISHABLE_KEY=pk_test_demo
STRIPE_WEBHOOK_SECRET=whsec_demo
STRIPE_PRO_MONTHLY_PRICE_ID=price_demo
STRIPE_PRO_LIFETIME_PRICE_ID=price_demo
STRIPE_LIFETIME_PRICE_ID=price_demo

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Passo 4: Executar Schema SQL
1. No Supabase Dashboard, vá para **SQL Editor**
2. Copie todo o SQL de `docs/SUPABASE-SETUP.md` (seção 4)
3. Execute o SQL
4. Verifique se as tabelas foram criadas

### Passo 5: Testar
```bash
cd src/app-MusicOS
npm install
npm run supabase:test  # Testar conexão
npm run supabase:seed  # Popular dados
npm test -- setup.test.ts  # Rodar testes
```

## Estrutura Criada

### Arquivos de Código
```
src/lib/supabase/
├── client.ts              # Cliente frontend
├── server.ts              # Cliente servidor
├── index.ts              # Exports
└── test-connection.ts    # Testes de conexão

scripts/
└── seed-database.ts      # População de dados

src/__tests__/supabase/
└── setup.test.ts         # Testes unitários

docs/
├── SUPABASE-SETUP.md     # Guia completo
└── INF-005-README.md     # Este arquivo
```

### Schema do Banco
- **profiles:** Dados de usuário
- **educational_content:** Conteúdo educacional
- **user_progress:** Progresso do usuário
- **saved_scales:** Escalas salvas
- **saved_chords:** Acordes salvos

## Testes Implementados

### Testes Unitários
1. **Environment Configuration:** Verifica variáveis
2. **Client Configuration:** Testa criação de cliente
3. **Database Schema:** Verifica estrutura esperada
4. **RLS Policies:** Documenta políticas de segurança

### Testes de Integração
1. **Conexão Supabase:** Testa comunicação
2. **Autenticação:** Testa fluxo auth (com credenciais reais)
3. **Database Access:** Testa queries básicas

## Troubleshooting

### Erro: "Missing environment variable"
```bash
# Verificar variáveis
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Reiniciar servidor
npm run dev
```

### Erro: "Invalid API key"
- Verifique se copiou a chave correta
- Confirme no Supabase Dashboard → Settings → API
- Não use a `service_role key` no frontend

### Erro: "Relation does not exist"
- Execute o schema SQL no Supabase
- Verifique se tabelas foram criadas
- Consulte `docs/SUPABASE-SETUP.md` seção 4

## Próximos Passos

Após concluir INF-005:

1. **CORE-001:** Music Theory Engine (P0)
2. **CORE-003:** AudioEngine (P0) 
3. **TST-001:** Testes Unitários (P0)

## Referências

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Responsável:** Desenvolvedor  
**Data de Início:** 11/11/2026  
**Estimativa:** 1-2 dias (S - Small)  
**Dependências:** Nenhuma