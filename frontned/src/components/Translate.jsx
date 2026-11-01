import { useState } from "react";
import API from "../api";

export default function Translate() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [lang, setLang] = useState("es");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  async function handleTranslate() {
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await API.post("/translate", {
        text: text.trim(),
        target: lang,
      });

      console.log("Translation response:", res.data);

      const translated =
        res.data.result ||
        res.data.translated ||
        res.data.translation;

      if (!translated) {
        throw new Error(
          res.data.error || "Translation was not returned."
        );
      }

      setResult(translated);
    } catch (error) {
      console.error("Translation error:", error);

      alert(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        "Translation failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleFileTranslate() {
    if (!file) {
      alert("Please select a document.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("target", lang);

    setFileLoading(true);
    setResult("");

    try {
      const res = await API.post(
        "/translate-document",
        formData
      );

      console.log("Document translation response:", res.data);

      const translated =
        res.data.result ||
        res.data.translated ||
        res.data.translation;

      if (!translated) {
        throw new Error(
          res.data.error ||
          "Translated document result was not returned."
        );
      }

      setResult(translated);
    } catch (error) {
      console.error("File translation error:", error);

      alert(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        "File translation failed"
      );
    } finally {
      setFileLoading(false);
    }
  }

  return (
    <section className="page">

      <h1>Language Translation</h1>

      <div className="translate-wrapper">

        {/* INPUT */}
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
              accept=".txt,.docx,.pdf"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
            />

            <button
              onClick={handleFileTranslate}
              className="btn secondary"
              disabled={fileLoading}
            >
              {fileLoading
                ? "Translating..."
                : "Translate Document"}
            </button>

          </div>

        </div>

        {/* OUTPUT */}
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
            <option value="bn">Bengali</option>
            <option value="mr">Marathi</option>
            <option value="gu">Gujarati</option>
            <option value="pa">Punjabi</option>
            <option value="ur">Urdu</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh-CN">Chinese</option>
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