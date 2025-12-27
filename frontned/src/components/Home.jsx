import { Link } from "react-router-dom";
import smartai from "./smartai.png";

export default function Home() {
  return (
    <section className="page">
      <div className="hero hero-layout">
        <div className="hero-text">
          <h1>
            Speak, Translate <br /> & Understand
          </h1>

          <p>
            Convert text to speech, translate languages,
            and upload documents or images effortlessly.
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

        <div className="hero-image">
          <img src={smartai} alt="SmartLingua AI" />
        </div>
      </div>

      <div className="section">
        <h2>The Capabilities</h2>
        <p className="muted">
          AI-powered tools designed for clarity and accessibility.
        </p>
      </div>
    </section>
  );
}
