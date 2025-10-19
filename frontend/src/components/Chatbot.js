import React, { useState, useEffect, useRef } from "react";

function Chatbot() {
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState("");
  const [displayedUserSpeech, setDisplayedUserSpeech] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [displayedBotResponse, setDisplayedBotResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (!userSpeech) return;
    let i = 0;
    setDisplayedUserSpeech("");
    const interval = setInterval(() => {
      setDisplayedUserSpeech((prev) => prev + userSpeech[i]);
      i++;
      if (i >= userSpeech.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [userSpeech]);

  useEffect(() => {
    if (!botResponse) return;
    let i = 0;
    setDisplayedBotResponse("");
    const interval = setInterval(() => {
      setDisplayedBotResponse((prev) => prev + botResponse[i]);
      i++;
      if (i >= botResponse.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [botResponse]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = handleStopRecording;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Please allow microphone access.");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "speech.webm");

    try {
      setIsThinking(true);
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setUserSpeech(data.text);
        await handleResponse(data.text);
      } else {
        setIsThinking(false);
        alert("Transcription failed. Try again.");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setIsThinking(false);
    }
  };

  const handleResponse = async (text) => {
    setBotResponse("");
    setDisplayedBotResponse("");
    setAudioUrl(null);
    try {
      const response = await fetch("http://localhost:5000/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (data.assistant_text) {
        setBotResponse(data.assistant_text);
      }
      if (data.audio_base64) {
        setAudioUrl(data.audio_base64);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      alert("No audio available yet!");
    }
  };

  return (
    <div className="assistant-container" style={styles.container}>
      <h1>🩺 HealthMate</h1>

      <div className="transcribed-text" style={styles.card}>
        <h3>Your Speech</h3>
        <p className="typewriter">
          {displayedUserSpeech || "Say something..."}
        </p>
      </div>

      <div className="assistant-response" style={styles.card}>
        <h3>Assistant</h3>
        <p className="typewriter">
          {isThinking
            ? "💭 Thinking..."
            : displayedBotResponse || "Waiting for response..."}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        {!isRecording ? (
          <button style={styles.startBtn} onClick={startRecording}>
            🎙️ Start Recording
          </button>
        ) : (
          <button style={styles.stopBtn} onClick={stopRecording}>
            🛑 Stop Recording
          </button>
        )}
      </div>

      {audioUrl && (
        <div style={{ marginTop: "20px" }}>
          <button style={styles.playBtn} onClick={playAudio}>
            ▶️ Play Assistant Audio
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "15px",
    margin: "10px auto",
    maxWidth: "500px",
    backgroundColor: "#fafafa",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  startBtn: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
  },
  stopBtn: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#E53935",
    color: "white",
  },
  playBtn: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#6a4c93",
    color: "white",
  },
};

export default Chatbot;
