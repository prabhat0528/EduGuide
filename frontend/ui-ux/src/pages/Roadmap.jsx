import { useState } from "react";
import { Send, BookOpen } from "lucide-react";

const Roadmap = () => {
  const [prompt, setPrompt] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateRoadmap = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        const newRoadmap = {
          title: prompt,
          content: data.roadmap,
        };

        setRoadmaps([newRoadmap, ...roadmaps]);
        setActiveIndex(0);
        setPrompt("");
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:block w-72 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen size={18} />
          Your Roadmaps
        </h2>

        <div className="space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
          {roadmaps.length === 0 && (
            <p className="text-sm text-gray-500">
              No roadmaps generated yet
            </p>
          )}

          {roadmaps.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-full text-left p-3 rounded-lg text-sm transition ${
                activeIndex === index
                  ? "bg-indigo-100 text-indigo-700"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Section */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-800">
            AI Roadmap Generator
          </h1>
          <p className="text-sm text-gray-500">
            Get a personalized, time-bound roadmap from your AI mentor
          </p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeIndex === null ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Ask something like “Give me a roadmap for data science in 3 months”
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {roadmaps[activeIndex].content}
              </pre>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <input
              type="text"
              placeholder="Give me a roadmap for data science in 3 months"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
