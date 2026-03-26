const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const translate = require("@vitalets/google-translate-api");
const gTTS = require("gtts");

// ---------------- FILE UPLOAD ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ---------------- TRANSLATE ----------------
router.post("/translate", async (req, res) => {
  try {
    const { text, target } = req.body;

    const result = await translate(text, { to: target });

    res.json({ result: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

// ---------------- DOCUMENT TRANSLATE ----------------
router.post("/translate-document", upload.single("file"), async (req, res) => {
  try {
    const content = fs.readFileSync(req.file.path, "utf-8");

    const result = await translate(content, { to: req.body.target });

    res.json({ result: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File processing failed" });
  }
});

// ---------------- TEXT TO SPEECH ----------------
router.post("/speech", async (req, res) => {
  try {
    const { text, lang } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text required" });
    }

    const filename = `speech-${Date.now()}.mp3`;
    const filepath = path.join(__dirname, "../uploads", filename);

    const gtts = new gTTS(text, lang || "en");

    gtts.save(filepath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "TTS failed" });
      }

      res.json({
        audioUrl: `https://smart-gqig.onrender.com/uploads/${filename}`,
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;