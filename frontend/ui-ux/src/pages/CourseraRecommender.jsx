import React, { useState } from "react";

export default function CourseRecommender() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    if (!topic || !difficulty) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://eduguide-python-ml.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setCourses(data);
      }
    } catch (err) {
      setError("Failed to fetch recommendations.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white pt-28 px-6">
      <div className="max-w-4xl mx-auto bg-gray-800/40 rounded-3xl backdrop-blur-xl p-10 shadow-2xl border border-white/10">

        {/* Title */}
        <h1 className="text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          Coursera Course Recommender
        </h1>

        {/* Form */}
        <div className="grid gap-6">
          <input
            type="text"
            placeholder="Enter a topic, e.g., Machine Learning"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="p-4 rounded-xl w-full bg-gray-900/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="p-4 rounded-xl w-full bg-gray-900/50 border border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="">Select Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <button
            onClick={fetchRecommendations}
            className="w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition"
          >
            {loading ? "Finding Courses..." : "Get Recommendations"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-6 text-red-400 text-center font-medium">{error}</p>
        )}

        {/* Results */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {courses.map((course, i) => (
            <a
              key={i}
              href={course.URL}
              target="_blank"
              rel="noreferrer"
              className="bg-gray-900/40 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 hover:-translate-y-1 transition transform shadow-lg"
            >
              <h3 className="text-xl font-bold text-blue-300 mb-2">
                {course["Course Name"]}
              </h3>
              <p className="text-gray-300 mb-2">{course.University}</p>

              <p className="text-yellow-400 font-semibold">
                ⭐ Rating: {course.Rating}
              </p>

              <div className="mt-4">
                <span className="text-sm text-blue-400">View Course →</span>
              </div>
            </a>
          ))}
        </div>

        {/* No Results */}
        {courses.length === 0 && !loading && !error && (
          <p className="text-center text-gray-400 mt-5">
            Enter a topic and difficulty to see recommendations.
          </p>
        )}
      </div>
    </div>
  );
}
