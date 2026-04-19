const Mission = require('../models/Mission');
const Vocabulary = require('../models/Vocabulary');
const GrammarRule = require('../models/GrammarRule');
const geminiService = require('../services/geminiService');

/**
 * שלב 1: יצירת טיוטת שיעור בעזרת ה-AI (לא נשמר ב-DB עדיין!)
 * POST /api/admin/missions/generate
 */
const generateMissionDraft = async (req, res) => {
    try {
        const { grammarRuleId, targetVocabIds, reviewVocabIds } = req.body;

        // 1. שולפים את כל הנתונים מהמאגרים שלנו
        const rule = await GrammarRule.findById(grammarRuleId);
        const targetWords = await Vocabulary.find({ '_id': { $in: targetVocabIds } });
        const reviewWords = reviewVocabIds ? await Vocabulary.find({ '_id': { $in: reviewVocabIds } }) : [];

        if (!rule || !targetWords.length) {
            return res.status(400).json({ message: "Must provide valid Grammar Rule and Target Words." });
        }

        // 2. מכינים את הרשימות כטקסט עבור ג'מיני
        const targetWordsList = targetWords.map(w => `${w.word} (${w.translation})`).join(', ');
        const reviewWordsList = reviewWords.length > 0 
            ? reviewWords.map(w => `${w.word} (${w.translation})`).join(', ') 
            : 'None';

        // 3. בונים את הפרומפט האגרסיבי
        const prompt = `
            You are an expert curriculum designer for a language learning app.
            Create a lesson deck of EXACTLY 10 cards to teach a specific grammar rule.
            
            - Grammar Rule to teach: ${rule.ruleName}
            - Teaching Instructions: ${rule.aiInstruction}
            - MANDATORY Target Vocabulary (Focus on these): ${targetWordsList}
            - Allowed Review Vocabulary (Sprinkle these in): ${reviewWordsList}
            
            CRITICAL RULES:
            1. DO NOT use any advanced vocabulary outside of these lists and basic A1 connectors (y, en, el, la).
            2. Build the lesson progressively: Concept -> Flashcard -> Multiple Choice -> Build Sentence.
            
            Return a JSON ARRAY of objects. Each object must fit this format based on its type:
            - concept: { "type": "concept", "title": "...", "text": "..." }
            - flashcard: { "type": "flashcard", "word": "...", "translation": "..." }
            - multiple_choice: { "type": "multiple_choice", "question": "...", "options": ["...","...","...","..."], "correctAnswer": "..." }
            - build_sentence: { "type": "build_sentence", "question": "translate to spanish: ...", "options": ["...","...","..."], "correctAnswer": ["...", "..."] }
        `;

        // 4. שולחים ל-AI (נצטרך לעדכן את השירות הזה בהמשך שיקבל את הפרומפט הזה)
        const draftCards = await geminiService.generateRawContent(prompt);

        // 5. מחזירים את הטיוטה למנהל (כדי שיוכל לערוך אותה ב-React)
        res.status(200).json({
            success: true,
            ruleName: rule.ruleName,
            draftCards: JSON.parse(draftCards)
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to generate draft", error: error.message });
    }
};

/**
 * שלב 2: שמירת השיעור הסופי ועדכון מאגר המילים
 * POST /api/admin/missions/publish
 */
const publishMission = async (req, res) => {
    try {
        const { missionOrder, title, grammarRuleId, targetVocabIds, reviewVocabIds, finalCards } = req.body;

        const newMission = new Mission({
            missionOrder,
            title, // פה הייתה הטעות! שלחנו קודם topic, עכשיו זה תואם לסכימה שלך
            grammarRuleRef: grammarRuleId,
            targetVocabularyRefs: targetVocabIds,
            reviewVocabularyRefs: reviewVocabIds,
            isPublished: true,
            cards: finalCards
        });

        await newMission.save();

        if (targetVocabIds && targetVocabIds.length > 0) {
            await Vocabulary.updateMany({ _id: { $in: targetVocabIds } }, { $set: { isTaught: true } });
        }

        await GrammarRule.findByIdAndUpdate(grammarRuleId, { isTaught: true });

        res.status(201).json({ success: true, mission: newMission });
    } catch (error) {
        console.error("Backend Error in publishMission:", error); // יעזור לנו לראות שגיאות בעתיד
        res.status(500).json({ message: "Failed to publish mission", error: error.message });
    }
};

const getNextMissionOrder = async (req, res) => {
    try {
        // מוצא את המשימה עם ה-order הכי גבוה
        const lastMission = await Mission.findOne().sort({ missionOrder: -1 });
        const nextOrder = lastMission ? lastMission.missionOrder + 1 : 1;
        res.json({ nextOrder });
    } catch (error) {
        res.status(500).json({ message: "Error fetching next order" });
    }
};

// אל תשכח לייצא ולחבר לראוט GET ב-routes/admin.js

module.exports = {
    generateMissionDraft,
    publishMission,
    getNextMissionOrder
};