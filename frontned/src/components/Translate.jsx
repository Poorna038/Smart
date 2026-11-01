import { useState } from "react";
import API from "../api";

export default function Translate() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [lang, setLang] = useState("es");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleTranslate() {
    if (!text.trim()) {
      alert("Please enter some text");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/translate", {
        text: text,
        target: lang,
      });

      if (res.data.success) {
        setResult(res.data.translated || res.data.result || "");
      } else {
        alert(res.data.error || "Translation failed");
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileTranslate() {
    if (!file) {
      alert("Please select a document");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("target", lang);

    setLoading(true);

    try {
      const res = await API.post(
        "/translate-document",
        formData
      );

      if (res.data.success) {
        setResult(res.data.result || "");
      } else {
        alert(res.data.error || "File translation failed");
      }
    } catch (error) {
      console.error("File translation error:", error);
      alert("File translation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">

      <h1>Language Translation</h1>

      <div className="translate-wrapper">

        {/* LEFT SIDE */}
        <div className="box">

          <h3>Input</h3>

          <textarea
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={handleTranslate}
            className="btn primary"
            disabled={loading}
          >
            {loading ? "Translating..." : "Translate Text"}
          </button>

          <div className="upload-box">

            <h3>Upload Document</h3>

            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
            />

            <button
              onClick={handleFileTranslate}
              className="btn secondary"
              disabled={loading}
            >
              {loading
                ? "Translating..."
                : "Translate Document"}
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="box">

          <h3>Output Language</h3>

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="hi">Hindi</option>
            <option value="kn">Kannada</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="ml">Malayalam</option>
            <option value="de">German</option>
          </select>

          <h3>Translated Text</h3>

          <textarea
            value={result}
            readOnly
            placeholder="Translation will appear here..."
          />

        </div>

      </div>

    </section>
  );
}