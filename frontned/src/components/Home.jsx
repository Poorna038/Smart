import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="page">

      {/* HERO */}
      <div className="hero">
        <h1>Speak, Translate & Understand</h1>

        <p>
          Convert text to speech, translate languages, and upload documents effortlessly.
        </p>

        <div className="hero-actions">
          <Link to="/text-to-speech" className="btn primary">
            Text to Speech
          </Link>

          <Link to="/translate" className="btn secondary">
            Translate
          </Link>
        </div>
      </div>

      {/* FEATURES */}
      <div className="features-section">
        <h2>The Capabilities</h2>
        <p className="muted">
          AI-powered tools designed for clarity and accessibility.
        </p>

        <div className="features-grid">

          <div className="feature-card">
            <div className="icon">🌍</div>
            <h3>Translate Languages</h3>
            <p>Instantly translate text into multiple languages with high accuracy.</p>
          </div>

          <div className="feature-card">
            <div className="icon">🔊</div>
            <h3>Text to Speech</h3>
            <p>Convert written content into natural-sounding speech in seconds.</p>
          </div>

          <div className="feature-card">
            <div className="icon">📄</div>
            <h3>Document Upload</h3>
            <p>Upload files and translate entire documents easily.</p>
          </div>

        </div>
      </div>

    </section>
  );
}