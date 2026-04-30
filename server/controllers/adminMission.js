const GrammarRule = require("../models/GrammarRule");
const Vocabulary = require("../models/Vocabulary");
const Mission = require("../models/Mission");
const geminiService = require("../services/geminiService");

const generateMissionDraft = async (req, res) => {
  try {
    // קבלת ההנחיה הכללית לשיעור (lessonPrompt)
    const { grammarRuleId, targetVocabIds, reviewVocabIds, cardCounts, lessonPrompt } = req.body;

    const rule = await GrammarRule.findById(grammarRuleId);
    
    const targetWords = targetVocabIds && targetVocabIds.length > 0 
      ? await Vocabulary.find({ _id: { $in: targetVocabIds } }) 
      : [];
      
    const reviewWords = reviewVocabIds && reviewVocabIds.length > 0
      ? await Vocabulary.find({ _id: { $in: reviewVocabIds } })
      : [];

    if (!rule) {
      return res.status(400).json({ message: "Must provide a valid Grammar Rule or Topic." });
    }

    const counts = cardCounts || { concept: 2, flashcard: 3, multiple_choice: 3, build_sentence: 2 };
    const totalCards = counts.concept + counts.flashcard + counts.multiple_choice + counts.build_sentence;

    const languageMap = { 
        en: "English", 
        es: "Spanish", 
        fr: "French", 
        de: "German" 
    };
    
    const targetLanguage = languageMap[rule.language] || "English";

    const targetWordsList = targetWords.length > 0
      ? targetWords.map((w) => `${w.word} (${w.translation})`).join(", ")
      : "NO TARGET VOCABULARY PROVIDED.";
      
    const reviewWordsList = reviewWords.length > 0
        ? reviewWords.map((w) => `${w.word} (${w.translation})`).join(", ")
        : "None";

    // שילוב ההנחיה הספציפית של המשתמש לכלל השיעור
    const customLessonInstruction = lessonPrompt 
      ? `\n*** USER SPECIFIC LESSON THEME/INSTRUCTION: "${lessonPrompt}". You MUST follow this theme/instruction throughout the entire lesson deck. ***\n`
      : "";

    const prompt = `
    You are an expert ${targetLanguage} language teacher creating materials for HEBREW speakers.
    
    TASK: Create a lesson deck of EXACTLY ${totalCards} cards to teach the topic: "${rule.ruleName}".
    
    CARD DISTRIBUTION MUST BE STRICTLY:
    - ${counts.concept} cards of type "concept"
    - ${counts.flashcard} cards of type "flashcard"
    - ${counts.multiple_choice} cards of type "multiple_choice"
    - ${counts.build_sentence} cards of type "build_sentence"
    
    LESSON CONTEXT:
    - Topic / Grammar Rule: ${rule.ruleName}
    - Teaching Instructions: ${rule.aiInstruction}
    - Target Vocabulary: ${targetWordsList}
    - Allowed Review Vocabulary: ${reviewWordsList}
    ${customLessonInstruction}
    
    *** VOCABULARY & NATURAL CONTEXT RULES - READ CAREFULLY ***
    1. Natural Sentences: All sentences you create MUST be logical, meaningful, and represent real-life, everyday situations. Do NOT create robotic, weird, or nonsensical combinations just to fit words together.
    2. Primary Focus: You MUST prioritize using the words from the "Target Vocabulary" list. 
    3. Contextual Freedom: If the provided Target Vocabulary words cannot form a natural-sounding sentence on their own, you ARE ALLOWED to use extra words to build context. HOWEVER, any extra words you use MUST be absolute beginner (A1) level. NEVER use intermediate or advanced vocabulary.
    4. If NO Target Vocabulary is provided, generate sentences based entirely on the "Teaching Instructions" using only ultra-basic A1 vocabulary.
    
    GENERAL RULES:
    1. bridge_language: All explanations, titles, and instructions MUST be in HEBREW (עברית).
    2. learning_language: All examples, target words, and correct answers MUST be in ${targetLanguage}.
    3. CONCEPT CARDS EXCELLENCE: The 'text' in concept cards MUST act as a clear, highly structured cheat-sheet. You MUST include: 
       - A concise and clear explanation of the rule.
       - Conjugations or paradigms if applicable (e.g., I am, You are, He is).
       - Structural formulas if applicable (e.g., Subject + Verb + Object).
       - 1 or 2 very clear examples.
       - Use newline characters (\\n) to format the text beautifully with spacing so it's easy to read. DO NOT write one giant block of text.
    
    JSON FORMAT RULES:
    - concept: { "type": "concept", "title": "כותרת קצרה בעברית", "text": "הסבר מקיף, כולל חוקים, הטיות, מבנה ודוגמאות, מופרד בשורות חדשות (\\n)" }
    - flashcard: { "type": "flashcard", "word": "word/phrase in ${targetLanguage}", "translation": "תרגום לעברית" }
    - multiple_choice: { "type": "multiple_choice", "question": "שאלה בעברית או ב-${targetLanguage}", "options": ["..."], "correctAnswer": "..." }
    - build_sentence: { "type": "build_sentence", "question": "תרגם ל-${targetLanguage}: [משפט בעברית]", "options": ["word1", "word2"], "correctAnswer": ["word1", "word2"] }
    
    Return ONLY a valid JSON ARRAY. No markdown wrapping.
    `;

    const draftCards = await geminiService.generateRawContent(prompt);

    res.status(200).json({
      success: true,
      ruleName: rule.ruleName,
      draftCards: JSON.parse(draftCards),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate draft", error: error.message });
  }
};

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
      language,
      grammarRuleRef: grammarRuleId,
      targetVocabularyRefs: targetVocabIds,
      reviewVocabularyRefs: reviewVocabIds,
      cards: finalCards,
      isPublished: true,
    });

    await newMission.save();

    if (targetVocabIds && targetVocabIds.length > 0) {
      await Vocabulary.updateMany(
        { _id: { $in: targetVocabIds } },
        { $set: { isTaught: true } }
      );
    }

    if (grammarRuleId) {
      await GrammarRule.findByIdAndUpdate(grammarRuleId, { $set: { isTaught: true } });
    }

    res.status(201).json({
      success: true,
      mission: newMission,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to publish", error: error.message });
  }
};

