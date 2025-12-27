

export default function Home() {
  return (
    <section className="page">
      <div className="hero">
        <h1>
          Speak, Translate <br /> & Understand
        </h1>

        <p>
          Convert text to speech, translate languages,
          and upload documents or images effortlessly.
        </p>

        <div className="hero-actions">
          <a href="/text-to-speech" className="btn primary">
            Text to Speech
          </a>
          <a href="/translate" className="btn secondary">
            Translate
          </a>
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
