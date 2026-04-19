const mongoose = require("mongoose");

// אותה סכימת כרטיסיות שדיברנו עליה (מקוצרת פה לנוחות)
const CardSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["concept", "flashcard", "multiple_choice", "build_sentence"],
  },
  title: String,
  text: String,
  word: String,
  translation: String,
  question: String,
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
});

const MissionSchema = new mongoose.Schema(
  {
    missionOrder: { type: Number, required: true, unique: true }, // שלב 1, 2, 3...
    title: { type: String, required: true },

    // הקישורים החכמים למאגרים שלנו (References):
    grammarRuleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrammarRule",
    },
    targetVocabularyRefs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Vocabulary" },
    ], // המילים החדשות (הדגש המרכזי)
    reviewVocabularyRefs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Vocabulary" },
    ], // המילים שכבר נלמדו ("לזרוק פה ושם")

    isPublished: { type: Boolean, default: false }, // פורסם לתלמידים?
    cards: [CardSchema], // המערך הסופי שה-AI ייצר ואתה אישרת!
  },
  { timestamps: true },
);

module.exports = mongoose.model("Mission", MissionSchema);
