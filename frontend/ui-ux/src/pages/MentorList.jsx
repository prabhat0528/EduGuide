"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function MentorList() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMentors = async () => {
    try {
      const res = await axios.get("https://eduguide-backend-z81h.onrender.com/api/mentors/getmentors");
      setMentors(res.data.mentors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading mentors...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0A0F1F] pt-24 px-6 text-white">
      <h1 className="text-4xl font-bold text-center mb-10">Our Mentors</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {mentors.map((mentor) => (
          <motion.div
            key={mentor._id}
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(`/mentor/${mentor._id}`)}
            className="bg-[#111827] cursor-pointer rounded-xl p-6 border border-white/10 hover:border-blue-500 transition"
          >
            <img
              src={mentor.profile_picture}
              alt={mentor.name}
              className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-blue-500"
            />

            <h2 className="text-2xl font-semibold text-center mt-4">
              {mentor.name}
            </h2>

            <p className="text-center text-blue-400">{mentor.role}</p>

            <p className="text-gray-300 mt-3 text-sm text-center">
              {mentor.description}
            </p>

            {mentor.social_url && (
              <a
                href={mentor.social_url}
                target="_blank"
                className="block text-center mt-4 text-blue-400 underline"
                onClick={(e) => e.stopPropagation()}
              >
                View Profile
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
