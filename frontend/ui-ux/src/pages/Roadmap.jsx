import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";

/* -------------------- TYPEWRITER HOOK -------------------- */
const useTypewriter = (text, speed = 12) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) return;
    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
};

/* -------------------- WEEK CARD -------------------- */
const WeekCard = ({ week }) => {
  const typed = useTypewriter(
    `${week.focus}\n\n${week.details}\n\nOutcome: ${week.outcome}`
  );

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-300 mb-2">
        {week.week}
      </h3>
      <pre className="whitespace-pre-wrap text-xs text-slate-200">
        {typed}
      </pre>
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

  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [roadmaps, activeIndex, loading]);

  const generateRoadmap = async () => {
    if (!prompt.trim() || loading) return;

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

      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate roadmap");
      }

      setRoadmaps((prev) => [data.roadmap, ...prev]);
      setActiveIndex(0);
      setPrompt("");
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
        <h1 className="text-xl font-semibold text-blue-400">
          Roadmaps
        </h1>

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
        {/* CONTENT */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* ERROR UI */}
          {error && (
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 text-red-300 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* THINKING UI */}
          {loading && (
            <div className="flex items-center gap-3 text-blue-400">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm">Thinking… crafting your roadmap</span>
            </div>
          )}

          {/* EMPTY STATE */}
          {activeIndex === null && !loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-center">
              Ask something like <br />
              <span className="text-blue-400 mt-2 block">
                “Roadmap to become a MERN developer in 4 months”
              </span>
            </div>
          ) : (
            !loading &&
            roadmaps[activeIndex]?.months.map((month, mIdx) => (
              <div
                key={mIdx}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-blue-400">
                  {month.month}
                </h2>
                <p className="text-sm text-slate-300 mt-1 mb-4">
                  {month.goal}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {month.weeks.map((week, wIdx) => (
                    <WeekCard key={wIdx} week={week} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
            placeholder="Describe your goal..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={generateRoadmap}
            disabled={loading}
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