const getNextMissionOrder = async (req, res) => {
  try {
    const { lang } = req.query;
    const lastMission = await Mission.findOne({ language: lang }).sort({
      missionOrder: -1,
    });
    const nextOrder = lastMission ? lastMission.missionOrder + 1 : 1;
    res.json({ nextOrder });
  } catch (error) {
    res.status(500).json({ message: "Error finding next order" });
  }
};

const getAdminMissions = async (req, res) => {
  try {
    const { lang } = req.query;
    const missions = await Mission.find({ language: lang })
      .sort({ missionOrder: 1 })
      .populate('grammarRuleRef', 'ruleName');
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch missions", error: error.message });
  }
};

const deleteMission = async (req, res) => {
  try {
    const { id } = req.params;
    await Mission.findByIdAndDelete(id);
    res.json({ success: true, message: "Mission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete mission", error: error.message });
  }
};

const generateMissionTitle = async (req, res) => {
  try {
    const { grammarRuleId, targetVocabIds } = req.body;

    const rule = await GrammarRule.findById(grammarRuleId);
    if (!rule) {
      return res.status(400).json({ message: "Rule is required to generate a title" });
    }

    const targetWords = targetVocabIds && targetVocabIds.length > 0 
      ? await Vocabulary.find({ _id: { $in: targetVocabIds } }) 
      : [];

    const wordsText = targetWords.length > 0 
      ? targetWords.map(w => w.word).join(', ') 
      : 'ללא מילים ספציפיות';

    const languageMap = { en: "English", es: "Spanish", fr: "French", de: "German" };
    const targetLanguage = languageMap[rule.language] || "English";

    const prompt = `
    You are an expert language teacher.
    Generate a SHORT, catchy, and descriptive lesson title in HEBREW (עברית) for a ${targetLanguage} lesson.
    
    Context:
    - Grammar Topic / Rule: ${rule.ruleName}
    - Words included in lesson: ${wordsText}

    Return ONLY the title in Hebrew. No quotation marks, no extra text, no explanations, just the title itself. Maximum 4-6 words.
    Example output: "זמן הווה פשוט - היכרות" or "משפחה וצבעים בסיסיים"
    `;

    const rawTitle = await geminiService.generateRawContent(prompt);
    const cleanTitle = rawTitle.replace(/["']/g, '').trim();

    res.status(200).json({ title: cleanTitle });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate title", error: error.message });
  }
};

const generateSingleCard = async (req, res) => {
  try {
    const { grammarRuleId, targetVocabIds, cardType, userPrompt } = req.body;

    const rule = await GrammarRule.findById(grammarRuleId);
    if (!rule) return res.status(400).json({ message: "Rule is required" });

    const targetWords = targetVocabIds && targetVocabIds.length > 0 
      ? await Vocabulary.find({ _id: { $in: targetVocabIds } }) 
      : [];

    const languageMap = { en: "English", es: "Spanish", fr: "French", de: "German" };
    const targetLanguage = languageMap[rule.language] || "English";
    
    const targetWordsList = targetWords.length > 0
      ? targetWords.map((w) => `${w.word} (${w.translation})`).join(", ")
      : "Basic A1 vocabulary";

    const customInstruction = userPrompt 
      ? `USER SPECIFIC INSTRUCTION: "${userPrompt}". Follow this instruction strictly while creating the card.`
      : `Create a creative and educational card based on the lesson topic.`;

    const prompt = `
    You are an expert ${targetLanguage} language teacher creating materials for HEBREW speakers.
    
    TASK: Generate EXACTLY ONE lesson card of type: "${cardType}" for the topic: "${rule.ruleName}".
    
    ${customInstruction}

    Context Rules:
    - Grammar Topic: ${rule.ruleName}
    - AI Teaching Guideline: ${rule.aiInstruction}
    - Allowed Vocabulary: ${targetWordsList}
    
    FORMAT RULES (Return ONLY a JSON OBJECT):
    - If concept: { "type": "concept", "title": "כותרת בעברית", "text": "הסבר מפורט בעברית עם \\n" }
    - If flashcard: { "type": "flashcard", "word": "word/phrase in ${targetLanguage}", "translation": "תרגום לעברית" }
    - If multiple_choice: { "type": "multiple_choice", "question": "השאלה", "options": ["אפשרות 1", "אפשרות 2", "אפשרות 3"], "correctAnswer": "אפשרות 1" }
    - If build_sentence: { "type": "build_sentence", "question": "תרגם ל-${targetLanguage}: [משפט]", "options": ["word1", "word2"], "correctAnswer": ["word1", "word2"] }
    
    IMPORTANT: Return ONLY raw JSON. No markdown code blocks.
    `;

    const rawCard = await geminiService.generateRawContent(prompt);
    const cleanJson = rawCard.replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.status(200).json({ card: JSON.parse(cleanJson) });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate card", error: error.message });
  }
};

module.exports = {
  generateMissionDraft,
  publishMission,
  getNextMissionOrder,
  getAdminMissions,
  deleteMission,
  generateMissionTitle,
  generateSingleCard
};