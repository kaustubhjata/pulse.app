// import { Frown, Meh, Smile, Laugh, Heart, Mic, Keyboard } from "lucide-react";
// import { useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import Layout from "./Layout.jsx";

// export default function MoodTrackerPage() {
//   const [selectedMood, setSelectedMood] = useState(null);
//   const [showQuestions, setShowQuestions] = useState(false);
//   const [answers, setAnswers] = useState({});
//   const [note, setNote] = useState({});
//   const [activeInput, setActiveInput] = useState({});

//   const moods = [
//     { icon: Frown, label: "Terrible", color: "#F43F5E" },
//     { icon: Meh, label: "Bad", color: "#F97316" },
//     { icon: Smile, label: "Fine", color: "#FBBF24" },
//     { icon: Laugh, label: "Good", color: "#22C55E" },
//     { icon: Heart, label: "Awesome!", color: "#3B82F6" },
//   ];

//   const questionOptions = {
//     "Terrible": [
//       { question: "What's making you feel this way?", options: ["Work", "Health", "Family", "Friends", "Financial Stress"] },
//       { question: "Which emotions best describe how you feel?", options: ["Overwhelmed", "Anxious", "Hopeless", "Angry", "Exhausted"] },
//       { question: "What might offer a moment of relief?", options: ["Deep breathing", "Talking to someone", "Listening to calm music", "Taking a break", "A glass of water"] },
//     ],
//     "Bad": [
//       { question: "What's influencing your mood?", options: ["Lack of Sleep", "School", "Dating", "Colleagues", "Weather"] },
//       { question: "Which of these words fit your feeling?", options: ["Sad", "Stressed", "Annoyed", "Tired", "Worried"] },
//       { question: "Is there something you can do to help?", options: ["Go for a short walk", "Watch a favorite show", "Eat a comforting snack", "Write down your thoughts", "Step away from the cause"] },
//     ],
//     "Fine": [
//       { question: "What's the main factor in your mood today?", options: ["Home", "Routine Tasks", "Food", "Exercise", "Commuting"] },
//       { question: "How would you describe this feeling?", options: ["Neutral", "Okay", "Stable", "Unbothered", "Quiet"] },
//       { question: "What could make your day a little better?", options: ["A short break", "A healthy snack", "Chatting with someone", "A quick stretch", "Nothing in particular"] },
//     ],
//     "Good": [
//       { question: "What's making you feel good today?", options: ["Hobby", "Friends", "Pet", "Outdoors", "Good Sleep"] },
//       { question: "Which emotions best describe this?", options: ["Happy", "Content", "Calm", "Relieved", "Hopeful"] },
//       { question: "How can you keep this good feeling going?", options: ["Tackle a small task", "Listen to upbeat music", "Share your mood with someone", "Plan something fun", "Spend time outdoors"] },
//     ],
//     "Awesome!": [
//       { question: "What's making you feel awesome?", options: ["Travel", "Partner", "Work Achievement", "Family", "Health"] },
//       { question: "Which words best capture this feeling?", options: ["Joyful", "Proud", "Excited", "Grateful", "Enthusiastic"] },
//       { question: "How can you celebrate this moment?", options: ["Share the news with someone", "Treat yourself", "Journal about it", "Savor the moment", "Plan another great day"] },
//     ],
//   };

//   const handleMoodSelect = (index) => {
//     setSelectedMood(index);
//     setShowQuestions(true);
//     setAnswers({});
//     setNote({});
//     setActiveInput({});
//   };

//   const handleOptionSelect = (question, option) => {
//     setAnswers((prev) => ({ ...prev, [question]: option }));
//   };

//   const toggleInputMode = (question, mode) => {
//     setActiveInput((prev) => {
//       if (prev[question] === mode) {
//         const newState = { ...prev };
//         delete newState[question];
//         return newState;
//       } else {
//         return { ...prev, [question]: mode };
//       }
//     });
//   };

