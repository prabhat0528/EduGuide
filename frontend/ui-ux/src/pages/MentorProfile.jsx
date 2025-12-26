import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext"; 

const BASE_URL = "https://eduguide-backend-z81h.onrender.com";

export default function MentorProfile() {
  const { id: mentorId } = useParams(); 
  const { user } = useAuth(); // Get current user
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMentor = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/mentors/${mentorId}`);
      setMentor(res.data.mentor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentor();
  }, []);

  const handleStartChat = async () => {
    if (!user || !mentor) return;

    try {
      // 1. Create or get existing conversation
      const conversationRes = await axios.post(
        `${BASE_URL}/api/conversation`,
        {
          senderId: user._id,
          receiverId: mentorId,
        }
      );

      const conversation = conversationRes.data;

      // 2. Add conversation ID to both user profiles
      await axios.post(`${BASE_URL}/api/chat/addToUsers`, {
        conversationId: conversation._id,
        userId: user._id,
        mentorId: mentorId,
      });

      // 3. Navigate to the ChatPage using the Conversation ID
      navigate(`/chat/${conversation._id}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Failed to start chat.");
    }
  };

  if (loading)
    return <div className="text-center mt-20 text-white">Loading...</div>;

  if (!mentor)
    return (
      <div className="text-center mt-20 text-red-500">Mentor not found</div>
    );

  return (
    <div className="min-h-screen bg-[#0A0F1F] text-white pt-20 px-6">
      <div className="max-w-3xl mx-auto bg-[#111827] p-8 rounded-xl border border-white/10">
        <img
          src={mentor.profile_picture}
          className="w-40 h-40 rounded-full mx-auto border-4 border-blue-500 object-cover"
        />

        <h1 className="text-3xl text-center mt-4 font-bold">{mentor.name}</h1>
        <p className="text-blue-400 text-center">{mentor.role}</p>

        <p className="mt-4 text-gray-300 text-center">{mentor.description}</p>

        {mentor.social_url && (
          <a
            href={mentor.social_url}
            target="_blank"
            className="block text-center mt-4 text-blue-400 underline"
          >
            Visit Social Profile
          </a>
        )}

        <button
          onClick={handleStartChat} 
          className="w-full mt-6 bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Start Chat
        </button>
      </div>
    </div>
  );
}