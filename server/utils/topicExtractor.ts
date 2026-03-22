/**
 * Topic Extraction and Question Generation Module
 * Extracts key topics from PDF content and generates relevant questions
 * Author: [Teammate 2 Name]
 */

interface Topic {
    keyword: string;
    frequency: number;
    context: string;
}

interface GeneratedQuestion {
    question: string;
    category: string;
    relevance: number;
    keywords: string[];
}

// Common question templates for educational content
const QUESTION_TEMPLATES = [
    { template: "What is {topic}?", category: "definition" },
    { template: "Explain {topic} in detail", category: "explanation" },
    { template: "What are the main features of {topic}?", category: "features" },
    { template: "How does {topic} work?", category: "mechanism" },
    { template: "What are the advantages of {topic}?", category: "advantages" },
    { template: "What are the disadvantages of {topic}?", category: "disadvantages" },
    { template: "Compare {topic} with other approaches", category: "comparison" },
    { template: "What are the applications of {topic}?", category: "applications" },
    { template: "List the types of {topic}", category: "classification" },
    { template: "What is the purpose of {topic}?", category: "purpose" },
    { template: "Describe the process of {topic}", category: "process" },
    { template: "What are the requirements for {topic}?", category: "requirements" },
    { template: "Summarize {topic}", category: "summary" },
    { template: "What are the key points about {topic}?", category: "key-points" },
];

// Stopwords to filter out
const STOPWORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with',
    'to', 'for', 'of', 'as', 'by', 'from', 'this', 'that', 'these', 'those',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'are', 'was', 'were',
    'your', 'you', 'any', 'all', 'each', 'such', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'both', 'each',
    'other', 'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very'
]);

// Generic words that should be avoided as standalone topics
const GENERIC_WORDS = new Set([
    'apple', 'system', 'user', 'data', 'information', 'content', 'service',
    'application', 'software', 'program', 'document', 'file', 'page', 'section',
    'using', 'used', 'include', 'includes', 'provide', 'provides', 'based',
    'related', 'available', 'required', 'example', 'examples', 'following'
]);

/**
 * Extract key topics from document text
 */
export function extractTopics(text: string, maxTopics: number = 20): Topic[] {
    // Normalize text first - replace punctuation with spaces to preserve word boundaries
    const normalizedText = text
        .replace(/[,;:()]/g, ' ')
        .replace(/\s+/g, ' ');
    
    // Extract multi-word phrases FIRST (bigrams and trigrams)
    const phrases = extractPhrases(normalizedText);
    const phraseFreq = new Map<string, number>();
    
    phrases.forEach(phrase => {
        phraseFreq.set(phrase, (phraseFreq.get(phrase) || 0) + 1);
    });

    // Get words that are part of frequent phrases
    const wordsInPhrases = new Set<string>();
    Array.from(phraseFreq.entries())
        .filter(([_, freq]) => freq >= 2) // Only phrases that appear 2+ times
        .forEach(([phrase, _]) => {
            phrase.split(/\s+/).forEach(word => wordsInPhrases.add(word));
        });

    // Tokenize and clean text for single words
    const words = normalizedText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(word => 
            word.length > 3 && 
            word.length < 20 && // Skip overly long words
            !STOPWORDS.has(word)
        );

    // Count word frequencies (but deprioritize generic words that appear in phrases)
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
        // Skip generic words if they're part of a phrase
        if (GENERIC_WORDS.has(word) && wordsInPhrases.has(word)) {
            return;
        }
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // Combine phrases and words, heavily boosting phrases
    const allTopics = new Map<string, number>();
    
    // Add phrases with boost (only if they appear multiple times OR are long enough)
    phraseFreq.forEach((freq, phrase) => {
        // Filter out overly long phrases
        if (phrase.length < 50 && phrase.length > 5) {
            allTopics.set(phrase, freq * 3); // 3x boost for phrases
        }
    });
    
    // Add single words (only if not generic or not in phrases)
    wordFreq.forEach((freq, word) => {
        if (!wordsInPhrases.has(word) || !GENERIC_WORDS.has(word)) {
            allTopics.set(word, freq);
        }
    });

    // Sort by frequency and get top topics
    const topics: Topic[] = Array.from(allTopics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxTopics)
        .filter(([keyword, _]) => keyword.length < 50 && keyword.length > 3) // Final safety check
        .map(([keyword, frequency]) => ({
            keyword,
            frequency,
            context: extractContext(text, keyword)
        }));

    return topics;
}

