const { generateRawContent } = require('../services/geminiService'); // ודא שהנתיב נכון

const translateText = async (req, res) => {
    try {
        const { text, targetLang, isToHebrew } = req.body;
        
        let prompt = "";
        if (isToHebrew) {
            prompt = `Translate to Hebrew: "${text}". Output ONLY a JSON object with the key "translation". Provide ONLY the single most common meaning. Do NOT list synonyms. NO NIQQUD. Example: {"translation": "כלב"}`;
        } else {
            prompt = `Translate to ${targetLang}: "${text}". Output strictly in lowercase inside a JSON object with the key "translation". Example: {"translation": "perro"}`;
        }

        const rawJson = await generateRawContent(prompt);
        const parsed = JSON.parse(rawJson);
        
        res.json({ translation: parsed.translation });
    } catch (error) {
        console.error("Translation Error:", error);
        res.status(500).json({ message: "Failed to translate text" });
    }
};

const generateReadingPassage = async (req, res) => {
    try {
        const { topic, level, length, targetLangName } = req.body;

        const levelGuides = {
            "A1": "CEFR A1: Simple sentences. Present Indicative ONLY. Basic vocabulary.",
            "A2": "CEFR A2: Present & Past tenses. Adverbs of frequency. Basic connectors.",
            "B1": "CEFR B1: All past tenses. Future Simple. Conditional Simple.",
            "B2": "CEFR B2: Complex texts. Passive voice. Technical discussion.",
            "C1": "CEFR C1: Advanced structure. Idiomatic expressions.",
            "C2": "CEFR C2: Mastery. Literary style. Rare vocabulary."
        };

        const selectedGuide = levelGuides[level] || levelGuides["A1"];
        const isStoryRequest = topic.toLowerCase().includes('story') || topic.includes('סיפור');
        const typeInstruction = isStoryRequest ? "story" : "informative text/article/passage (NOT a story)";

        const prompt = `
            Role: You are a strict CEFR ${targetLangName} teacher.
            Task: Write a ${targetLangName} ${typeInstruction} about "${topic}".
            Length: ${length}.
            Level Constraint: ${selectedGuide}
            
            IMPORTANT: Output ONLY a valid JSON object with the key "story" containing the text. Do not output translation.
        `;

        const rawJson = await generateRawContent(prompt);
        const parsed = JSON.parse(rawJson);

        res.json({ story: parsed.story });
    } catch (error) {
        console.error("Story Generation Error:", error);
        res.status(500).json({ message: "Failed to generate story" });
    }
};

module.exports = {
    translateText,
    generateReadingPassage
};