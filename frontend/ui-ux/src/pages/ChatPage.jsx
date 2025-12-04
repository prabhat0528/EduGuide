import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { useAuth } from "../context/Authcontext";

const BASE_URL = "http://localhost:9000";
const socket = io(BASE_URL, { transports: ["websocket"] });

export default function ChatPage() {
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null); 
  const [text, setText] = useState("");
  const bottomRef = useRef();

  // --- Fetch Conversation Details 
  const fetchConversationDetails = async () => {
    if (!user || !conversationId) return;
    try {
      // Re-use the mychats endpoint to fetch conversation data
      const res = await axios.get(`${BASE_URL}/api/chat/mychats/${user._id}`);
      const chat = res.data.find(c => c._id === conversationId);

      if (chat) {
        const participant = chat.participants.find(p => p._id !== user._id);
        setOtherUser(participant);
      }
    } catch (err) {
      console.error("Error fetching chat details:", err);
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/chat/messages/${conversationId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.log("Error fetching messages:", err);
    }
  }, [conversationId]);

  // --- Socket.IO & Initial Load Effect ---
  useEffect(() => {
    if (!conversationId) return;

    fetchConversationDetails(); // Get header info
    fetchMessages(); // Get message history

    socket.emit("join chat", conversationId);

    const handleNewMessage = (newMsg) => {
      if (newMsg.conversationId === conversationId) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on("message received", handleNewMessage);

    return () => {
      socket.off("message received", handleNewMessage);
    };
  }, [conversationId, fetchMessages, user]);

  // --- Auto scroll to bottom ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send Message Logic ---
  const sendMessage = () => {
    if (!text.trim() || !user || !conversationId) return;

    const messageContent = text.trim();

    const messagePayload = {
      conversationId,
      senderId: user._id,
      message: { content: messageContent },
    };

    socket.emit("new message", messagePayload);

    // Optimistically update the UI
    const optimisticMessage = {
      _id: Date.now(),
      conversationId: conversationId,
      sender: {
        _id: user._id,
        name: user.name,
        profile_picture: user.profile_picture,
      },
      message: messageContent,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    setText("");
  };

  return (
    <div className=" min-h-screen bg-[#0A0F1F] text-white flex flex-col">
      {/*  Header */}
      <div className="p-4 md:p-5 bg-[#111827] shadow-xl sticky top-0 z-10 border-b border-gray-700/50 flex items-center gap-3">
        <img
          src={otherUser?.profile_picture || "default-avatar.png"}
          alt={otherUser?.name || "User"}
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
        />
        <h2 className="text-xl md:text-2xl font-bold truncate">
          {otherUser?.name || "Loading Chat..."}
        </h2>
        {otherUser && (
          <span className="text-blue-400 text-sm ml-auto hidden sm:inline">
            {otherUser.role || "Participant"}
          </span>
        )}
      </div>

      {/*  Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const mine = msg.sender?._id === user?._id || msg.sender === user?._id;
          const messageContent = msg.message || msg.content;
          const senderName = mine ? "You" : (msg.sender?.name || "User");
          const senderPic = msg.sender?.profile_picture || "default-avatar.png";

          return (
            <div
              key={msg._id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[90%] sm:max-w-md ${mine ? "flex-row-reverse" : "flex-row"} items-end gap-2`}
              >
               
                {!mine && (
                  <img
                    src={senderPic}
                    alt={senderName}
                    className="w-8 h-8 rounded-full object-cover hidden sm:block self-start mt-auto"
                  />
                )}
                
               
                <div
                  className={`p-3 text-base shadow-lg transition-all duration-200 ease-in-out ${
                    mine
                      ? "bg-blue-600 text-white rounded-t-xl rounded-l-xl" 
                      : "bg-gray-800 text-gray-200 rounded-t-xl rounded-r-xl"
                  }`}
                >
                  <p className="text-sm font-light text-gray-300 mb-1 leading-none italic block sm:hidden">
                    {senderName}
                  </p>
                  {messageContent}
                 
                  <span className={`block text-xs mt-1 ${mine ? 'text-blue-200' : 'text-gray-400'} opacity-70 text-right`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/*  Input Area  */}
      <div className="p-4 bg-[#111827] flex items-center gap-3 sticky bottom-0 z-10 border-t border-gray-700/50">
        <input
          className="flex-1 p-3 bg-gray-700 text-white rounded-xl outline-none border border-transparent focus:border-blue-500 transition duration-200 placeholder-gray-400 text-base"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()} 
          className="bg-blue-600 px-4 py-3 rounded-xl font-medium text-white hover:bg-blue-700 transition duration-200 disabled:bg-blue-900 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
             {/* Send Icon */}
             <line x1="22" y1="2" x2="11" y2="13"></line>
             <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}