import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";

export default function ReviewPage() {
  const client = axios.create({
    baseURL: "https://eduguide-backend-z81h.onrender.com",
    withCredentials: true,
  });

  const { user } = useAuth();
  const userId = user?._id; 
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form refresh

    if (!review.trim()) {
      alert("Review cannot be empty!");
      return;
    }

    try {
      setLoading(true);

      const res = await client.post("/reviews/create", {
        message: review,
        created_by: userId,
      });

      alert("Review submitted successfully!");

      setReview(""); // Clear input field
    } catch (error) {
      console.log(error);
      alert("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8">

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
          Share Your Review & Growth Story With Us
        </h1>
        <p className="text-center text-gray-600 mb-8">
          We value your experience—tell us how we helped you grow!
        </p>

        {/* Review Input */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <textarea
            placeholder="Write your review here..."
            className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          ></textarea>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-md hover:bg-purple-700 transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
