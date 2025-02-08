"use client";

import { useState } from "react";
import Spline from "@splinetool/react-spline";

export default function Home() {
  const [userInput, setUserInput] = useState(""); // Eingabefeld für die Frage
  const [responseText, setResponseText] = useState(""); // KI-Antwort
  const [loading, setLoading] = useState(false); // Ladezustand
 

  const [error, setError] = useState<string | null>(null); 

  const fetchData = async () => {
    if (!userInput) return;
  
    setLoading(true);
    setError(null); 
    setResponseText("");
  
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-distill-llama-70b:free",
          messages: [{ role: "user", content: userInput }],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setResponseText(data.choices?.[0]?.message?.content || "Keine Antwort erhalten.");
    } catch (err) {
      setError("Fehler beim Abrufen der Daten."); // ✅ Jetzt erlaubt!
      console.error("API Fehler:", err);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Yusuf Haidaryar</h1>

      {/* Spline 3D Model */}
      <div className="w-full mb-8">
        <Spline scene="bot.spline" />
      </div>

      {/* Eingabe und Button */}
      <div className="flex flex-col items-center gap-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Frage eingeben..."
          className="p-2 border rounded-md w-72 text-black"
        />
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Frage senden
        </button>
      </div>

      {/* Ladeanzeige */}
      {loading && <p className="mt-4 text-gray-500">Lädt...</p>}

      {/* Fehleranzeige */}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {/* Antwortanzeige */}
      {responseText && (
        <div className="mt-6 p-4 bg-gray-800 text-white rounded-lg w-80">
          <h3 className="font-semibold">Antwort:</h3>
          <p>{responseText}</p>
        </div>
      )}
    </div>
  );
}
