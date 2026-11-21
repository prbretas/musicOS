/**
 * Test Supabase Connection (JavaScript version)
 * 
 * This script tests the Supabase connection and configuration
 */

require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase Connection...\n');
  
  try {
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('1. Checking environment variables...');
    
    if (!url || !anonKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('   Please add to .env.local:');
      console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
      console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
      return false;
    }
    
    console.log(`   ✅ URL: ${url.substring(0, 40)}...`);
    console.log(`   ✅ Anon Key: ${anonKey.substring(0, 20)}...`);
    
    // Check for demo credentials
    console.log('\n2. Checking for demo credentials...');
    
    if (url === 'https://demo.supabase.co') {
      console.warn('   ⚠️  Using demo Supabase URL');
      console.log('   Update with your real Supabase project URL');
    } else {
      console.log('   ✅ Using custom Supabase URL');
    }
    
    if (anonKey === 'demo-anon-key') {
      console.warn('   ⚠️  Using demo anon key');
      console.log('   Update with your real Supabase anon key');
    } else {
      console.log('   ✅ Using custom anon key');
    }
    
    // Test connection
    console.log('\n3. Testing Supabase connection...');
    
    try {
      // Import CommonJS module
      const { createClient } = require('../src/lib/supabase/client.cjs');
      const supabase = createClient();
      
      // Test auth endpoint
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`   ❌ Connection failed: ${error.message}`);
        console.log('\n   Possible issues:');
        console.log('   - Invalid Supabase credentials');
        console.log('   - Network connectivity issues');
        console.log('   - Supabase project inactive');
        return false;
      }
      
      console.log('   ✅ Successfully connected to Supabase');
      console.log(`   ✅ Session: ${data.session ? 'Active' : 'No active session'}`);
      
      // Test database access (optional)
      console.log('\n4. Testing database access...');
      
      try {
        const { error: dbError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (dbError) {
          if (dbError.code === '42P01') {
            console.log('   ℹ️  Tables not created yet (run SQL schema)');
            console.log('   Check docs/SUPABASE-SETUP.md for SQL schema');
          } else {
            console.log(`   ℹ️  Database error: ${dbError.message}`);
          }
        } else {
          console.log('   ✅ Database access working');
        }
      } catch (dbTestError) {
        console.log(`   ℹ️  Database test skipped: ${dbTestError.message}`);
      }
      
      console.log('\n' + '='.repeat(50));
      console.log('✅ SUPABASE CONNECTION TEST PASSED');
      console.log('='.repeat(50));
      console.log('\nNext steps:');
      console.log('1. Run SQL schema: docs/SUPABASE-SETUP.md');
      console.log('2. Seed database: npm run supabase:seed');
      console.log('3. Run tests: npm test');
      
      return true;
      
    } catch (importError) {
      console.error(`   ❌ Failed to create Supabase client: ${importError.message}`);
      console.log('\n   Make sure:');
      console.log('   - Dependencies are installed: npm install');
      console.log('   - src/lib/supabase/client.ts exists');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run tests
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Check the output above.');
    process.exit(1);
  }
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});