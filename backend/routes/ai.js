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
const translate = require("@vitalets/google-translate-api");

router.post("/translate", async (req, res) => {
  try {
    const { text, target } = req.body;

    const result = await translate(text, { to: target });

    res.json({ result: result.text });
  } catch (err) {
    res.status(500).json({ error: "Translation failed" });
  }
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
const gTTS = require("gtts");

router.post("/speech", async (req, res) => {
  try {
    const { text, lang } = req.body;

    const filename = `speech-${Date.now()}.mp3`;
    const filepath = `uploads/${filename}`;

    const gtts = new gTTS(text, lang);
    gtts.save(filepath, () => {
      res.json({
        audioUrl: `http://localhost:5000/uploads/${filename}`,
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Speech failed" });
  }
});

module.exports = router;