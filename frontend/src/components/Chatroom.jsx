import Layout from "./Layout.jsx";
import { useState, useRef, useEffect } from "react";

export default function Chatroom() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi this is Pulse!!! How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [micStatus, setMicStatus] = useState(""); // mic status message
  const messagesEndRef = useRef(null);

  // Debug: print messages with type info

  // Refs for recording
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- Handle sending messages ---
  const send = async (customText) => {
    // convert to string safely
    const textToSend = String(customText ?? input ?? "").trim();
    console.log("Inputer after hitting send: " + input);
    if (!textToSend) return;
    console.log("After CLicking send: " + typeof textToSend);
    console.log("After CLicking send: " + textToSend);
    const id = Date.now();
    const userMsg = { id, sender: "user", text: textToSend };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setMicStatus(""); // reset mic status

    try {
      const typingId = id + 1;
      setMessages((m) => [...m, { id: typingId, sender: "bot", text: "..." }]);

      const backendHost = window.location.hostname;
      const backendPort = 5000;
      const backendOrigin =
        backendHost === "localhost" || backendHost === "127.0.0.1"
          ? `${window.location.protocol}//${backendHost}:${backendPort}`
          : "";
      const url = backendOrigin
        ? `${backendOrigin}/api/respond`
        : `/api/respond`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });

      // remove typing placeholder
      setMessages((m) => m.filter((x) => x.id !== typingId));

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            id: Date.now(),
            sender: "bot",
            text: "Sorry, something went wrong.",
          },
        ]);
        return;
      }

      const data = await res.json();
      const assistantText =
        data.assistant_text || "Sorry, I don't have a response right now.";
      setMessages((m) => [
        ...m,
        { id: Date.now(), sender: "bot", text: assistantText },
      ]);

      if (data.audio_base64) {
        try {
          const audio = new Audio(data.audio_base64);
          await audio.play();
        } catch (e) {
          console.warn("Could not play audio", e);
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        {
          id: Date.now(),
          sender: "bot",
          text: "Network error — please try again.",
        },
      ]);
    }
  };

  // --- Audio Recording + Transcription ---
  const toggleListening = async () => {
    if (listening) {
      // Stop recording
      mediaRecorderRef.current.stop();
      setListening(false);
      setMicStatus("🎤 Processing audio...");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.onstart = () => {
          setMicStatus("🎤 Listening...");
          console.log("Recording started");
        };

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          console.log("Recording stopped");
          setMicStatus("🎤 Sending audio for transcription...");
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          // send blob to backend
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            const backendHost = window.location.hostname;
            const backendPort = 5000;
            const backendOrigin =
              backendHost === "localhost" || backendHost === "127.0.0.1"
                ? `${window.location.protocol}//${backendHost}:${backendPort}`
                : "";
            const url = backendOrigin
              ? `${backendOrigin}/api/transcribe`
              : `/api/transcribe`;

            const res = await fetch(url, {
              method: "POST",
              body: formData,
            });

            if (!res.ok) throw new Error("Transcription failed");
            const data = await res.json();

            if (data.text) {
              const transcriptText =
                typeof data.text === "object"
                  ? JSON.stringify(data.text)
                  : data.text;
              console.log("data.text: " + data.text);
              console.log("data.text: " + typeof data.text);
              setInput(String(transcriptText));
              console.log("Input type: " + typeof setInput);
              console.log("Final transcript text:", transcriptText);
              console.log("Type:", typeof transcriptText);
              setMicStatus("✅ Transcription successful!");
            } else {
              setMicStatus("⚠️ Could not transcribe audio.");
            }
          } catch (error) {
            console.error("Transcription error:", error);
            setMicStatus("❌ Error during transcription.");
          }
        };

        mediaRecorder.start();
        setListening(true);
      } catch (error) {
        console.error("Mic access error:", error);
        setMicStatus("❌ Microphone access denied or unavailable.");
      }
    }
  };

  // --- Auto-scroll to latest message ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Layout>
      <div className="flex flex-col h-screen max-w-3xl mx-auto px-4 pt-24 pb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg text-center">
          Pulse Chatroom
        </h1>

        <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col overflow-y-auto space-y-3 shadow-inner">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] px-4 py-2 rounded-2xl break-words ${
                m.sender === "bot"
                  ? "self-start bg-teal-600 text-white rounded-tl-none shadow-md"
                  : "self-end bg-white text-gray-900 rounded-tr-none shadow-md"
              }`}
            >
              {typeof m.text === "object"
                ? JSON.stringify(m.text, null, 2)
                : String(m.text ?? "")}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Mic status */}
        {micStatus && (
          <div className="text-white mt-2 text-center font-medium">
            {micStatus}
          </div>
        )}

        {/* Input + Buttons */}
        <div className="mt-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 rounded-2xl bg-white/20 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            onClick={() => send()}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 rounded-2xl font-semibold shadow-lg transition-all"
          >
            Send
          </button>
          <button
            onClick={toggleListening}
            className={`bg-gray-700 hover:bg-gray-800 text-white px-4 rounded-full shadow-lg transition-all ${
              listening ? "animate-pulse" : ""
            }`}
          >
            🎤
          </button>
        </div>
      </div>
    </Layout>
  );
}
