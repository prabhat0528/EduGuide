import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";

/* -------------------- ROADMAP CARD -------------------- */

const RoadmapCard = ({ roadmapData }) => {
  if (!roadmapData) return null;

  return (
    <div className="space-y-6">
      {Object.entries(roadmapData).map(([month, weeks], i) => (
        <div
          key={i}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-blue-400 mb-3">
            {month}
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(weeks).map(([week, task], j) => (
              <div
                key={j}
                className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-slate-200"
              >
                <span className="font-bold text-blue-300 mr-1">{week}:</span>
                {task}
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
  }, [roadmaps, loading]);

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
        throw new Error("Too many requests. Please pause and try again.");
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

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
      <aside className="w-72 border-r border-slate-800 p-4 flex flex-col">
        <h1 className="text-xl font-semibold text-blue-400 mb-6">Roadmaps</h1>

        <div className="flex-1 overflow-y-auto space-y-2">
          {roadmaps.map((r, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-full text-left p-3 rounded-lg text-sm transition truncate ${
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

      {/* -------------------- MAIN CONTENT -------------------- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 text-red-300 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {rateLimited && (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 p-3 rounded-lg text-sm">
              You’re moving fast! Take a short pause.
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-blue-400">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm">Crafting your roadmap…</span>
            </div>
          )}

          {activeIndex === null && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
              <p>Ask something like</p>
              <span className="text-blue-400 mt-2 font-medium">
                “Roadmap to become a MERN developer in 4 months”
              </span>
            </div>
          ) : (
            roadmaps[activeIndex] && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 border-b border-slate-800 pb-2">
                  {roadmaps[activeIndex].title}
                </h2>
                <RoadmapCard roadmapData={roadmaps[activeIndex].content} />
              </div>
            )
          )}
        </div>

        {/* -------------------- INPUT AREA -------------------- */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
              placeholder="Describe your goal..."
              disabled={loading || rateLimited}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />

            <button
              onClick={generateRoadmap}
              disabled={loading || !prompt.trim() || rateLimited}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;