//   const handleNoteChange = (question, value) => {
//     setNote((prev) => ({ ...prev, [question]: value }));
//   };

//   const handleSave = async () => {
//     const moodLabel = moods[selectedMood].label;

//     const moodEntry = {
//       timestamp: new Date().toISOString(),
//       mood: moodLabel,
//       responses: questionOptions[moodLabel].map((qObj) => {
//         const question = qObj.question;
//         const answer = activeInput[question] ? note[question] || "" : answers[question] || "";
//         return { question, answer };
//       }),
//     };

//     try {
//       const response = await fetch("/api/save-mood", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(moodEntry),
//       });

//       if (!response.ok) throw new Error("Server responded with an error!");
//       toast.success("Mood successfully saved to file!");
//     } catch (error) {
//       console.error("Error saving mood:", error);
//       toast.error("Could not save mood. Check console for details.");
//     }

//     setSelectedMood(null);
//     setShowQuestions(false);
//     setAnswers({});
//     setNote({});
//     setActiveInput({});
//   };

//   return (
//     <Layout>
//       <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
//         <h1 className="text-5xl mb-4 text-white drop-shadow-lg">
//           How are you feeling today?
//         </h1>
//         <p className="text-xl text-blue-50 mb-16">
//           Select your mood to track your emotional wellness
//         </p>

//         <div className="flex justify-center items-center gap-12 mt-12 flex-wrap">
//           {moods.map((mood, index) => {
//             const Icon = mood.icon;
//             const isSelected = selectedMood === index;
//             return (
//               <button
//                 key={index}
//                 onClick={() => handleMoodSelect(index)}
//                 className={`transition-all ${isSelected ? "scale-110" : "hover:scale-105"}`}
//               >
//                 <div
//                   className={`size-[134px] rounded-full flex items-center justify-center ${
//                     isSelected ? "bg-white shadow-xl" : "bg-white/70 hover:bg-white/90"
//                   }`}
//                 >
//                   <Icon
//                     className="w-16 h-16"
//                     style={{ color: isSelected ? mood.color : "#9CA3AF" }}
//                     strokeWidth={1.5}
//                   />
//                 </div>
//                 <p className="text-sm text-gray-700 mt-4">{mood.label}</p>
//               </button>
//             );
//           })}
//         </div>

//         {showQuestions && selectedMood !== null && (
//           <div className="mt-16 max-w-2xl mx-auto">
//             <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8">
//               <h3 className="text-2xl mb-4 text-gray-800">Answer a few questions</h3>

//               {questionOptions[moods[selectedMood].label].map((qObj, i) => {
//                 const q = qObj.question;
//                 return (
//                   <div key={i} className="mb-4">
//                     <p className="text-gray-700 mb-2">{q}</p>

//                     {!activeInput[q] && (
//                       <div className="flex flex-col gap-2 mb-2">
//                         {qObj.options.map((option, idx) => (
//                           <button
//                             key={idx}
//                             onClick={() => handleOptionSelect(q, option)}
//                             className={`text-left px-4 py-2 rounded-xl border ${
//                               answers[q] === option
//                                 ? "bg-teal-600 text-white"
//                                 : "bg-gray-100"
//                             } hover:bg-teal-200 transition-colors`}
//                           >
//                             {option}
//                           </button>
//                         ))}
//                       </div>
//                     )}

//                     <div className="flex gap-4">
//                       <button
//                         onClick={() => toggleInputMode(q, "text")}
//                         className={`flex-1 px-4 py-2 rounded-xl border ${
//                           activeInput[q] === "text"
//                             ? "bg-teal-600 text-white"
//                             : "bg-gray-100"
//                         } flex items-center justify-center gap-2`}
//                       >
//                         <Keyboard className="w-4 h-4" /> Text
//                       </button>

