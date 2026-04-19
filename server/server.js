require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const missionRouter = require("./routes/mission");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:");
    console.error(err.message);
    process.exit(1);
  });

// 2. מגדירים ראוטים
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "UpLingo Engine is running! 🚀",
  });
});

// ייבוא ושימוש בראוטים
app.use("/api/auth", authRouter);
app.use("/api/missions", missionRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

// 3. מדליקים את השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`=================================`);
});
