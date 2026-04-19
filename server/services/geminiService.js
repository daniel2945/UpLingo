const { GoogleGenerativeAI } = require("@google/generative-ai");

// אתחול ה-SDK עם מפתח ה-API מהסביבה
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * פונקציה גנרית לשליחת פרומפטים וקבלת JSON מ-Gemini
 * @param {String} prompt - ההנחיות המלאות שהקונטרולר של המנהל הרכיב
 */
const generateRawContent = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const result = await model.generateContent(prompt);
        // מחזירים רק את הטקסט. הקונטרולר שקרא לפונקציה כבר יעשה לזה JSON.parse
        return result.response.text(); 

    } catch (error) {
        console.error("❌ Error in geminiService:", error);
        throw new Error("Failed to generate raw content from AI");
    }
};

module.exports = {
    generateRawContent
};