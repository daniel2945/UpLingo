const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // תלוי באיזו ספריה אתה משתמש אצלך

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" }
  },
  { timestamps: true }
);

// הפונקציה שלך משורה 18 שעושה את ההצפנה (אמורה להיראות בערך ככה)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ייצוא המודל (שים לב שזה קורא ל-userSchema עם u קטנה)
module.exports = mongoose.model("User", userSchema);