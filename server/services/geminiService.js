const { GoogleGenerativeAI } = require("@google/generative-ai");

// אתחול ה-SDK עם מפתח ה-API מהסביבה
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * פונקציה שמייצרת את תוכן השיעור בהתבסס על נתוני הסילבוס (Mission)
 * @param {Object} missionData - הנתונים ששלפנו מ-MongoDB
 * @param {String} targetLanguage - שפת היעד (למשל 'Spanish')
 * @param {String} nativeLanguage - שפת האם של המשתמש (למשל 'Hebrew')
 */
const generateMissionContent = async (missionData, pastWeakWords, targetLanguage = 'Spanish', nativeLanguage = 'Hebrew') => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const weakWordsStr = pastWeakWords && pastWeakWords.length > 0 ? pastWeakWords.map(w => w.word).join(', ') : 'none';

        const prompt = `
            You are an expert ${targetLanguage} teacher. 
            Create an interactive mini-lesson based on the following parameters:
            - CEFR Level: ${missionData.level}
            - Grammar Rule: ${missionData.grammarRule}
            - Must use these verbs: ${missionData.requiredVerbs.join(', ')}
            - Must use these nouns: ${missionData.requiredNouns.join(', ')}
            - CRITICAL: You must also organically weave in these weak words for review: ${weakWordsStr}
            - Explanation hint: ${missionData.explanationHint || 'Explain simply'}

            Output a JSON object EXACTLY in this structure:
            {
                "explanation": "A clear lesson teaching the grammar rule in ${nativeLanguage}. NO NIQQUD.",
                "story": "A short 3-sentence story in ${targetLanguage} using ALL the required verbs, nouns, and weak words. Keep it appropriate for level ${missionData.level}.",
                "challenge": {
                    "question": "A sentence in ${targetLanguage} related to the story where the user needs to conjugate one of the required verbs correctly.",
                    "correctAnswer": "The exact correct conjugated verb",
                    "translation": "The ${nativeLanguage} translation of the challenge sentence."
                }
            }
        `;

        // שליחת הבקשה ל-Gemini
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // המרת הטקסט לאובייקט JS רגיל
        return JSON.parse(responseText);

    } catch (error) {
        console.error("❌ Error in geminiService:", error);
        throw new Error("Failed to generate mission content from AI");
    }
};

module.exports = {
    generateMissionContent
};