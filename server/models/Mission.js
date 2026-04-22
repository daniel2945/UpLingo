const mongoose = require("mongoose");

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
    missionOrder: { type: Number, required: true }, // שים לב: הורדנו את ה-unique מפה!
    title: { type: String, required: true },

    grammarRuleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrammarRule",
    },
    targetVocabularyRefs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Vocabulary" },
    ], 
    reviewVocabularyRefs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Vocabulary" },
    ], // המילים שכבר נלמדו ("לזרוק פה ושם")
    
    language: {
      type: String,
      required: true,
      enum: ["en", "es"],
      default: "en",
    }, 

    isPublished: { type: Boolean, default: false },
    cards: [CardSchema],
  },
  { timestamps: true },
);

// האינדקס החכם: מותר שיהיה שיעור 1 בספרדית ושיעור 1 באנגלית, אבל לא פעמיים שיעור 1 באנגלית
MissionSchema.index({ language: 1, missionOrder: 1 }, { unique: true });

module.exports = mongoose.model("Mission", MissionSchema);