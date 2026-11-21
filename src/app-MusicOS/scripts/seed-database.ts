#!/usr/bin/env tsx
/**
 * Database Seeding Script for MusicOS
 * 
 * This script seeds the Supabase database with sample data
 * for development and testing purposes.
 */

import { createClient } from '../src/lib/supabase/server';

interface SeedData {
  educationalContent: Array<{
    title: string;
    content: string;
    category: string;
    difficulty_level: string;
  }>;
  sampleScales: Array<{
    scale_name: string;
    root_note: string;
    scale_type: string;
    notes: string[];
  }>;
  sampleChords: Array<{
    chord_name: string;
    root_note: string;
    chord_type: string;
    notes: string[];
  }>;
}

const SEED_DATA: SeedData = {
  educationalContent: [
    {
      title: 'Introdução às Escalas Musicais',
      content: `# Introdução às Escalas Musicais

As escalas são sequências de notas organizadas em intervalos específicos. Elas formam a base da teoria musical e são essenciais para:
- Compor melodias
- Improvisar solos
- Entender harmonia
- Tocar qualquer instrumento

## Escala Maior
A escala maior é a mais comum e serve como base para muitas outras escalas.

**Fórmula:** T - T - S - T - T - T - S
(T = Tom inteiro, S = Semitom)

Exemplo em Dó maior: C - D - E - F - G - A - B - C`,
      category: 'theory',
      difficulty_level: 'beginner'
    },
    {
      title: 'O Ciclo das Quintas',
      content: `# O Ciclo das Quintas

O ciclo das quintas é uma ferramenta fundamental para:
- Entender relações entre tonalidades
- Construir progressões de acordes
- Identificar escalas relativas
- Transpor músicas

## Como Funciona
O ciclo organiza as 12 tonalidades em quintas perfeitas:
C → G → D → A → E → B → F#/Gb → Db → Ab → Eb → Bb → F → C

## Aplicações Práticas
1. **Determinar acordes principais** de uma tonalidade
2. **Encontrar escalas relativas** (maior/menor)
3. **Modulação** entre tonalidades
4. **Compor progressões** harmoniosas`,
      category: 'theory',
      difficulty_level: 'intermediate'
    },
    {
      title: 'Acordes Básicos para Violão',
      content: `# Acordes Básicos para Violão

Aprenda os acordes principais para tocar suas primeiras músicas.

## Acordes Maiores
### C (Dó Maior)
\`\`\`
E 0
B 1
G 0
D 2
A 3
E X
\`\`\`

### G (Sol Maior)
\`\`\`
E 3
B 0
G 0
D 0
A 2
E 3
\`\`\`

### D (Ré Maior)
\`\`\`
E 2
B 3
G 2
D 0
A X
E X
\`\`\`

## Dicas para Iniciantes
1. Pratique as mudanças lentamente
2. Use a ponta dos dedos
3. Mantenha o polegar atrás do braço
4. Não force demais - a prática leva à perfeição`,
      category: 'guitar',
      difficulty_level: 'beginner'
    },
    {
      title: 'Improvisação com a Escala Pentatônica',
      content: `# Improvisação com a Escala Pentatônica

A escala pentatônica é ideal para iniciantes na improvisação por ter apenas 5 notas e evitar dissonâncias.

## Pentatônica Menor
**Fórmula:** 1 - ♭3 - 4 - 5 - ♭7

Exemplo em Lá menor pentatônica: A - C - D - E - G

## Padrões no Braço do Violão
\`\`\`
Padrão 1 (posição 5):
E |---5---8---
B |---5---8---
G |---5---7---
D |---5---7---
A |---5---7---
E |---5---8---
\`\`\`

## Frases para Praticar
1. **Blues básico:** A - C - D - E - G - A
2. **Slide entre notas:** 5 → 7 → 8
3. **Bending:** 7 → 8 (meio tom)`,
      category: 'improvisation',
      difficulty_level: 'intermediate'
    },
    {
      title: 'Leitura de Partitura Básica',
      content: `# Leitura de Partitura Básica

Entenda os elementos fundamentais da notação musical.

## A Pauta (Pentagrama)
5 linhas e 4 espaços onde escrevemos as notas.

## Claves
### Clave de Sol (para sons agudos)
\`\`\`
   ---
     F
   ---
     D
   ---
     B
   ---
     G
   ---
     E
\`\`\`

### Clave de Fá (para sons graves)

## Figuras Rítmicas
- **Redonda** (4 tempos)
- **Branca** (2 tempos)
- **Semínima** (1 tempo)
- **Colcheia** (1/2 tempo)
- **Semicolcheia** (1/4 tempo)

## Dicas de Estudo
1. Comece identificando notas na clave de Sol
2. Pratique com músicas simples
3. Use aplicativos de treino
4. Seja paciente - leitura musical leva tempo`,
      category: 'reading',
      difficulty_level: 'beginner'
    }
  ],
  
  sampleScales: [
    {
      scale_name: 'Escala Maior',
      root_note: 'C',
      scale_type: 'major',
      notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
    },
    {
      scale_name: 'Escala Menor Natural',
      root_note: 'A',
      scale_type: 'natural_minor',
      notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A']
    },
    {
      scale_name: 'Pentatônica Maior',
      root_note: 'C',
      scale_type: 'major_pentatonic',
      notes: ['C', 'D', 'E', 'G', 'A', 'C']
    },
    {
      scale_name: 'Blues',
      root_note: 'A',
      scale_type: 'blues',
      notes: ['A', 'C', 'D', 'D#', 'E', 'G', 'A']
    },
    {
      scale_name: 'Dórico',
      root_note: 'D',
      scale_type: 'dorian',
      notes: ['D', 'E', 'F', 'G', 'A', 'B', 'C', 'D']
    }
  ],
  
  sampleChords: [
    {
      chord_name: 'Acorde Maior',
      root_note: 'C',
      chord_type: 'major',
      notes: ['C', 'E', 'G']
    },
    {
      chord_name: 'Acorde Menor',
      root_note: 'A',
      chord_type: 'minor',
      notes: ['A', 'C', 'E']
    },
    {
      chord_name: 'Sétima Dominante',
      root_note: 'G',
      chord_type: 'dominant_7',
      notes: ['G', 'B', 'D', 'F']
    },
    {
      chord_name: 'Acorde Aumentado',
      root_note: 'C',
      chord_type: 'augmented',
      notes: ['C', 'E', 'G#']
    },
    {
      chord_name: 'Acorde Diminuto',
      root_note: 'B',
      chord_type: 'diminished',
      notes: ['B', 'D', 'F']
    }
  ]
};

