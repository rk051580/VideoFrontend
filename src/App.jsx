import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const sampleJson = `{
  "city": "Paris",
  "duration_days": 5,
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & Iconic Landmarks",
      "activities": [
        "Arrive in Paris and check into hotel",
        "Visit Eiffel Tower (preferably at sunset)",
        "Walk along the Seine River",
        "Dinner at a nearby French bistro"
      ]
    },
    {
      "day": 2,
      "title": "Historic Paris",
      "activities": [
        "Breakfast at a local café",
        "Explore Notre-Dame Cathedral",
        "Visit Sainte-Chapelle",
        "Lunch in the Latin Quarter",
        "Walk through Luxembourg Gardens",
        "Evening at Montmartre and Sacré-Cœur"
      ]
    }
  ]
}`;

export default function App() {
  const [jsonText, setJsonText] = useState(sampleJson);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  async function handleGenerate() {
    setError(null);
    setVideoUrl(null);

    let payload;
    try {
      payload = JSON.parse(jsonText);
    } catch (e) {
      setError("Invalid JSON. Please fix and try again.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Video generation failed");

      const fullUrl = `${API_BASE}${data.videoUrl}`;
      setVideoUrl(fullUrl);

    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "itinerary_video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ maxWidth: 980, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Itinerary → Video Preview</h1>
      <p>Paste or edit the itinerary JSON below and click <b>Generate</b>. The video will appear below.</p>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        rows={18}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 14, padding: 12, borderRadius: 6, border: "1px solid #ccc" }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <button onClick={handleGenerate} disabled={busy} style={{ padding: "10px 16px", fontSize: 16 }}>
          {busy ? "Generating…" : "Generate Video"}
        </button>
        <button onClick={() => setJsonText(sampleJson)} disabled={busy}>Reset Sample</button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #e00", background: "#ffecec", color: "#900", borderRadius: 6 }}>
          <b>Error:</b> {error}
        </div>
      )}

      {videoUrl && (
        <div style={{ marginTop: 24 }}>
          <h2>Generated Video</h2>
          <video
            controls
            width="100%"
            src={videoUrl}
            style={{ borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
          />
          <button
            onClick={handleDownload}
            style={{ marginTop: 12, padding: "10px 16px", fontSize: 16 }}
          >
            Download Video
          </button>
        </div>
      )}
    </div>
  );
}
