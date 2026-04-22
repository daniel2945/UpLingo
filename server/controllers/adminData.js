const Vocabulary = require('../models/Vocabulary');
const GrammarRule = require('../models/GrammarRule');

// --- Vocabulary ---
const getVocabulary = async (req, res) => {
  try {
    // לוקחים את השפה מהבקשה, או שמים אנגלית כברירת מחדל
    const lang = req.query.lang || 'en'; 
    const vocab = await Vocabulary.find({ language: lang }).sort({ createdAt: -1 });
    res.json(vocab);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vocabulary", error: error.message });
  }
};

const addVocabulary = async (req, res) => {
    try {
        const newWord = new Vocabulary(req.body);
        await newWord.save();
        res.status(201).json(newWord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteVocabulary = async (req, res) => {
    try {
        const { id } = req.params;
        await Vocabulary.findByIdAndDelete(id);
        res.json({ success: true, message: "Word deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete word", error: error.message });
    }
};

// --- Grammar Rules ---
const getRules = async (req, res) => {
    try {
        // סינון חוקים לפי השפה, פלוס מיון הגיוני לפי הרמה (A1, A2...)
        const lang = req.query.lang || 'en';
        const rules = await GrammarRule.find({ language: lang }).sort({ level: 1 });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rules", error: error.message });
    }
};

const addRule = async (req, res) => {
    try {
        const newRule = new GrammarRule(req.body);
        await newRule.save();
        res.status(201).json(newRule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteRule = async (req, res) => {
    try {
        await GrammarRule.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete rule", error: error.message });
    }
};

module.exports = {
    getVocabulary, 
    addVocabulary, 
    deleteVocabulary,
    getRules, 
    addRule, 
    deleteRule
};