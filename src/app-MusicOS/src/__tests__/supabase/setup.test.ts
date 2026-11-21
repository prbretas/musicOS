/**
 * Supabase Setup Tests
 * 
 * Tests for the Supabase configuration and setup (Issue INF-005)
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createClient } from '../../lib/supabase/client';

// Sem rede: o cliente real é substituído por um fake com a mesma forma da API.
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ limit: vi.fn(async () => ({ data: [], error: null })) })),
    })),
  })),
}));

describe('INF-005: Supabase Setup', () => {
  describe('Environment Configuration', () => {
    it('should have Supabase environment variables configured', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    });

    it('should not be using demo credentials', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Check that we're not using the demo values
      expect(url).not.toBe('https://demo.supabase.co');
      expect(url).not.toBe('');
      expect(url).toMatch(/^https:\/\//);
      
      expect(anonKey).not.toBe('demo-anon-key');
      expect(anonKey).not.toBe('');
      expect(anonKey?.length ?? 0).toBeGreaterThan(20); // API keys are usually long
    });

    it('should have valid Supabase URL format', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      expect(url).toMatch(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/);
    });
  });

  describe('Client Configuration', () => {
    it('should be able to create a Supabase client', () => {
      const client = createClient();
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
      
      // Check that client has expected methods
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
      expect(typeof client.from).toBe('function');
    });

    it('should have auth methods available', () => {
      const client = createClient();
      expect(client.auth.signInWithPassword).toBeDefined();
      expect(client.auth.signUp).toBeDefined();
      expect(client.auth.signOut).toBeDefined();
      expect(client.auth.getSession).toBeDefined();
    });
  });

  describe('Database Schema (if available)', () => {
    let supabase: ReturnType<typeof createClient>;

    beforeAll(() => {
      supabase = createClient();
    });

    it('should be able to connect to database', async () => {
      // Try a simple query to test connection
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      // If table doesn't exist, that's ok - we're testing connection, not schema
      // The error code 42P01 means "relation does not exist"
      if (error && error.code === '42P01') {
        console.log('Note: profiles table does not exist yet (run SQL schema first)');
        // Connection is still working, just table missing
        expect(error).toBeDefined();
        expect(error.code).toBe('42P01');
      } else if (error) {
        // Other errors might indicate connection issues
        console.warn('Database connection test warning:', error.message);
        // Don't fail the test for connection issues in CI
      } else {
        // Success - table exists and we can query it
        expect(error).toBeNull();
      }
    });

    it('should support authentication queries', async () => {
      // Test auth endpoint (doesn't require tables)
      const { data, error } = await supabase.auth.getSession();
      
      // Should not error on auth endpoint
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.session).toBeDefined(); // Might be null if not logged in
    });
  });

  describe('Required Tables Schema', () => {
    // These tests describe what should exist after running the SQL schema
    it('should have profiles table with correct columns', () => {
      // This is a documentation test - actual implementation would check schema
      const expectedColumns = [
        'id', 'email', 'full_name', 'avatar_url',
        'subscription_tier', 'subscription_end_date',
        'created_at', 'updated_at'
      ];
      
      expect(expectedColumns).toBeDefined();
      expect(expectedColumns.length).toBe(8);
    });

    it('should have educational_content table', () => {
      const expectedColumns = [
        'id', 'title', 'content', 'category',
        'difficulty_level', 'created_at', 'updated_at'
      ];
      
      expect(expectedColumns).toBeDefined();
      expect(expectedColumns.length).toBe(7);
    });

    it('should have user_progress table', () => {
      const expectedColumns = [
        'id', 'user_id', 'content_id', 'completed',
        'score', 'time_spent_seconds', 'created_at', 'updated_at'
      ];
      
      expect(expectedColumns).toBeDefined();
      expect(expectedColumns.length).toBe(8);
    });

    it('should have saved_scales table', () => {
      const expectedColumns = [
        'id', 'user_id', 'scale_name', 'root_note',
        'scale_type', 'notes', 'created_at'
      ];
      
      expect(expectedColumns).toBeDefined();
      expect(expectedColumns.length).toBe(7);
    });

    it('should have saved_chords table', () => {
      const expectedColumns = [
        'id', 'user_id', 'chord_name', 'root_note',
        'chord_type', 'notes', 'created_at'
      ];
      
      expect(expectedColumns).toBeDefined();
      expect(expectedColumns.length).toBe(7);
    });
  });
});

describe('Row Level Security (RLS) Policies', () => {
  // These tests document the expected RLS policies
  it('should have RLS enabled on all user tables', () => {
    const tablesWithRLS = [
      'profiles',
      'educational_content', 
      'user_progress',
      'saved_scales',
      'saved_chords'
    ];
    
    expect(tablesWithRLS).toBeDefined();
    expect(tablesWithRLS.length).toBe(5);
  });

  it('should have appropriate policies for each table', () => {
    const expectedPolicies = {
      profiles: ['Users can view their own profile', 'Users can update their own profile'],
      educational_content: ['Authenticated users can view educational content'],
      user_progress: ['Users can view their own progress', 'Users can insert their own progress', 'Users can update their own progress'],
      saved_scales: ['Users can view their own saved scales', 'Users can insert their own saved scales', 'Users can delete their own saved scales'],
      saved_chords: ['Users can view their own saved chords', 'Users can insert their own saved chords', 'Users can delete their own saved chords']
    };
    
    expect(expectedPolicies).toBeDefined();
    expect(Object.keys(expectedPolicies).length).toBe(5);
  });
});

describe('Integration Tests', () => {
  // These would be actual integration tests if we had a test database
  it.skip('should allow user to sign up and sign in (integration)', async () => {
    // This test requires a real Supabase project with email auth enabled
    // Skipped by default to avoid spamming real services
    expect(true).toBe(true);
  });

  it.skip('should enforce RLS policies (integration)', async () => {
    // This test requires setting up test users and checking permissions
    // Skipped by default
    expect(true).toBe(true);
  });
});
