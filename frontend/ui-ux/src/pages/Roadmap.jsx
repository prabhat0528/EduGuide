import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

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
  }, [text]);

  return displayed;
};

const Roadmap = () => {
  const [prompt, setPrompt] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [roadmaps, activeIndex]);

  const generateRoadmap = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    const res = await fetch("http://localhost:5000/generate-roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (data.success) {
      setRoadmaps([data.roadmap, ...roadmaps]);
      setActiveIndex(0);
      setPrompt("");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex bg-slate-950 text-white">
      {/* Sidebar */}
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

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {activeIndex === null ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              Ask something like <br />
              <span className="text-blue-400 mt-2">
                “Roadmap to become a MERN developer in 4 months”
              </span>
            </div>
          ) : (
            roadmaps[activeIndex].months.map((month, mIdx) => (
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
                  {month.weeks.map((week, wIdx) => {
                    const typed = useTypewriter(
                      `${week.focus}\n\n${week.details}\n\nOutcome: ${week.outcome}`
                    );

                    return (
                      <div
                        key={wIdx}
                        className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                      >
                        <h3 className="text-sm font-semibold text-blue-300 mb-2">
                          {week.week}
                        </h3>
                        <pre className="whitespace-pre-wrap text-xs text-slate-200">
                          {typed}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
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
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition"
          >
            <Send size={18} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
