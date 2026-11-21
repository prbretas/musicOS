# Supabase Setup Guide for MusicOS

## Issue INF-005: Setup Supabase Free Tier

### Objetivo
Configurar o Supabase Free Tier para fornecer:
- Autenticação de usuários
- Banco de dados PostgreSQL
- API GraphQL/REST
- Armazenamento de arquivos

### Passos para Configuração

#### 1. Criar Projeto no Supabase
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name:** `music-os` ou `music-os-dev`
   - **Database Password:** Escolha uma senha segura
   - **Region:** Escolha a região mais próxima (ex: `São Paulo` se disponível)
   - **Pricing Plan:** **Free Tier**

#### 2. Obter Credenciais
Após criar o projeto, obtenha:
1. **Project URL:** Vá para Settings → API
2. **anon/public key:** Encontre em Settings → API → Project API keys
3. **service_role key:** (Guarde com segurança, não exponha no frontend)

#### 3. Configurar Variáveis de Ambiente
Atualize o arquivo `.env.local` com:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Stripe (será configurado em issue separada)
STRIPE_SECRET_KEY=sk_test_demo
STRIPE_PUBLISHABLE_KEY=pk_test_demo
STRIPE_WEBHOOK_SECRET=whsec_demo
STRIPE_PRO_MONTHLY_PRICE_ID=price_demo
STRIPE_PRO_LIFETIME_PRICE_ID=price_demo
STRIPE_LIFETIME_PRICE_ID=price_demo

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Configurar Schema do Banco de Dados
Execute o seguinte SQL no SQL Editor do Supabase:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create educational content table
CREATE TABLE IF NOT EXISTS public.educational_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.educational_content(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved scales table
CREATE TABLE IF NOT EXISTS public.saved_scales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  scale_name TEXT NOT NULL,
  root_note TEXT NOT NULL,
  scale_type TEXT NOT NULL,
  notes TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved chords table
CREATE TABLE IF NOT EXISTS public.saved_chords (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  chord_name TEXT NOT NULL,
  root_note TEXT NOT NULL,
  chord_type TEXT NOT NULL,
  notes TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_chords ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for educational_content (read-only for authenticated users)
CREATE POLICY "Authenticated users can view educational content"
  ON public.educational_content
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_scales
CREATE POLICY "Users can view their own saved scales"
  ON public.saved_scales
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved scales"
  ON public.saved_scales
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved scales"
  ON public.saved_scales
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_chords
CREATE POLICY "Users can view their own saved chords"
  ON public.saved_chords
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved chords"
  ON public.saved_chords
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved chords"
  ON public.saved_chords
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_content_updated_at
  BEFORE UPDATE ON public.educational_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample educational content
INSERT INTO public.educational_content (title, content, category, difficulty_level) VALUES
('Introdução às Escalas Musicais', 'As escalas são sequências de notas organizadas em intervalos específicos. A escala maior é a mais comum e serve como base para muitas outras escalas.', 'theory', 'beginner'),
('O Ciclo das Quintas', 'O ciclo das quintas é uma ferramenta fundamental para entender relações entre tonalidades e construir progressões de acordes.', 'theory', 'intermediate'),
('Acordes Básicos para Violão', 'Aprenda os acordes principais (C, G, D, A, E) e suas variações para tocar suas primeiras músicas.', 'guitar', 'beginner'),
('Improvisação com a Escala Pentatônica', 'A escala pentatônica é ideal para iniciantes na improvisação por ter menos notas e evitar dissonâncias.', 'improvisation', 'intermediate'),
('Leitura de Partitura Básica', 'Entenda as claves, compassos, figuras rítmicas e como ler notas na pauta.', 'reading', 'beginner');

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_content_id ON public.user_progress(content_id);
CREATE INDEX idx_saved_scales_user_id ON public.saved_scales(user_id);
CREATE INDEX idx_saved_chords_user_id ON public.saved_chords(user_id);
```

#### 5. Configurar Autenticação
No Supabase Dashboard:
1. Vá para **Authentication → Settings**
2. Configure:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback`
   - **Email confirmations:** Opcional (desative para desenvolvimento)
   - **Enable Magic Link:** Opcional

#### 6. Testar a Conexão
Crie um arquivo de teste para verificar a conexão:

```typescript
// src/lib/supabase/test-connection.ts
import { createClient } from './client';

export async function testSupabaseConnection() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
}
```

#### 7. Adicionar Testes
Crie testes para verificar a configuração:

```typescript
// src/__tests__/supabase/setup.test.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@/lib/supabase/client';

describe('Supabase Setup', () => {
  it('should have environment variables configured', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).not.toBe('https://demo.supabase.co');
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).not.toBe('demo-anon-key');
  });

  it('should be able to create a client', () => {
    const client = createClient();
    expect(client).toBeDefined();
  });
});
```

#### 8. Scripts Úteis
Adicione ao `package.json`:

```json
{
  "scripts": {
    "supabase:test": "tsx src/lib/supabase/test-connection.ts",
    "supabase:seed": "tsx scripts/seed-database.ts"
  }
}
```

### Verificação de Conclusão

Para marcar a issue INF-005 como concluída, verifique:

- [ ] Projeto Supabase criado (Free Tier)
- [ ] Variáveis de ambiente atualizadas no `.env.local`
- [ ] Schema do banco de dados criado
- [ ] RLS policies configuradas
- [ ] Dados de exemplo inseridos
- [ ] Testes de conexão passando
- [ ] Build do Next.js funciona com as novas variáveis

### Troubleshooting

#### Erro: "Missing environment variable"
- Verifique se o arquivo `.env.local` existe na raiz do `app-MusicOS`
- Confirme que as variáveis não têm espaços extras
- Reinicie o servidor de desenvolvimento após alterações

#### Erro: "Invalid API key"
- Verifique se as chaves estão corretas no Supabase Dashboard
- Confirme que está usando a `anon key` no frontend
- Nunca exponha a `service_role key` no frontend

#### Erro: "RLS policy violation"
- Verifique se o usuário está autenticado
- Confirme as políticas RLS no SQL acima
- Teste com um usuário autenticado

### Próximos Passos
Após concluir INF-005, continue com:
1. **CORE-001:** Music Theory Engine
2. **CORE-003:** AudioEngine
3. **TST-001:** Testes Unitários

---

**Última atualização:** 11 de novembro de 2026  
**Status:** Em desenvolvimento