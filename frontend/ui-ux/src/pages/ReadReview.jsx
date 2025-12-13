import axios from "axios";
import React, { useEffect, useState } from "react";

function ReadReview() {
  const client = axios.create({
    baseURL: "https://eduguide-backend-z81h.onrender.com",
    withCredentials: true,
  });

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await client.get("/reviews/all");
      setReviews(res.data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#0A0F1F] via-[#141A33] to-[#1F1147]">
        <p className="text-gray-300 text-lg animate-pulse">
          Loading reviews...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#141A33] to-[#1F1147] px-4 py-14">
      
      {/* Heading */}
      <h2 className="text-4xl font-extrabold text-center mb-12 
        bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
        text-transparent bg-clip-text">
        What Our Users Say 💬
      </h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-400">No reviews available.</p>
      ) : (
        <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="
                relative p-6 rounded-2xl
                bg-white/10 backdrop-blur-xl
                border border-white/10
                shadow-lg
                hover:shadow-purple-500/30
                hover:-translate-y-2
                transition-all duration-300
                flex flex-col justify-between
              "
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r 
                from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl -z-10" />

              {/* Review Message */}
              <p className="text-gray-200 text-sm leading-relaxed mb-6">
                “{review.message}”
              </p>

              {/* Footer */}
              <div className="border-t border-white/10 pt-4 mt-auto">
                <p className="text-sm font-semibold text-white">
                  {review.created_by_name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReadReview;
