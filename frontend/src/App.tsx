import React, { useState, type FormEvent } from "react";
import "./App.css";

interface Place {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  map_url: string;
  embed_url: string;
}

interface ApiResponse {
  data?: {
    interpreted_query: string;
    places: Place[];
  };
  error?: string;
}

const MODELS = [
  { label: "Gemma 2B", value: "gemma:2b" },
  { label: "Llama 2", value: "llama2" },
  { label: "Mistral", value: "mistral" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const App: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [results, setResults] = useState<Place[]>([]);
  const [interpretedQuery, setInterpretedQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    setInterpretedQuery("");
    try {
      const res = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });
      console.log("res", res);
      const data: ApiResponse = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      if (!data.data || !data.data.places || data.data.places.length === 0) {
        setError("No places found.");
        setResults([]);
      } else {
        setResults(data.data.places);
        setInterpretedQuery(data.data.interpreted_query);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      <header
        style={{
          background: "#1976d2",
          color: "#fff",
          padding: "1.5rem 2rem",
          boxShadow: "0 2px 8px #0002",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "2rem",
            letterSpacing: 1,
          }}
        >
          Maps AI Search
        </h1>
      </header>
      <main
        style={{
          maxWidth: 900,
          margin: "2rem auto",
          padding: "2rem",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px #0001",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Where can I eat sushi in Jakarta?"
            size={40}
            required
            style={{
              flex: 1,
              padding: "0.75rem",
              fontSize: "1.1rem",
              borderRadius: 8,
              border: "1px solid #b0b8c1",
            }}
          />
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              padding: "0.7rem",
              borderRadius: 8,
              border: "1px solid #b0b8c1",
              fontSize: "1.1rem",
            }}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1.1rem",
              borderRadius: 8,
              background: "#1976d2",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? (
              <span
                className="spinner"
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 20,
                  border: "3px solid #fff",
                  borderTop: "3px solid #1976d2",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></span>
            ) : (
              "Search"
            )}
          </button>
        </form>
        {error && (
          <div style={{ color: "#c00", marginTop: "1rem", fontWeight: 500 }}>
            {error}
          </div>
        )}
        {interpretedQuery && (
          <div
            style={{
              marginBottom: "1.5rem",
              color: "#1976d2",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                background: "#e3f0ff",
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
              }}
            >
              Interpreted Query: {interpretedQuery}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          {results.map((place, idx) => (
            <div
              key={idx}
              style={{
                background: "#f8faff",
                borderRadius: "12px",
                boxShadow: "0 2px 12px #0001",
                padding: "1.2rem",
                width: "350px",
                marginBottom: "1rem",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: "1px solid #e3e8ee",
                position: "relative",
              }}
              className="place-card"
            >
              <h3 style={{ margin: 0, color: "#1976d2" }}>{place.name}</h3>
              <div style={{ color: "#555", margin: "0.5rem 0 1rem 0" }}>
                {place.address}
              </div>
              <iframe
                src={place.embed_url}
                allowFullScreen
                loading="lazy"
                style={{
                  width: "100%",
                  height: "220px",
                  border: 0,
                  borderRadius: "8px",
                }}
                title={place.name}
              ></iframe>
              <a
                href={place.map_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "0.7rem",
                  color: "#1976d2",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Open in Google Maps
              </a>
            </div>
          ))}
        </div>
        {loading && (
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <span
              className="spinner"
              style={{
                display: "inline-block",
                width: 40,
                height: 40,
                border: "5px solid #1976d2",
                borderTop: "5px solid #e3f0ff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></span>
          </div>
        )}
      </main>
      <footer
        style={{
          textAlign: "center",
          color: "#888",
          padding: "1.5rem 0 0.5rem 0",
          fontSize: "1rem",
        }}
      >
        &copy; {new Date().getFullYear()} Made using ReactJS and Vite
      </footer>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .place-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 32px #1976d233;
        }
      `}</style>
    </div>
  );
};

export default App;
