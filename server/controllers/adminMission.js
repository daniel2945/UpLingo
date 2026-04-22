const Mission = require("../models/Mission");
const Vocabulary = require("../models/Vocabulary");
const GrammarRule = require("../models/GrammarRule");
const geminiService = require("../services/geminiService");

/**
 * שלב 1: יצירת טיוטת שיעור בעזרת ה-AI (לא נשמר ב-DB עדיין!)
 * POST /api/admin/missions/generate
 */
const generateMissionDraft = async (req, res) => {
  try {
    const { grammarRuleId, targetVocabIds, reviewVocabIds } = req.body;

    // 1. שולפים את כל הנתונים מהמאגרים שלנו
    const rule = await GrammarRule.findById(grammarRuleId);
    const targetWords = await Vocabulary.find({ _id: { $in: targetVocabIds } });
    const reviewWords = reviewVocabIds
      ? await Vocabulary.find({ _id: { $in: reviewVocabIds } })
      : [];

    if (!rule || !targetWords.length) {
      return res
        .status(400)
        .json({ message: "Must provide valid Grammar Rule and Target Words." });
    }

    const languageMap = {
      en: "English",
      es: "Spanish",
      fr: "French",
      he: "Hebrew",
    };

    // מוצאים את השם המלא של השפה (אם אין, ברירת המחדל תהיה אנגלית)
    const targetLanguage = languageMap[rule.language] || "English";

    // 2. מכינים את הרשימות כטקסט עבור ג'מיני
    const targetWordsList = targetWords
      .map((w) => `${w.word} (${w.translation})`)
      .join(", ");
    const reviewWordsList =
      reviewWords.length > 0
        ? reviewWords.map((w) => `${w.word} (${w.translation})`).join(", ")
        : "None";

    // 3. בונים את הפרומפט האגרסיבי
const prompt = `
    You are an expert ${targetLanguage} language teacher. 
    The target audience are HEBREW speakers.
    
    Create a lesson deck of EXACTLY 10 cards to teach ${rule.ruleName} in ${targetLanguage}.
    
    - Grammar Rule: ${rule.ruleName}
    - Teaching Instructions: ${rule.aiInstruction}
    - MANDATORY Target Vocabulary: ${targetWordsList}
    - Allowed Review Vocabulary: ${reviewWordsList}
    
    CRITICAL RULES:
    1. bridge_language: All explanations, titles, and translations MUST be in HEBREW (עברית).
    2. learning_language: All examples, words, and correct answers MUST be in ${targetLanguage}.
    3. Progression: Concept -> Flashcard -> Multiple Choice -> Build Sentence.
    
    JSON FORMAT RULES:
    - concept: { "type": "concept", "title": "כותרת בעברית", "text": "הסבר דקדוקי בעברית" }
    - flashcard: { "type": "flashcard", "word": "word in ${targetLanguage}", "translation": "תרגום לעברית" }
    - multiple_choice: { "type": "multiple_choice", "question": "שאלה בעברית או ב-${targetLanguage}", "options": ["..."], "correctAnswer": "..." }
    - build_sentence: { "type": "build_sentence", "question": "תרגם ל-${targetLanguage}: [משפט בעברית]", "options": ["word1", "word2"], "correctAnswer": ["word1", "word2"] }
    
    Return ONLY a JSON ARRAY.
`;
    // 4. שולחים ל-AI (נצטרך לעדכן את השירות הזה בהמשך שיקבל את הפרומפט הזה)
    const draftCards = await geminiService.generateRawContent(prompt);

    // 5. מחזירים את הטיוטה למנהל (כדי שיוכל לערוך אותה ב-React)
    res.status(200).json({
      success: true,
      ruleName: rule.ruleName,
      draftCards: JSON.parse(draftCards),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to generate draft", error: error.message });
  }
};

/**
 * שלב 2: שמירת השיעור הסופי ועדכון מאגר המילים
 * POST /api/admin/missions/publish
 */
const publishMission = async (req, res) => {
  try {
    const {
      missionOrder,
      title,
      language,
      grammarRuleId,
      targetVocabIds,
      reviewVocabIds,
      finalCards,
    } = req.body;

    const newMission = new Mission({
      missionOrder,
      title,
      language, // פה הייתה הטעות! שלחנו קודם topic, עכשיו זה תואם לסכימה שלך
      grammarRuleRef: grammarRuleId,
      targetVocabularyRefs: targetVocabIds,
      reviewVocabularyRefs: reviewVocabIds,
      isPublished: true,
      cards: finalCards,
    });

    await newMission.save();

    if (targetVocabIds && targetVocabIds.length > 0) {
      await Vocabulary.updateMany(
        { _id: { $in: targetVocabIds } },
        { $set: { isTaught: true } },
      );
    }

    await GrammarRule.findByIdAndUpdate(grammarRuleId, { isTaught: true });

    res.status(201).json({ success: true, mission: newMission });
  } catch (error) {
    console.error("Backend Error in publishMission:", error); // יעזור לנו לראות שגיאות בעתיד
    res
      .status(500)
      .json({ message: "Failed to publish mission", error: error.message });
  }
};

const getNextMissionOrder = async (req, res) => {
  try {
    const lang = req.query.lang || "en";
    // מחפשים רק משימות של השפה הספציפית
    const lastMission = await Mission.findOne({ language: lang }).sort({
      missionOrder: -1,
    });
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
  getNextMissionOrder,
};
