import React from 'react'

export default function ReviewPage() {
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
        <form className="space-y-4">
          <textarea
            placeholder="Write your review here..."
            className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          ></textarea>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-md hover:bg-purple-700 transition-all"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
