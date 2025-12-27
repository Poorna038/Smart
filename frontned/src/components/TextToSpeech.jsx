import { useState } from "react";
import axios from "axios";

const API = "https://smart-gqig.onrender.com";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState("en");
  const [audioSrc, setAudioSrc] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateSpeech() {
    if (!text.trim() && !file) {
      alert("Enter text or upload a document");
      return;
    }

    setLoading(true);
    setAudioSrc("");

    try {
      let finalText = text;

      // -------- DOCUMENT TRANSLATION --------
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("target", lang);

        const res = await axios.post(
          `${API}/translate-document`,
          formData
        );

        finalText = res.data.translated;
      }

      // -------- TEXT TO SPEECH --------
      const tts = await axios.post(
        `${API}/text-to-speech`,
        {
          text: finalText,
          lang: lang,
        }
      );

      // IMPORTANT: FULL BACKEND URL
      setAudioSrc(`${API}/audio/${tts.data.audio}`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate speech");
    }

    setLoading(false);
  }

  return (
    <section className="page">
      <h1>Text to Speech</h1>

      <div className="section convert-grid">
        <div className="card">
          <h3>Input</h3>

          <textarea
            placeholder="Paste text here"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept=".txt,.docx,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginTop: 12 }}
          />
        </div>

        <div className="card">
          <h3>Audio Output</h3>

          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="fr">French</option>
          </select>

          <button
            className="btn primary"
            style={{ marginTop: 20 }}
            onClick={generateSpeech}
            disabled={loading}
          >
            {loading ? "Processing..." : "Generate Speech"}
          </button>

          {audioSrc && (
            <audio
              controls
              src={audioSrc}
              style={{ marginTop: 20, width: "100%" }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