async function seedDatabase() {
  console.log('🎵 Starting MusicOS database seeding...\n');
  
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Check connection
    const { data: healthData, error: healthError } = await supabase.auth.getSession();
    
    if (healthError) {
      console.error('❌ Failed to connect to Supabase:', healthError.message);
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase\n');
    
    // Seed educational content
    console.log('📚 Seeding educational content...');
    for (const content of SEED_DATA.educationalContent) {
      const { error } = await supabase
        .from('educational_content')
        .upsert(content, { onConflict: 'title' });
      
      if (error) {
        console.error(`❌ Failed to seed "${content.title}":`, error.message);
      } else {
        console.log(`✅ Added: ${content.title}`);
      }
    }
    
    console.log('\n🎼 Seeding sample scales and chords (for reference)...');
    
    // Note: In a real app, saved_scales and saved_chords would be user-specific
    // These are just examples that won't be inserted without a user ID
    console.log('⚠️  Sample scales and chords require authenticated user to save');
    console.log('   They are shown here as reference data for development\n');
    
    // Display sample data for reference
    console.log('Sample Scales:');
    SEED_DATA.sampleScales.forEach((scale, i) => {
      console.log(`  ${i + 1}. ${scale.scale_name} (${scale.root_note}): ${scale.notes.join(' - ')}`);
    });
    
    console.log('\nSample Chords:');
    SEED_DATA.sampleChords.forEach((chord, i) => {
      console.log(`  ${i + 1}. ${chord.chord_name} (${chord.root_note}): ${chord.notes.join(' - ')}`);
    });
    
    // Verify seeding
    console.log('\n🔍 Verifying seeded data...');
    
    const { data: contentCount, error: countError } = await supabase
      .from('educational_content')
      .select('count');
    
    if (countError) {
      console.error('❌ Failed to verify seeding:', countError.message);
    } else {
      console.log(`✅ Successfully seeded ${contentCount?.[0]?.count || 0} educational content items`);
    }
    
    // Create a test profile if auth is working
    console.log('\n👤 Creating test profile (if auth tables exist)...');
    
    try {
      // This would require an authenticated user session
      // For now, just check if profiles table exists
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (profilesError && profilesError.code === '42P01') {
        console.log('⚠️  Profiles table does not exist. Run the SQL schema first.');
      } else {
        console.log('✅ Profiles table exists');
      }
    } catch (error) {
      console.log('ℹ️  Auth check skipped:', error instanceof Error ? error.message : String(error));
    }
    
    console.log('\n🎉 Database seeding completed!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL schema from docs/SUPABASE-SETUP.md');
    console.log('2. Test authentication with a real user');
    console.log('3. Implement user-specific data saving');
    
  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { seedDatabase, SEED_DATA };