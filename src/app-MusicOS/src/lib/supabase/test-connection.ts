/**
 * Test Supabase Connection
 * 
 * This file provides utilities to test the Supabase connection
 * and database setup.
 */

import { createClient } from './client';

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Test basic Supabase connection and authentication
 */
export async function testSupabaseConnection(): Promise<TestResult> {
  try {
    console.log('Testing Supabase connection...');
    
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !anonKey) {
      return {
        success: false,
        message: 'Missing Supabase environment variables',
        details: {
          url: !!url,
          anonKey: !!anonKey
        }
      };
    }
    
    // Check if using demo values
    if (url === 'https://demo.supabase.co' || anonKey === 'demo-anon-key') {
      return {
        success: false,
        message: 'Using demo Supabase credentials. Please update with real values.',
        details: {
          isDemoUrl: url === 'https://demo.supabase.co',
          isDemoKey: anonKey === 'demo-anon-key'
        }
      };
    }
    
    // Create client
    const supabase = createClient();
    
    // Test authentication health endpoint
    const { data: healthData, error: healthError } = await supabase.auth.getSession();
    
    if (healthError) {
      return {
        success: false,
        message: 'Failed to connect to Supabase Auth',
        details: healthError
      };
    }
    
    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      // If table doesn't exist, that's ok - we can test with auth
      if (error.code === '42P01') { // relation does not exist
        console.log('Profiles table not found (expected if schema not created yet)');
        
        // Test with auth instead
        const { data: authData } = await supabase.auth.getUser();
        
        return {
          success: true,
          message: 'Supabase connection successful (auth only, tables not created)',
          details: {
            auth: authData.user ? 'User available' : 'No user session',
            tables: 'Not created'
          }
        };
      }
      
      return {
        success: false,
        message: 'Database query failed',
        details: error
      };
    }
    
    return {
      success: true,
      message: 'Supabase connection and database access successful',
      details: {
        tableCount: data,
        auth: healthData.session ? 'Session active' : 'No active session'
      }
    };
    
  } catch (error) {
    console.error('Unexpected error testing Supabase:', error);
    
    return {
      success: false,
      message: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Test database schema (check if all required tables exist)
 */
export async function testDatabaseSchema(): Promise<TestResult> {
  try {
    const supabase = createClient();
    const requiredTables = ['profiles', 'educational_content', 'user_progress', 'saved_scales', 'saved_chords'];
    const results: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        results[table] = !error;
      } catch {
        results[table] = false;
      }
    }
    
    const missingTables = Object.entries(results)
      .filter(([, exists]) => !exists)
      .map(([table]) => table);
    
    if (missingTables.length > 0) {
      return {
        success: false,
        message: `Missing database tables: ${missingTables.join(', ')}`,
        details: { tables: results, missing: missingTables }
      };
    }
    
    return {
      success: true,
      message: 'All required database tables exist',
      details: { tables: results }
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to test database schema',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Test authentication flow (sign up, sign in, sign out)
 * Note: Only run this in development with test credentials
 */
export async function testAuthenticationFlow(): Promise<TestResult> {
  try {
    const supabase = createClient();
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test-password-123';
    
    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      return {
        success: false,
        message: 'Sign up failed',
        details: signUpError
      };
    }
    
    // Sign out
    await supabase.auth.signOut();
    
    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      return {
        success: false,
        message: 'Sign in failed',
        details: signInError
      };
    }
    
    // Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return {
        success: false,
        message: 'Failed to get session',
        details: sessionError
      };
    }
    
    // Clean up (sign out)
    await supabase.auth.signOut();
    
    return {
      success: true,
      message: 'Authentication flow test successful',
      details: {
        userCreated: !!signUpData.user,
        userSignedIn: !!signInData.user,
        sessionValid: !!sessionData.session
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Authentication flow test failed',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Run all tests and return combined results
 */
export async function runAllTests(): Promise<{
  connection: TestResult;
  schema: TestResult;
  authentication?: TestResult;
  allPassed: boolean;
}> {
  console.log('Running Supabase setup tests...\n');
  
  const connection = await testSupabaseConnection();
  console.log('Connection test:', connection.message);
  
  const schema = await testDatabaseSchema();
  console.log('Schema test:', schema.message);
  
  // Only run authentication test if connection succeeded
  let authentication: TestResult | undefined;
  if (connection.success) {
    authentication = await testAuthenticationFlow();
    console.log('Authentication test:', authentication.message);
  } else {
    console.log('Skipping authentication test due to connection failure');
  }
  
  const allPassed = connection.success && schema.success && (!authentication || authentication.success);
  
  console.log(`\nAll tests passed: ${allPassed ? '✅' : '❌'}`);
  
  return {
    connection,
    schema,
    authentication,
    allPassed
  };
}

// If this file is run directly (not imported)
if (typeof window === 'undefined' && process.argv[1] === __filename) {
  runAllTests().then(results => {
    if (results.allPassed) {
      console.log('\n🎉 All Supabase tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Check the details above.');
      process.exit(1);
    }
  });
}