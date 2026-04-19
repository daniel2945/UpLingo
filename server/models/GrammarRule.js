const mongoose = require("mongoose");

const GrammarRuleSchema = new mongoose.Schema(
  {
    ruleName: { type: String, required: true, unique: true }, 
    level: { 
      type: String, 
      required: true,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], // <--- הנה הנעילה!
      default: 'A1'
    }, 
    adminNotes: { type: String }, 
    aiInstruction: {
      type: String,
      required: true,
    },
    isTaught: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GrammarRule", GrammarRuleSchema);