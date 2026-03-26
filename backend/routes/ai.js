const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ---------------- FILE UPLOAD SETUP ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ---------------- TEXT TRANSLATE ----------------
router.post("/translate", async (req, res) => {
  const { text, target } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  // 🔥 MOCK AI (replace later with OpenAI)
  const translated = `[${target}] ${text}`;

  res.json({ result: translated });
});

// ---------------- DOCUMENT TRANSLATE ----------------
router.post("/translate-document", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Read file (only works properly for .txt)
    const content = fs.readFileSync(filePath, "utf-8");

    const translated = `Translated Document:\n${content}`;

    res.json({ result: translated });
  } catch (err) {
    res.status(500).json({ error: "File processing failed" });
  }
});

// ---------------- TEXT TO SPEECH ----------------
router.post("/speech", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  // 🔥 Mock audio (replace later with real TTS)
  const fakeAudioUrl =
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  res.json({ audioUrl: fakeAudioUrl });
});

module.exports = router;