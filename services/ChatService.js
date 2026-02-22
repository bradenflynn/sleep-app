/**
 * ChatService.js
 * Handles retrieval-based AI chat logic.
 * Grounded in peer-reviewed studies and influencer protocols.
 */

const studyDatabase = [
    {
        topic: 'magnesium',
        content: 'Studies (e.g., Abbasi et al., 2012) show that Magnesium supplementation can improve sleep quality and melatonin levels in elderly adults.',
        source: 'Journal of Research in Medical Sciences'
    },
    {
        topic: 'mouth tape',
        content: 'Nasal breathing vs. mouth breathing during sleep: Research suggests nasal breathing can improve oxygen saturation and reduce snoring.',
        source: 'Various ENT Studies'
    },
    {
        topic: 'blue light',
        content: 'Clear vs. Tinted: Blue-light blocking glasses, especially amber or red-tinted, have been shown to prevent melatonin suppression if worn 2-3 hours before bed.',
        source: 'Chronobiology International'
    }
];

export const ChatService = {
    /**
     * Query the "Knowledge Base" (Retrieval step).
     */
    queryKnowledgeBase: (query) => {
        console.log(`[Chat] Querying knowledge base for: ${query}`);
        const normalizedQuery = query.toLowerCase();

        // Simple mock retrieval logic
        const results = studyDatabase.filter(item =>
            normalizedQuery.includes(item.topic)
        );

        return results;
    },

    /**
     * Generate a response based on retrieved data (RAG).
     */
    generateResponse: async (userInput) => {
        const retrievedData = ChatService.queryKnowledgeBase(userInput);

        if (retrievedData.length === 0) {
            return "I couldn't find a specific study on that in my current database. I recommend focusing on the core 'Night-Ops' protocols: Magnesium, Mouth Tape, and Blue Light blocking.";
        }

        const citations = retrievedData.map(d => `${d.content} (Source: ${d.source})`).join('\n\n');
        return `Based on medical literature:\n\n${citations}\n\nNote: This is for educational purposes only.`;
    }
};
