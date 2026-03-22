/**
 * In-memory cache for frequently asked questions
 * Stores LLM responses to avoid redundant API calls
 */

export interface CachedResponse {
    question: string;
    answer: string;
    metadata: {
        baseline_estimated_tokens: number;
        optimized_estimated_tokens: number;
        compressed_tokens: number;
        routing_savings_pct: number;
        total_savings_pct: number;
        selected_chapters: any[];
        selected_sections_count: number;
        total_sections_count: number;
    };
    scaledownResponse: any;
    aiResponse: any;
    cachedAt: number;
    hitCount: number;
}

interface CacheEntry {
    normalizedQuestion: string;
    response: CachedResponse;
}

// In-memory cache: documentId → question → cached response
const cache = new Map<string, Map<string, CacheEntry>>();

// Configuration
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (same as session)
const MAX_CACHE_SIZE_PER_DOCUMENT = 50; // Max 50 cached Q&A per document
const SIMILARITY_THRESHOLD = 0.75; // 75% similarity to consider a cache hit (lowered for better matching)

/**
 * Normalize question for better cache matching
 * - Lowercase
 * - Remove punctuation
 * - Trim whitespace
 * - Remove common question words
 * - Fix common typos
 */
function normalizeQuestion(question: string): string {
    return question
        .toLowerCase()
        // Fix common typos
        .replace(/whcih/g, 'which')
        .replace(/sre/g, 'are')
        .replace(/teh/g, 'the')
        .replace(/adn/g, 'and')
        .replace(/waht/g, 'what')
        // Remove punctuation
        .replace(/[?!.,;:'"]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Calculate similarity between two questions using Jaccard similarity
 * Returns a value between 0 (no similarity) and 1 (identical)
 */
function calculateSimilarity(q1: string, q2: string): number {
    const words1 = new Set(q1.split(' '));
    const words2 = new Set(q2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

/**
 * Generate a cache key from document IDs
 */
function generateDocumentKey(documentIds: string[]): string {
    return documentIds.sort().join('|');
}

/**
 * Get cached response for a question
 * Returns null if no cache hit or cache expired
 */
export function getCachedResponse(
    documentIds: string[],
    question: string
): CachedResponse | null {
    const docKey = generateDocumentKey(documentIds);
    const docCache = cache.get(docKey);
    
    if (!docCache) {
        return null;
    }
    
    const normalized = normalizeQuestion(question);
    
    // First try exact match
    const exactMatch = docCache.get(normalized);
    if (exactMatch) {
        const age = Date.now() - exactMatch.response.cachedAt;
        if (age < CACHE_TTL_MS) {
            exactMatch.response.hitCount++;
            console.log(`[Cache] Exact hit for: "${question}" (hits: ${exactMatch.response.hitCount})`);
            return exactMatch.response;
        } else {
            // Expired, remove it
            docCache.delete(normalized);
            console.log(`[Cache] Expired entry removed: "${question}"`);
        }
    }
    
    // Try fuzzy match (similar questions)
    for (const [cachedNormalized, entry] of docCache.entries()) {
        const similarity = calculateSimilarity(normalized, cachedNormalized);
        
        if (similarity >= SIMILARITY_THRESHOLD) {
            const age = Date.now() - entry.response.cachedAt;
            if (age < CACHE_TTL_MS) {
                entry.response.hitCount++;
                console.log(`[Cache] Fuzzy hit (${(similarity * 100).toFixed(1)}% similar) for: "${question}" (hits: ${entry.response.hitCount})`);
                return entry.response;
            } else {
                docCache.delete(cachedNormalized);
            }
        }
    }
    
    console.log(`[Cache] Miss for: "${question}"`);
    return null;
}

/**
 * Store a response in the cache
 */
export function setCachedResponse(
    documentIds: string[],
    question: string,
    response: Omit<CachedResponse, 'cachedAt' | 'hitCount'>
): void {
    const docKey = generateDocumentKey(documentIds);
    
    let docCache = cache.get(docKey);
    if (!docCache) {
        docCache = new Map();
        cache.set(docKey, docCache);
    }
    
    const normalized = normalizeQuestion(question);
    
    // Enforce max cache size (LRU-like: remove oldest)
    if (docCache.size >= MAX_CACHE_SIZE_PER_DOCUMENT) {
        let oldestKey: string | null = null;
        let oldestTime = Date.now();
        
        for (const [key, entry] of docCache.entries()) {
            if (entry.response.cachedAt < oldestTime) {
                oldestTime = entry.response.cachedAt;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            docCache.delete(oldestKey);
            console.log(`[Cache] Evicted oldest entry to make room`);
        }
    }
    
    docCache.set(normalized, {
        normalizedQuestion: normalized,
        response: {
            ...response,
            cachedAt: Date.now(),
            hitCount: 0,
        },
    });
    
    console.log(`[Cache] Stored response for: "${question}"`);
}

/**
 * Clear cache for specific documents
 */
export function clearDocumentCache(documentIds: string[]): void {
    const docKey = generateDocumentKey(documentIds);
    const deleted = cache.delete(docKey);
    
    if (deleted) {
        console.log(`[Cache] Cleared cache for documents: ${docKey}`);
    }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
    const size = cache.size;
    cache.clear();
    console.log(`[Cache] Cleared all cache (${size} document groups)`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
    documentGroups: number;
    totalEntries: number;
    topQuestions: Array<{ question: string; hits: number }>;
} {
    let totalEntries = 0;
    const allQuestions: Array<{ question: string; hits: number }> = [];
    
    for (const docCache of cache.values()) {
        totalEntries += docCache.size;
        
        for (const entry of docCache.values()) {
            if (entry.response.hitCount > 0) {
                allQuestions.push({
                    question: entry.response.question,
                    hits: entry.response.hitCount,
                });
            }
        }
    }
    
    // Sort by hit count and take top 10
    const topQuestions = allQuestions
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 10);
    
    return {
        documentGroups: cache.size,
        totalEntries,
        topQuestions,
    };
}

// Automatic cleanup timer: runs every 10 minutes
setInterval(() => {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [docKey, docCache] of cache.entries()) {
        for (const [questionKey, entry] of docCache.entries()) {
            const age = now - entry.response.cachedAt;
            if (age > CACHE_TTL_MS) {
                docCache.delete(questionKey);
                deletedCount++;
            }
        }
        
        // Remove empty document caches
        if (docCache.size === 0) {
            cache.delete(docKey);
        }
    }
    
    if (deletedCount > 0) {
        console.log(`[Cache] Auto-cleaned ${deletedCount} expired entries.`);
    }
}, 10 * 60 * 1000); // 10 minutes
