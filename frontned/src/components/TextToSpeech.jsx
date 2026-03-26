import { useState } from "react";
import API from "../api";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [audioSrc, setAudioSrc] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateSpeech() {
    if (!text.trim()) {
      alert("Enter text");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/ai/speech", {
        text,
        lang,
      });

      setAudioSrc(res.data.audioUrl);
    } catch {
      alert("Failed to generate speech");
    }

    setLoading(false);
  }

  return (
    <section className="page">
      <h1>Text to Speech</h1>

      <textarea
        placeholder="Enter text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="fr">French</option>
      </select>

      <button onClick={generateSpeech} className="btn primary">
        {loading ? "Processing..." : "Generate Speech"}
      </button>

      {audioSrc && <audio controls src={audioSrc} />}
    </section>
  );
}