import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <h1 className="logo">SmartLingua</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/text-to-speech">Text → Speech</Link>
        <Link to="/translate">Translate</Link>
      </div>
    </nav>
  );
}
