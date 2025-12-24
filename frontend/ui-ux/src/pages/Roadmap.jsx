import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";

/* -------------------- FORMATTER -------------------- */
const formatRoadmap = (text) => {
  if (!text) return [];

  const clean = text
    .replace(/[*#]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = clean.split("\n");

  const months = [];
  let currentMonth = null;

  lines.forEach((line) => {
    if (line.toLowerCase().startsWith("month")) {
      currentMonth = { title: line.trim(), weeks: [] };
      months.push(currentMonth);
    } else if (line.toLowerCase().includes("week")) {
      currentMonth?.weeks.push(line.trim());
    }
  });

  return months;
};

/* -------------------- ROADMAP CARD -------------------- */
const RoadmapCard = ({ content }) => {
  const months = formatRoadmap(content);

  return (
    <div className="space-y-6">
      {months.map((month, i) => (
        <div
          key={i}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-blue-400 mb-3">
            {month.title}
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {month.weeks.map((week, j) => (
              <div
                key={j}
                className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-slate-200"
              >
                {week}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */
const Roadmap = () => {
  const [prompt, setPrompt] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [roadmaps, activeIndex, loading]);

  const generateRoadmap = async () => {
    if (!prompt.trim() || loading || rateLimited) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://eduguide-genai.onrender.com/generate-roadmap",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      if (res.status === 429) {
        setRateLimited(true);
        throw new Error("🚦 Too many requests. Please pause and try again.");
      }

      if (!res.ok) throw new Error(`Server error (${res.status})`);

      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      const newRoadmap = {
        title: prompt,
        content: data.roadmap,
      };

      setRoadmaps((prev) => [newRoadmap, ...prev]);
      setActiveIndex(0);
      setPrompt("");
      setRateLimited(false);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-slate-950 text-white">
      {/* -------------------- SIDEBAR -------------------- */}
      <aside className="w-72 border-r border-slate-800 p-4 space-y-4">
        <h1 className="text-xl font-semibold text-blue-400">Roadmaps</h1>

        <div className="space-y-2">
          {roadmaps.map((r, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-full text-left p-3 rounded-lg text-sm transition ${
                activeIndex === idx
                  ? "bg-blue-600"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      </aside>

      {/* -------------------- MAIN -------------------- */}
      <main className="flex-1 flex flex-col">
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 text-red-300 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {rateLimited && (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 p-3 rounded-lg text-sm">
               You’re moving fast! Take a short pause — great plans take time.
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-blue-400">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm">Crafting your roadmap…</span>
            </div>
          )}

          {activeIndex === null && !loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-center">
              Ask something like <br />
              <span className="text-blue-400 mt-2 block">
                “Roadmap to become a MERN developer in 4 months”
              </span>
            </div>
          ) : (
            !loading &&
            roadmaps[activeIndex] && (
              <RoadmapCard content={roadmaps[activeIndex].content} />
            )
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
            placeholder="Describe your goal..."
            disabled={rateLimited}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />

          <button
            onClick={generateRoadmap}
            disabled={loading || rateLimited}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
