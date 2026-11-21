/**
 * Database Seeding Script for MusicOS (JavaScript version)
 * 
 * This script seeds the Supabase database with sample data
 * for development and testing purposes.
 */

require('dotenv').config({ path: '.env.local' });

async function seedDatabase() {
  console.log('🎵 Starting MusicOS database seeding...\n');
  
  try {
    // Import CommonJS module
    const { createClient } = require('../src/lib/supabase/client.cjs');
    
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !anonKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('Please check your .env.local file');
      process.exit(1);
    }
    
    if (url === 'https://demo.supabase.co' || anonKey === 'demo-anon-key') {
      console.warn('⚠️  Using demo Supabase credentials');
      console.log('Update .env.local with real Supabase credentials');
    }
    
    // Create client
    const supabase = createClient();
    
    // Check connection
    const { data: healthData, error: healthError } = await supabase.auth.getSession();
    
    if (healthError) {
      console.error('❌ Failed to connect to Supabase:', healthError.message);
      console.log('\nPossible issues:');
      console.log('1. Invalid Supabase credentials in .env.local');
      console.log('2. Network connection issues');
      console.log('3. Supabase project not created');
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase\n');
    
    // Sample educational content
    const educationalContent = [
      {
        title: 'Introdução às Escalas Musicais',
        content: 'As escalas são sequências de notas organizadas em intervalos específicos. A escala maior é a mais comum e serve como base para muitas outras escalas.',
        category: 'theory',
        difficulty_level: 'beginner'
      },
      {
        title: 'O Ciclo das Quintas',
        content: 'O ciclo das quintas é uma ferramenta fundamental para entender relações entre tonalidades e construir progressões de acordes.',
        category: 'theory',
        difficulty_level: 'intermediate'
      },
      {
        title: 'Acordes Básicos para Violão',
        content: 'Aprenda os acordes principais (C, G, D, A, E) e suas variações para tocar suas primeiras músicas.',
        category: 'guitar',
        difficulty_level: 'beginner'
      }
    ];
    
    // Seed educational content
    console.log('📚 Seeding educational content...');
    let seededCount = 0;
    
    for (const content of educationalContent) {
      try {
        const { error } = await supabase
          .from('educational_content')
          .upsert(content, { onConflict: 'title' });
        
        if (error) {
          if (error.code === '42P01') {
            console.log(`ℹ️  Table doesn't exist yet. Run SQL schema first.`);
            break;
          }
          console.error(`❌ Failed to seed "${content.title}":`, error.message);
        } else {
          console.log(`✅ Added: ${content.title}`);
          seededCount++;
        }
      } catch (error) {
        console.error(`❌ Error seeding "${content.title}":`, error.message);
      }
    }
    
    // Check if tables exist
    console.log('\n🔍 Checking database tables...');
    
    const tablesToCheck = ['profiles', 'educational_content', 'user_progress'];
    
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          if (error.code === '42P01') {
            console.log(`❌ Table "${table}" doesn't exist`);
          } else {
            console.log(`⚠️  Error checking "${table}":`, error.message);
          }
        } else {
          console.log(`✅ Table "${table}" exists`);
        }
      } catch (error) {
        console.log(`⚠️  Could not check "${table}":`, error.message);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Educational content seeded: ${seededCount}/${educationalContent.length}`);
    console.log(`Using Supabase URL: ${url.substring(0, 30)}...`);
    
    if (seededCount === 0) {
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Create Supabase project at https://app.supabase.com');
      console.log('2. Update .env.local with real credentials');
      console.log('3. Run SQL schema from docs/SUPABASE-SETUP.md');
      console.log('4. Run this script again');
    } else {
      console.log('\n✅ Seeding completed successfully!');
      console.log('\nYou can now:');
      console.log('1. Run tests: npm test');
      console.log('2. Start dev server: npm run dev');
      console.log('3. Check Supabase dashboard for data');
    }
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure .env.local exists in src/app-MusicOS/');
    console.log('2. Check Supabase credentials are correct');
    console.log('3. Verify internet connection');
    console.log('4. Ensure Supabase project is active');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };