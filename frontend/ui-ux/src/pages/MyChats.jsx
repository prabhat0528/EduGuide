import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/Authcontext";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:9000";

export default function MyChats() {
  const { user } = useAuth();
  const [chatList, setChatList] = useState([]);
  const userId = user?._id;

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/chat/mychats/${userId}`);
      setChatList(res.data || []);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchChats();
  }, [userId]);

  const getOtherParticipant = (chat) => {
    return chat.participants.find((p) => p._id !== userId);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1F] text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-8">My Chats</h1>

      {chatList.length === 0 ? (
        <p className="text-center text-gray-300">
          No chats available. Start a conversation with a mentor!
        </p>
      ) : (
        <div className="max-w-xl mx-auto space-y-4">
          {chatList.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            const lastMessage = chat.lastMessage?.message || "Say hello!";

            return (
              <Link
                key={chat._id}
                to={`/chat/${chat._id}`}
                className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition"
              >
                <img
                  src={otherParticipant?.profile_picture || "default-avatar.png"}
                  alt={otherParticipant?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    {otherParticipant?.name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-400 truncate max-w-xs">
                    {lastMessage}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}