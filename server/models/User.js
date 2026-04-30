const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // מונע בעיות של אותיות גדולות וקטנות
      trim: true, // מוחק רווחים מיותרים בטעות בהתחלה או בסוף
    },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

// ייצוא המודל (שים לב שזה קורא ל-userSchema עם u קטנה)
module.exports = mongoose.model("User", userSchema);