//                       <button
//                         onClick={() => toggleInputMode(q, "voice")}
//                         className={`flex-1 px-4 py-2 rounded-xl border ${
//                           activeInput[q] === "voice"
//                             ? "bg-teal-600 text-white"
//                             : "bg-gray-100"
//                         } flex items-center justify-center gap-2`}
//                       >
//                         <Mic className="w-4 h-4" /> Voice
//                       </button>
//                     </div>

//                     {activeInput[q] && (
//                       <textarea
//                         value={note[q] || ""}
//                         onChange={(e) => handleNoteChange(q, e.target.value)}
//                         placeholder="Your answer..."
//                         className="w-full h-20 p-3 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 mt-2"
//                       />
//                     )}
//                   </div>
//                 );
//               })}

//               <div className="flex gap-4 mt-6">
//                 <button
//                   onClick={handleSave}
//                   className="flex-1 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-colors"
//                 >
//                   Save Mood
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowQuestions(false);
//                     setSelectedMood(null);
//                     setAnswers({});
//                     setNote({});
//                     setActiveInput({});
//                   }}
//                   className="px-6 text-gray-600 hover:text-gray-800"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <Toaster position="bottom-right" />
//     </Layout>
//   );
// }



import { Frown, Meh, Smile, Laugh, Heart, Mic, Keyboard, Square } from "lucide-react";
import { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
// Assuming 'Layout' is a wrapper component for styling.
import Layout from "./Layout.jsx";

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [answers, setAnswers] = useState({});
  const [note, setNote] = useState({});
  const [activeInput, setActiveInput] = useState({});

  // --- STATE & REFS FOR AUDIO RECORDING ---
  const [listeningForQuestion, setListeningForQuestion] = useState(null); // Tracks which question is recording
  const [micStatus, setMicStatus] = useState({}); // Stores mic status per question
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const moods = [
    { icon: Frown, label: "Terrible", color: "#F43F5E" },
    { icon: Meh, label: "Bad", color: "#F97316" },
    { icon: Smile, label: "Fine", color: "#FBBF24" },
    { icon: Laugh, label: "Good", color: "#22C55E" },
    { icon: Heart, label: "Awesome!", color: "#3B82F6" },
  ];

  const questionOptions = {
    "Terrible": [
      { question: "What's making you feel this way?", options: ["Work", "Health", "Family", "Friends", "Financial Stress"] },
      { question: "Which emotions best describe how you feel?", options: ["Overwhelmed", "Anxious", "Hopeless", "Angry", "Exhausted"] },
      { question: "What might offer a moment of relief?", options: ["Deep breathing", "Talking to someone", "Listening to calm music", "Taking a break", "A glass of water"] },
    ],
    "Bad": [
      { question: "What's influencing your mood?", options: ["Lack of Sleep", "School", "Dating", "Colleagues", "Weather"] },
      { question: "Which of these words fit your feeling?", options: ["Sad", "Stressed", "Annoyed", "Tired", "Worried"] },
      { question: "Is there something you can do to help?", options: ["Go for a short walk", "Watch a favorite show", "Eat a comforting snack", "Write down your thoughts", "Step away from the cause"] },
    ],
    "Fine": [
      { question: "What's the main factor in your mood today?", options: ["Home", "Routine Tasks", "Food", "Exercise", "Commuting"] },
      { question: "How would you describe this feeling?", options: ["Neutral", "Okay", "Stable", "Unbothered", "Quiet"] },
      { question: "What could make your day a little better?", options: ["A short break", "A healthy snack", "Chatting with someone", "A quick stretch", "Nothing in particular"] },
    ],
    "Good": [
      { question: "What's making you feel good today?", options: ["Hobby", "Friends", "Pet", "Outdoors", "Good Sleep"] },
      { question: "Which emotions best describe this?", options: ["Happy", "Content", "Calm", "Relieved", "Hopeful"] },
      { question: "How can you keep this good feeling going?", options: ["Tackle a small task", "Listen to upbeat music", "Share your mood with someone", "Plan something fun", "Spend time outdoors"] },
    ],
    "Awesome!": [
      { question: "What's making you feel awesome?", options: ["Travel", "Partner", "Work Achievement", "Family", "Health"] },
      { question: "Which words best capture this feeling?", options: ["Joyful", "Proud", "Excited", "Grateful", "Enthusiastic"] },
      { question: "How can you celebrate this moment?", options: ["Share the news with someone", "Treat yourself", "Journal about it", "Savor the moment", "Plan another great day"] },
    ],
  };

  // --- AUDIO RECORDING & TRANSCRIPTION LOGIC ---
  const handleVoiceInput = async (question) => {
    // If clicking the button for the currently recording question, stop it.
    if (listeningForQuestion === question) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Prevent starting a new recording if another is already in progress.
    if (listeningForQuestion) {
      toast.error("Another recording is already in progress.");
      return;
    }

    // --- Start a new recording ---
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.onstart = () => {
        setListeningForQuestion(question);
        setMicStatus((prev) => ({ ...prev, [question]: "🎤 Listening..." }));
      };

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop()); // Release the mic
        setListeningForQuestion(null);
        setMicStatus((prev) => ({ ...prev, [question]: "🎤 Processing audio..." }));

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
          const backendHost = window.location.hostname;
          const backendPort = 3001;
          const backendOrigin =
            backendHost === "localhost" || backendHost === "127.0.0.1"
              ? `${window.location.protocol}//${backendHost}:${backendPort}`
              : "";
          const url = backendOrigin
            ? `${backendOrigin}/api/transcribe`
            : `/api/transcribe`;

          const res = await fetch(url, { method: "POST", body: formData });
          if (!res.ok) throw new Error("Transcription failed");

          const data = await res.json();
          if (data.text) {
            handleNoteChange(question, data.text);
            setActiveInput((prev) => ({ ...prev, [question]: "text" }));
            setMicStatus((prev) => ({ ...prev, [question]: "✅ Transcription successful!" }));
          } else {
            setMicStatus((prev) => ({ ...prev, [question]: "⚠️ Could not transcribe audio." }));
          }
        } catch (error) {
          console.error("Transcription error:", error);
          setMicStatus((prev) => ({ ...prev, [question]: "❌ Error during transcription." }));
        }
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("Mic access error:", error);
      toast.error("Microphone access was denied.");
      setMicStatus((prev) => ({ ...prev, [question]: "❌ Mic access denied." }));
    }
  };
  
  const resetAllState = () => {
      setShowQuestions(false);
      setSelectedMood(null);
      setAnswers({});
      setNote({});
      setActiveInput({});
      setListeningForQuestion(null);
      setMicStatus({});
  };

  const handleMoodSelect = (index) => {
    resetAllState();
    setSelectedMood(index);
    setShowQuestions(true);
  };

  const handleOptionSelect = (question, option) => {
    setAnswers((prev) => ({ ...prev, [question]: option }));
  };

  const toggleInputMode = (question, mode) => {
    setActiveInput((prev) => {
      if (prev[question] === mode) {
        const newState = { ...prev };
        delete newState[question];
        return newState;
      } else {
        return { ...prev, [question]: mode };
      }
    });
  };

  const handleNoteChange = (question, value) => {
    setNote((prev) => ({ ...prev, [question]: value }));
  };

  const handleSave = async () => {
    const moodLabel = moods[selectedMood].label;

    const moodEntry = {
      timestamp: new Date().toISOString(),
      mood: moodLabel,
      responses: questionOptions[moodLabel].map((qObj) => {
        const question = qObj.question;
        const answer = activeInput[question] ? note[question] || "" : answers[question] || "";
        return { question, answer };
      }),
    };

    try {
      const backendHost = window.location.hostname;
      const backendPort = 3001;
      const backendOrigin =
        backendHost === "localhost" || backendHost === "127.0.0.1"
          ? `${window.location.protocol}//${backendHost}:${backendPort}`
          : "";
      const url = backendOrigin
        ? `${backendOrigin}/api/save-mood`
        : `/api/save-mood`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moodEntry),
      });

      if (!response.ok) throw new Error("Server responded with an error!");
      toast.success("Mood successfully saved to file!");
    } catch (error) {
      console.error("Error saving mood:", error);
      toast.error("Could not save mood. Check console for details.");
    }

    resetAllState();
  };

  return (
    <Layout>
    <>
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-center bg-transparent font-sans min-h-screen">
        <h1 className="text-5xl mb-4 text-white drop-shadow-lg">
          How are you feeling today?
        </h1>
        <p className="text-xl text-blue-50 mb-16">
          Select your mood to track your emotional wellness
        </p>

        <div className="flex justify-center items-center gap-12 mt-12 flex-wrap">
          {moods.map((mood, index) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === index;
            return (
              <button
                key={index}
                onClick={() => handleMoodSelect(index)}
                className={`transition-all ${isSelected ? "scale-110" : "hover:scale-105"}`}
              >
                <div
                  className={`size-[134px] rounded-full flex items-center justify-center ${
                    isSelected ? "bg-white shadow-xl" : "bg-white/70 hover:bg-white/90"
                  }`}
                >
                  <Icon
                    className="w-16 h-16"
                    style={{ color: isSelected ? mood.color : "#9CA3AF" }}
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm text-gray-200 mt-4">{mood.label}</p>
              </button>
            );
          })}
        </div>

        {showQuestions && selectedMood !== null && (
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-left">
              <h3 className="text-2xl mb-4 text-gray-800 text-center">Answer a few questions</h3>

              {questionOptions[moods[selectedMood].label].map((qObj, i) => {
                const q = qObj.question;
                const isRecordingThisQuestion = listeningForQuestion === q;

                return (
                  <div key={i} className="mb-6">
                    <p className="text-gray-700 mb-2 font-medium">{q}</p>

                    {!activeInput[q] && (
                      <div className="flex flex-col gap-2 mb-2">
                        {qObj.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOptionSelect(q, option)}
                            className={`text-left px-4 py-2 rounded-xl border ${
                              answers[q] === option
                                ? "bg-teal-600 text-white border-teal-600"
                                : "bg-gray-100 border-gray-200"
                            } hover:bg-teal-200 transition-colors`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleInputMode(q, "text")}
                        className={`flex-1 px-4 py-2 rounded-xl border ${
                          activeInput[q] === "text"
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-gray-100 border-gray-200"
                        } flex items-center justify-center gap-2 transition-colors`}
                      >
                        <Keyboard className="w-4 h-4" /> Text
                      </button>

                      <button
                        onClick={() => handleVoiceInput(q)}
                        className={`flex-1 px-4 py-2 rounded-xl border ${
                          isRecordingThisQuestion
                            ? "bg-red-500 text-white border-red-500 animate-pulse"
                            : "bg-gray-100 border-gray-200"
                        } flex items-center justify-center gap-2 transition-colors disabled:opacity-50`}
                        disabled={listeningForQuestion && !isRecordingThisQuestion}
                      >
                        {isRecordingThisQuestion ? (
                          <>
                            <Square className="w-4 h-4" /> Stop
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" /> Voice
                          </>
                        )}
                      </button>
                    </div>

                    {micStatus[q] && (
                      <p className="text-xs text-gray-600 mt-2 text-center">{micStatus[q]}</p>
                    )}

                    {activeInput[q] && (
                      <textarea
                        value={note[q] || ""}
                        onChange={(e) => handleNoteChange(q, e.target.value)}
                        placeholder="Your answer..."
                        className="w-full h-20 p-3 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 mt-2"
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-colors"
                >
                  Save Mood
                </button>
                <button
                  onClick={resetAllState}
                  className="px-6 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toaster position="bottom-right" />
    </>
    </Layout>
  );
}