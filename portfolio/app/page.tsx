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
          model: "google/gemini-2.0-flash-lite-preview-02-05:free",
          messages: [{ role: "user", content: userInput }],
        }),
      });
      console.log("🔄 message:", userInput);
      console.log("🔄 HTTP-Status:", response.status);
      console.log("📋 Response-Header:", JSON.stringify([...response.headers]));

      // Response klonen, damit wir ihn mehrfach lesen können
      const responseClone = response.clone();

      // Erst den rohen Text loggen
      const rawBody = await responseClone.text();
      console.log("🚀 Raw Response Body:", rawBody);

      // Falls leer, zeige Hinweis an
      if (!rawBody) {
        setError("❌ Kein Response-Body erhalten.");
        return;
      }

      // Versuche den Body als JSON zu parsen
      let data;
      try {
        data = JSON.parse(rawBody);
        console.log("✅ Parsed JSON:", data);
      } catch (jsonError) {
        console.error("❌ Fehler beim JSON-Parsing:", jsonError);
        setError("Fehler beim Parsen der Antwort.");
        return;
      }

      // Antwort extrahieren
      let message = "Keine Antwort erhalten.";
      if (data.choices?.length > 0) {
        message = data.choices[0].message?.content || data.choices[0].text || message;
      } else if (data.message) {
        message = data.message;
      } else if (data.text) {
        message = data.text;
      }

      setResponseText(message);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Fehler beim Abrufen der Daten: ${err.message}`);
        console.error("❌ API Fehler:", err);
      } else {
        setError("Ein unbekannter Fehler ist aufgetreten.");
        console.error("❌ API Fehler (unbekannter Typ):", err);
      }


      
    }
    
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Portfolio Ki Test</h1>

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
