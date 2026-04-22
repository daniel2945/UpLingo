const express = require("express");
const toolsRouter = express.Router();
const { translateText, generateReadingPassage } = require("../controllers/tools");

toolsRouter.post("/translate", translateText);
toolsRouter.post("/generate-story", generateReadingPassage);

module.exports = toolsRouter;