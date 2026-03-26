import { useState } from "react";
import API from "../api";

export default function Translate() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState(null);
  const [docTranslated, setDocTranslated] = useState("");
  const [docLoading, setDocLoading] = useState(false);

  // ✅ TEXT TRANSLATION
  async function handleTranslate() {
    if (!sourceText.trim()) return;

    setLoading(true);
    setError("");
    setTranslatedText("");

    try {
      const res = await API.post("/ai/translate", {
        text: sourceText,
        target: targetLang,
      });

      setTranslatedText(res.data.result);
    } catch (err) {
      setError("Translation failed");
    }

    setLoading(false);
  }

  // ✅ DOCUMENT TRANSLATION
  async function handleDocumentTranslate() {
    if (!file) return;

    setDocLoading(true);
    setDocTranslated("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target", targetLang);

    try {
      const res = await API.post("/ai/translate-document", formData);

      setDocTranslated(res.data.result);
    } catch {
      setDocTranslated("Error translating document");
    }

    setDocLoading(false);
  }

  return (
    <section className="page">
      <h1>Language Translation</h1>

      <div className="section convert-grid">
        <div className="card">
          <h3>Input</h3>

          <textarea
            placeholder="Type text here"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />

          <button
            className="btn primary"
            onClick={handleTranslate}
            disabled={loading}
          >
            {loading ? "Translating..." : "Translate Text"}
          </button>

          <hr />

          <h4>Upload Document</h4>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="btn secondary"
            onClick={handleDocumentTranslate}
            disabled={docLoading}
          >
            {docLoading ? "Translating..." : "Translate Document"}
          </button>
        </div>

        <div className="card">
          <h3>Output</h3>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
          </select>

          <textarea
            value={translatedText || docTranslated}
            readOnly
            placeholder={
              loading || docLoading
                ? "Processing..."
                : error || "Translated text appears here"
            }
          />
        </div>
      </div>
    </section>
  );
}