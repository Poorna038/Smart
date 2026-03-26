import { useState } from "react";
import API from "../api";

export default function Translate() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [lang, setLang] = useState("es");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleTranslate() {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await API.post("/ai/translate", {
        text,
        target: lang,
      });
      setResult(res.data.result);
    } catch {
      alert("Translation failed");
    }
    setLoading(false);
  }

  async function handleFileTranslate() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target", lang);

    setLoading(true);
    try {
      const res = await API.post("/ai/translate-document", formData);
      setResult(res.data.result);
    } catch {
      alert("File translation failed");
    }
    setLoading(false);
  }

  return (
    <section className="page">
      <h1>Language Translation</h1>

      <div className="translate-wrapper">
        {/* LEFT */}
        <div className="box">
          <h3>Input</h3>

          <textarea
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button onClick={handleTranslate} className="btn primary">
            {loading ? "Translating..." : "Translate Text"}
          </button>

          <div className="upload-box">
            <p>Upload Document</p>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleFileTranslate} className="btn secondary">
              Translate Document
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="box">
          <h3>Output</h3>

          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="hi">Hindi</option>
            <option value="de">German</option>
          </select>

          <textarea value={result} readOnly />
        </div>
      </div>
    </section>
  );
}