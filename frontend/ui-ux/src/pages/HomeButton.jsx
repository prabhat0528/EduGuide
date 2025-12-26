import React from "react";
import { useRouter } from "next/navigation";

export default function HomeButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold 
                 hover:bg-blue-700 transition-all duration-300 shadow-md 
                 hover:shadow-lg active:scale-95"
    >
      Home
    </button>
  );
}