/**
 * Extract meaningful phrases (bigrams and trigrams)
 */
function extractPhrases(text: string): string[] {
    // First, normalize the text better - preserve word boundaries
    const normalizedText = text
        .replace(/[,;:()]/g, ' ') // Replace punctuation with spaces
        .replace(/\s+/g, ' '); // Collapse multiple spaces
    
    const sentences = normalizedText.split(/[.!?]+/);
    const phrases: string[] = [];

    sentences.forEach(sentence => {
        const words = sentence
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, ' ') // Keep hyphens
            .split(/\s+/)
            .filter(w => w.length > 2 && w.length < 20); // Skip overly long words

        // Extract bigrams (2-word phrases)
        for (let i = 0; i < words.length - 1; i++) {
            const word1 = words[i];
            const word2 = words[i + 1];
            
            // Both words should be reasonable length
            if (word1.length < 15 && word2.length < 15) {
                // Only add if it's meaningful (not two stopwords)
                if (!STOPWORDS.has(word1) && !STOPWORDS.has(word2)) {
                    phrases.push(`${word1} ${word2}`);
                }
            }
        }

        // Extract trigrams (3-word phrases) - only if words are reasonable
        for (let i = 0; i < words.length - 2; i++) {
            const word1 = words[i];
            const word2 = words[i + 1];
            const word3 = words[i + 2];
            
            // Check word lengths
            if (word1.length < 12 && word2.length < 12 && word3.length < 12) {
                // At least two words should not be stopwords
                const nonStopwords = [word1, word2, word3].filter(w => !STOPWORDS.has(w));
                if (nonStopwords.length >= 2) {
                    const phrase = `${word1} ${word2} ${word3}`;
                    // Only add if total phrase length is reasonable
                    if (phrase.length < 40) {
                        phrases.push(phrase);
                    }
                }
            }
        }
    });

    return phrases;
}

/**
 * Extract context snippet around a keyword
 */
function extractContext(text: string, keyword: string): string {
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);

    if (index === -1) return '';

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    
    return text.substring(start, end).trim();
}

/**
 * Generate questions based on extracted topics
 */
export function generateQuestions(topics: Topic[], maxQuestions: number = 15): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    const usedQuestions = new Set<string>();

    // Generate questions for each topic
    topics.forEach(topic => {
        QUESTION_TEMPLATES.forEach(template => {
            const question = template.template.replace('{topic}', topic.keyword);
            
            // Avoid duplicates
            if (!usedQuestions.has(question.toLowerCase())) {
                questions.push({
                    question,
                    category: template.category,
                    relevance: topic.frequency,
                    keywords: [topic.keyword]
                });
                usedQuestions.add(question.toLowerCase());
            }
        });
    });

    // Sort by relevance and return top questions
    return questions
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, maxQuestions);
}

/**
 * Get suggestions based on user's partial input
 */
export function getSuggestions(
    userInput: string,
    allQuestions: GeneratedQuestion[],
    maxSuggestions: number = 5
): GeneratedQuestion[] {
    if (!userInput || userInput.length < 2) {
        // Return popular questions if no input
        return allQuestions.slice(0, maxSuggestions);
    }

    const inputLower = userInput.toLowerCase();
    const inputWords = inputLower.split(/\s+/).filter(w => w.length > 2);

    // Score each question based on input match
    const scoredQuestions = allQuestions.map(q => {
        let score = 0;
        const questionLower = q.question.toLowerCase();

        // Exact phrase match (highest priority)
        if (questionLower.includes(inputLower)) {
            score += 100;
        }

        // Word matches
        inputWords.forEach(word => {
            if (questionLower.includes(word)) {
                score += 10;
            }
        });

        // Keyword matches
        q.keywords.forEach(keyword => {
            if (keyword.toLowerCase().includes(inputLower)) {
                score += 20;
            }
        });

        // Boost by original relevance
        score += q.relevance * 0.1;

        return { ...q, matchScore: score };
    });

    // Return top matches
    return scoredQuestions
        .filter(q => q.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxSuggestions);
}

/**
 * Analyze document and prepare question bank
 */
export function analyzeDocument(text: string): {
    topics: Topic[];
    questions: GeneratedQuestion[];
} {
    const topics = extractTopics(text, 20);
    const questions = generateQuestions(topics, 30);

    return { topics, questions };
}
