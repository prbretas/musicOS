/**
 * InstrumentRegistry - Registro central de instrumentos musicais
 * 
 * Gerencia todos os instrumentos disponíveis no MusicOS,
 * permitindo registro, busca e criação de instrumentos.
 */

import { Instrument, InstrumentError } from './instrument';
import {
  InstrumentConfig,
  InstrumentFilter,
  InstrumentSearchResult,
  CreateInstrumentOptions
} from '../types/instrument';

/**
 * Configuração do registry
 */
interface RegistryConfig {
  /** Auto-carregar instrumentos padrão */
  autoLoadPresets: boolean;
  
  /** Cache de instrumentos criados */
  enableCaching: boolean;
  
  /** Tamanho máximo do cache */
  maxCacheSize: number;
  
  /** Logging habilitado */
  enableLogging: boolean;
}

/**
 * Item no cache do registry
 */
interface CacheItem {
  /** Instrumento criado */
  instrument: Instrument;
  
  /** Timestamp da criação */
  createdAt: number;
  
  /** Número de acessos */
  accessCount: number;
}

/**
 * Registry central de instrumentos musicais
 */
export class InstrumentRegistry {
  // ============================================
  // PROPRIEDADES
  // ============================================
  
  /** Configurações do registry */
  private config: RegistryConfig;
  
  /** Configurações de instrumentos registrados */
  private registeredInstruments = new Map<string, InstrumentConfig>();
  
  /** Cache de instrumentos criados */
  private instrumentCache = new Map<string, CacheItem>();
  
  /** Callbacks para eventos */
  private eventCallbacks = {
    onInstrumentRegistered: new Set<(config: InstrumentConfig) => void>(),
    onInstrumentUnregistered: new Set<(instrumentId: string) => void>(),
    onCacheCleared: new Set<() => void>()
  };
  
  /** Contador de instrumentos criados */
  private creationCounter = 0;
  
  // ============================================
  // CONSTRUTOR
  // ============================================
  
