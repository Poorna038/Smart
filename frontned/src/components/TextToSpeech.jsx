import { useState } from "react";
import API from "../api";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [audio, setAudio] = useState("");

  async function generateSpeech() {
    if (!text.trim()) return;

    try {
      const res = await API.post("/ai/speech", {
        text,
        lang,
      });

      setAudio(res.data.audioUrl);
    } catch {
      alert("Speech failed");
    }
  }

  return (
    <section className="page">
      <h1>Text to Speech</h1>

      <div className="tts-box">
        <textarea
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="fr">French</option>
        </select>

        <button onClick={generateSpeech} className="btn primary">
          Generate Speech
        </button>

        {audio && <audio controls src={audio} />}
      </div>
    </section>
  );
}