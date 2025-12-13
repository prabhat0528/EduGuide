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
      <div className="flex justify-center items-center h-60">
        <p className="text-gray-500 text-lg">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        What Our Users Say 💬
      </h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              {/* Review Message */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                “{review.message}”
              </p>

              {/* Footer */}
              <div className="border-t pt-4 mt-auto">
                <p className="text-sm font-semibold text-gray-800">
                  {review.created_by_name}
                </p>
                <p className="text-xs text-gray-500">
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