  constructor(config: Partial<RegistryConfig> = {}) {
    this.config = {
      autoLoadPresets: config.autoLoadPresets ?? true,
      enableCaching: config.enableCaching ?? true,
      maxCacheSize: config.maxCacheSize ?? 100,
      enableLogging: config.enableLogging ?? false
    };
    
    if (this.config.autoLoadPresets) {
      this.loadPresetInstruments();
    }
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - REGISTRO
  // ============================================
  
  /**
   * Registra uma configuração de instrumento
   */
  registerInstrument(config: InstrumentConfig): boolean {
    if (this.registeredInstruments.has(config.id)) {
      if (this.config.enableLogging) {
        console.warn(`Instrumento com ID "${config.id}" já registrado. Sobrescrevendo.`);
      }
    }
    
    this.registeredInstruments.set(config.id, config);
    
    // Disparar eventos
    this.eventCallbacks.onInstrumentRegistered.forEach(callback => {
      callback(config);
    });
    
    if (this.config.enableLogging) {
      console.log(`Instrumento registrado: ${config.name} (${config.id})`);
    }
    
    return true;
  }
  
  /**
   * Registra múltiplos instrumentos de uma vez
   */
  registerInstruments(configs: InstrumentConfig[]): number {
    let count = 0;
    
    for (const config of configs) {
      if (this.registerInstrument(config)) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Remove um instrumento do registro
   */
  unregisterInstrument(instrumentId: string): boolean {
    if (!this.registeredInstruments.has(instrumentId)) {
      if (this.config.enableLogging) {
        console.warn(`Instrumento com ID "${instrumentId}" não encontrado para remoção.`);
      }
      return false;
    }
    
    this.registeredInstruments.delete(instrumentId);
    
    // Remover do cache também
    this.instrumentCache.delete(instrumentId);
    
    // Disparar eventos
    this.eventCallbacks.onInstrumentUnregistered.forEach(callback => {
      callback(instrumentId);
    });
    
    if (this.config.enableLogging) {
      console.log(`Instrumento removido: ${instrumentId}`);
    }
    
    return true;
  }
  
  /**
   * Verifica se um instrumento está registrado
   */
  isInstrumentRegistered(instrumentId: string): boolean {
    return this.registeredInstruments.has(instrumentId);
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - CRIAÇÃO
  // ============================================
  
  /**
   * Cria uma nova instância de um instrumento
   */
  createInstrument(instrumentId: string, options: CreateInstrumentOptions = {}): Instrument {
    // Verificar se está registrado
    const config = this.registeredInstruments.get(instrumentId);
    
    if (!config) {
      throw new InstrumentError(
        `Instrumento com ID "${instrumentId}" não encontrado`,
        instrumentId,
        'INSTRUMENT_NOT_FOUND'
      );
    }
    
    // Verificar cache
    if (this.config.enableCaching) {
      const cacheKey = this.getCacheKey(instrumentId, options);
      const cachedItem = this.instrumentCache.get(cacheKey);
      
      if (cachedItem) {
        // Atualizar contador de acessos
        cachedItem.accessCount++;
        
        if (this.config.enableLogging) {
          console.log(`Instrumento ${instrumentId} retornado do cache (acesso #${cachedItem.accessCount})`);
        }
        
        return cachedItem.instrument;
      }
    }
    
    // Criar nova instância
    const instrument = this.instantiateInstrument(config, {
      ...options,
      id: options.id || `${instrumentId}-${++this.creationCounter}`
    });
    
    // Adicionar ao cache se habilitado
    if (this.config.enableCaching) {
      const cacheKey = this.getCacheKey(instrumentId, options);
      
      this.instrumentCache.set(cacheKey, {
        instrument,
        createdAt: Date.now(),
        accessCount: 1
      });
      
      // Limpar cache se exceder tamanho máximo
      this.cleanupCache();
    }
    
    if (this.config.enableLogging) {
      console.log(`Instrumento criado: ${config.name} (${instrument.id})`);
    }
    
    return instrument;
  }
  
  /**
   * Cria instrumentos de múltiplos tipos
   */
  createInstruments(instrumentIds: string[], options: CreateInstrumentOptions = {}): Instrument[] {
    return instrumentIds
      .map(id => {
        try {
          return this.createInstrument(id, options);
        } catch (error) {
          if (this.config.enableLogging) {
            console.error(`Erro ao criar instrumento ${id}:`, error);
          }
          return null;
        }
      })
      .filter((instrument): instrument is Instrument => instrument !== null);
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - BUSCA
  // ============================================
  
  /**
   * Busca instrumentos por filtros
   */
  searchInstruments(filter: InstrumentFilter = {}): InstrumentSearchResult {
    const instruments = Array.from(this.registeredInstruments.values());
    
    // Aplicar filtros
    let filtered = instruments;
    
    // Filtrar por categoria
    if (filter.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
      filtered = filtered.filter(instr => categories.includes(instr.category));
    }
    
    // Filtrar por tipo
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      filtered = filtered.filter(instr => types.includes(instr.type));
    }
    
    // Filtrar por tier
    if (filter.tier) {
      if (filter.tier === 'free') {
        filtered = filtered.filter(instr => instr.isFreeTier);
      } else if (filter.tier === 'premium') {
        filtered = filtered.filter(instr => !instr.isFreeTier);
      }
    }
    
    // Filtrar por número mínimo de cordas
    if (filter.minStrings !== undefined) {
      filtered = filtered.filter(instr => 
        instr.strings !== undefined && instr.strings >= filter.minStrings!
      );
    }
    
    // Filtrar por número mínimo de teclas
    if (filter.minKeys !== undefined) {
      filtered = filtered.filter(instr => 
        instr.keys !== undefined && instr.keys >= filter.minKeys!
      );
    }
    
    // Filtrar por range
    if (filter.requiredRange) {
      const { lowestNote, lowestOctave, highestNote, highestOctave } = filter.requiredRange;
      
      filtered = filtered.filter(instr => {
        const instrLowest = instr.range.lowestNote;
        const instrHighest = instr.range.highestNote;
        
        // Converter para semitons para comparação
        const requiredLowest = this.noteToSemitones(lowestNote, lowestOctave);
        const requiredHighest = this.noteToSemitones(highestNote, highestOctave);
        const instrLowestSemitones = this.noteToSemitones(instrLowest.note, instrLowest.octave);
        const instrHighestSemitones = this.noteToSemitones(instrHighest.note, instrHighest.octave);
        
        return requiredLowest >= instrLowestSemitones && requiredHighest <= instrHighestSemitones;
      });
    }
    
    // Filtrar por busca textual
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(instr => 
        instr.name.toLowerCase().includes(searchTerm) ||
        instr.description.toLowerCase().includes(searchTerm) ||
        instr.id.toLowerCase().includes(searchTerm)
      );
    }
    
    // Ordenar por nome
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    // Aplicar paginação se necessário
    let paginated = filtered;
    let page = 1;
    let perPage = filtered.length;
    
    if (filter.page !== undefined && filter.perPage !== undefined) {
      page = filter.page;
      perPage = filter.perPage;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      paginated = filtered.slice(start, end);
    }
    
    return {
      instruments: paginated,
      total: filtered.length,
      page,
      perPage
    };
  }
  
  /**
   * Obtém configuração de um instrumento específico
   */
  getInstrumentConfig(instrumentId: string): InstrumentConfig | null {
    return this.registeredInstruments.get(instrumentId) || null;
  }
  
  /**
   * Obtém todos os instrumentos registrados
   */
  getAllInstrumentConfigs(): InstrumentConfig[] {
    return Array.from(this.registeredInstruments.values());
  }
  
  /**
   * Obtém instrumentos do tier gratuito
   */
  getFreeTierInstruments(): InstrumentConfig[] {
    return this.getAllInstrumentConfigs().filter(instr => instr.isFreeTier);
  }
  
  /**
   * Obtém instrumentos do tier premium
   */
  getPremiumTierInstruments(): InstrumentConfig[] {
    return this.getAllInstrumentConfigs().filter(instr => !instr.isFreeTier);
  }
  
  /**
   * Obtém instrumentos por categoria
   */
  getInstrumentsByCategory(category: string): InstrumentConfig[] {
    return this.getAllInstrumentConfigs().filter(instr => instr.category === category);
  }
  
  /**
   * Obtém instrumentos por tipo
   */
  getInstrumentsByType(type: string): InstrumentConfig[] {
    return this.getAllInstrumentConfigs().filter(instr => instr.type === type);
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - CACHE
  // ============================================
  
  /**
   * Limpa o cache de instrumentos
   */
  clearCache(): void {
    const previousSize = this.instrumentCache.size;
    this.instrumentCache.clear();
    
    // Disparar eventos
    this.eventCallbacks.onCacheCleared.forEach(callback => {
      callback();
    });
    
    if (this.config.enableLogging) {
      console.log(`Cache limpo: ${previousSize} instrumentos removidos`);
    }
  }
  
  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    oldest: number;
    newest: number;
  } {
    if (!this.config.enableCaching || this.instrumentCache.size === 0) {
      return {
        size: 0,
        hitRate: 0,
        oldest: 0,
        newest: 0
      };
    }
    
    const items = Array.from(this.instrumentCache.values());
    const now = Date.now();
    
    const totalAccesses = items.reduce((sum, item) => sum + item.accessCount, 0);
    const totalHits = totalAccesses - items.length; // Acesso inicial não é hit
    
    return {
      size: this.instrumentCache.size,
      hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
      oldest: Math.min(...items.map(item => now - item.createdAt)),
      newest: Math.max(...items.map(item => now - item.createdAt))
    };
  }
  
  // ============================================
  // MÉTODOS PÚBLICOS - EVENTOS
  // ============================================
  
  /**
   * Adiciona listener para evento de registro
   */
  onInstrumentRegistered(callback: (config: InstrumentConfig) => void): () => void {
    this.eventCallbacks.onInstrumentRegistered.add(callback);
    return () => {
      this.eventCallbacks.onInstrumentRegistered.delete(callback);
    };
  }
  
  /**
   * Adiciona listener para evento de remoção
   */
  onInstrumentUnregistered(callback: (instrumentId: string) => void): () => void {
    this.eventCallbacks.onInstrumentUnregistered.add(callback);
    return () => {
      this.eventCallbacks.onInstrumentUnregistered.delete(callback);
    };
  }
  
  /**
   * Adiciona listener para evento de limpeza de cache
   */
  onCacheCleared(callback: () => void): () => void {
    this.eventCallbacks.onCacheCleared.add(callback);
    return () => {
      this.eventCallbacks.onCacheCleared.delete(callback);
    };
  }
  
  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================
  
  /**
   * Carrega instrumentos pré-definidos (presets)
   */
  private loadPresetInstruments(): void {
    // Esta implementação será expandida posteriormente
    // com importação dinâmica de presets
    
    if (this.config.enableLogging) {
      console.log('Carregando instrumentos pré-definidos...');
    }
    
    // Por enquanto, apenas log
    // Os presets serão carregados dinamicamente
  }
  
  /**
   * Instancia um instrumento específico
   */
  private instantiateInstrument(
    config: InstrumentConfig,
    options: CreateInstrumentOptions
  ): Instrument {
    // Esta é uma implementação base que retorna um Instrument genérico
    // Em uma implementação real, você teria fábricas específicas por tipo
    
    // Importar dinamicamente a fábrica apropriada baseada no tipo
    // Por enquanto, retornamos uma instância básica
    
    const InstrumentClass = require('./instrument').Instrument;
    
    // Criar instância do instrumento
    const instrument = new (InstrumentClass as any)(config, options);
    
    return instrument;
  }
  
  /**
   * Gera chave de cache para um instrumento
   */
  private getCacheKey(instrumentId: string, options: CreateInstrumentOptions): string {
    const parts = [instrumentId];
    
    if (options.id) parts.push(options.id);
    if (options.initialTuning) parts.push(`tuning:${options.initialTuning}`);
    if (options.initialRange) {
      const { lowestNote, highestNote } = options.initialRange;
      parts.push(`range:${lowestNote.note}${lowestNote.octave}-${highestNote.note}${highestNote.octave}`);
    }
    
    return parts.join('|');
  }
  
  /**
   * Limpa itens antigos do cache
   */
  private cleanupCache(): void {
    if (this.instrumentCache.size <= this.config.maxCacheSize) {
      return;
    }
    
    const items = Array.from(this.instrumentCache.entries());
    
    // Ordenar por acesso mais antigo (menos acessos primeiro)
    items.sort((a, b) => a[1].accessCount - b[1].accessCount);
    
    // Remover os mais antigos até ficar dentro do limite
    const itemsToRemove = items.slice(0, this.instrumentCache.size - this.config.maxCacheSize);
    
    for (const [key] of itemsToRemove) {
      this.instrumentCache.delete(key);
    }
    
    if (this.config.enableLogging && itemsToRemove.length > 0) {
      console.log(`Cache limpo: ${itemsToRemove.length} instrumentos removidos`);
    }
  }
  
  /**
   * Converte nota+oitava para semitons (C0 = 0)
   */
  private noteToSemitones(note: string, octave: number): number {
    // Implementação simplificada
    const noteOrder: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11
    };
    
    return (octave * 12) + (noteOrder[note] || 0);
  }
}

/**
 * Instância global do registry
 */
let globalRegistry: InstrumentRegistry | null = null;

/**
 * Obtém ou cria a instância global do registry
 */
export function getInstrumentRegistry(config?: Partial<RegistryConfig>): InstrumentRegistry {
  if (!globalRegistry) {
    globalRegistry = new InstrumentRegistry(config);
  }
  return globalRegistry;
}

/**
 * Reseta a instância global do registry
 */
export function resetInstrumentRegistry(config?: Partial<RegistryConfig>): InstrumentRegistry {
  globalRegistry = new InstrumentRegistry(config);
  return globalRegistry;
}