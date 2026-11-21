/**
 * Script para criar usuários de teste no Supabase
 * Execute APÓS configurar Supabase real
 */

require('dotenv').config({ path: './src/app-MusicOS/.env.local' });

async function criarUsuariosTeste() {
  console.log('👤 Criando usuários de teste para MusicOS...\n');
  
  try {
    // Verificar se está usando credenciais demo
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !anonKey) {
      console.error('❌ Credenciais do Supabase não encontradas');
      console.log('Execute scripts/setup-completo.bat primeiro');
      process.exit(1);
    }
    
    if (url === 'https://demo.supabase.co' || anonKey === 'demo-anon-key') {
      console.log('⚠️  Usando credenciais DEMO do Supabase');
      console.log('Para criar usuários reais, configure Supabase real primeiro.');
      console.log('\nExecute: scripts/setup-completo.bat (opção 2)');
      console.log('OU configure manualmente:');
      console.log('1. Acesse https://app.supabase.com');
      console.log('2. Crie projeto Free Tier');
      console.log('3. Atualize .env.local com suas credenciais');
      console.log('4. Execute SQL schema de docs/SUPABASE-SETUP.md');
      console.log('5. Execute este script novamente');
      process.exit(0);
    }
    
    // Importar cliente Supabase
    const { createClient } = require('./src/app-MusicOS/src/lib/supabase/client.cjs');
    const supabase = createClient();
    
    console.log('🔗 Conectando ao Supabase...');
    
    // Testar conexão
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro de conexão:', sessionError.message);
      console.log('\nVerifique:');
      console.log('1. Credenciais corretas em .env.local');
      console.log('2. Projeto Supabase ativo');
      console.log('3. Conexão de internet');
      process.exit(1);
    }
    
    console.log('✅ Conectado ao Supabase\n');
    
    // Lista de usuários de teste para criar
    const usuariosTeste = [
      {
        email: 'teste@music.com',
        password: 'teste123',
        nome: 'Usuário Teste',
        tipo: 'free'
      },
      {
        email: 'aluno@music.com',
        password: 'aluno123',
        nome: 'Aluno Iniciante',
        tipo: 'free'
      },
      {
        email: 'pro@music.com',
        password: 'pro123',
        nome: 'Músico Pro',
        tipo: 'pro'
      }
    ];
    
    console.log('📝 Criando usuários de teste...\n');
    
    let criados = 0;
    let falhas = 0;
    
    for (const usuario of usuariosTeste) {
      try {
        console.log(`Tentando criar: ${usuario.email}...`);
        
        // Tentar criar usuário
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: usuario.email,
          password: usuario.password,
        });
        
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            console.log(`   ℹ️  Usuário ${usuario.email} já existe`);
            
            // Tentar login para verificar
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: usuario.email,
              password: usuario.password,
            });
            
            if (loginError) {
              console.log(`   ⚠️  Senha pode estar diferente. Use: ${usuario.password}`);
              falhas++;
            } else {
              console.log(`   ✅ Usuário existe e senha correta`);
              criados++;
            }
          } else {
            console.log(`   ❌ Erro: ${signUpError.message}`);
            falhas++;
          }
        } else {
          console.log(`   ✅ Criado: ${usuario.email} (senha: ${usuario.password})`);
          criados++;
          
          // Atualizar perfil se usuário foi criado
          if (signUpData.user) {
            await supabase
              .from('profiles')
              .upsert({
                id: signUpData.user.id,
                email: usuario.email,
                full_name: usuario.nome,
                subscription_tier: usuario.tipo
              });
          }
        }
        
        // Fazer logout para próxima criação
        await supabase.auth.signOut();
        
      } catch (error) {
        console.log(`   ❌ Erro inesperado: ${error.message}`);
        falhas++;
      }
      
      console.log(); // Linha em branco
    }
    
    // Resumo
    console.log('='.repeat(50));
    console.log('📊 RESUMO DA CRIAÇÃO DE USUÁRIOS');
    console.log('='.repeat(50));
    console.log(`✅ Criados/verificados: ${criados}`);
    console.log(`❌ Falhas: ${falhas}`);
    console.log(`📋 Total: ${usuariosTeste.length}`);
    console.log();
    
    if (criados > 0) {
      console.log('🎉 USUÁRIOS DE TESTE PRONTOS!');
      console.log();
      console.log('📋 CREDENCIAIS PARA LOGIN:');
      console.log('='.repeat(30));
      usuariosTeste.forEach(usuario => {
        console.log(`Email: ${usuario.email}`);
        console.log(`Senha: ${usuario.password}`);
        console.log(`Tipo: ${usuario.tipo}`);
        console.log('-'.repeat(30));
      });
      
      console.log();
      console.log('🚀 PRÓXIMOS PASSOS:');
      console.log('1. Acesse: http://localhost:3000/login');
      console.log('2. Use qualquer credencial acima');
      console.log('3. Explore o dashboard');
      console.log();
      console.log('⚠️  NOTA: Se usar "pro@music.com", terá acesso a features Pro');
    } else {
      console.log('❌ Nenhum usuário foi criado/verificado.');
      console.log();
      console.log('🔧 TROUBLESHOOTING:');
      console.log('1. Verifique se o SQL schema foi executado no Supabase');
      console.log('2. Confirme credenciais em .env.local');
      console.log('3. Verifique se o projeto Supabase está ativo');
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    console.log();
    console.log('📋 Para suporte:');
    console.log('1. Execute: scripts/setup-completo.bat');
    console.log('2. Ou siga INSTALL-SUPABASE.md');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarUsuariosTeste();
}

module.exports = { criarUsuariosTeste };