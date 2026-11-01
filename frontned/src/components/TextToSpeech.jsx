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
}import { useState } from "react";
import API from "../api";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [audio, setAudio] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateSpeech() {
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }

    setLoading(true);
    setAudio("");

    try {
      const res = await API.post("/text-to-speech", {
        text: text,
        lang: lang,
      });

      if (!res.data.success) {
        throw new Error(res.data.error || "Speech generation failed");
      }

      // FastAPI returns the filename
      const filename = res.data.audio;

      // Build the complete audio URL
      const audioUrl = `${API.defaults.baseURL}/audio/${filename}`;

      setAudio(audioUrl);
    } catch (error) {
      console.error("Speech error:", error);
      alert(error.response?.data?.error || "Speech failed");
    } finally {
      setLoading(false);
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

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="kn">Kannada</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="ml">Malayalam</option>
          <option value="bn">Bengali</option>
          <option value="mr">Marathi</option>
          <option value="gu">Gujarati</option>
          <option value="pa">Punjabi</option>
          <option value="ur">Urdu</option>

          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh-CN">Chinese</option>
        </select>

        <button
          onClick={generateSpeech}
          className="btn primary"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Speech"}
        </button>

        {audio && (
          <div className="audio-result">
            <p>Speech generated successfully:</p>
            <audio controls src={audio}>
              Your browser does not support audio.
            </audio>
          </div>
        )}
      </div>
    </section>
  );
}