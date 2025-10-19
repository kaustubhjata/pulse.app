import imgImage1 from "../assets/58cd96e66a28a42163d305fee02cd7d8070240a4.png";
import { Frown, Meh, Smile, Laugh, Heart } from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
//npm install react-hot-toast kotti dengandi
import { useEffect } from "react";

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);

  const moods = [
    { icon: Frown, label: "Very Sad", color: "#6B7280" },
    { icon: Meh, label: "Sad", color: "#9CA3AF" },
    { icon: Smile, label: "Neutral", color: "#D1D5DB" },
    { icon: Laugh, label: "Happy", color: "#A7F3D0" },
    { icon: Heart, label: "Very Happy", color: "#6EE7B7" },
  ];

  const suggestions = {
    Good: {
      Celebrate: [
        "Celebrate your wins — you earned it!",
        "Share a small win with someone who supports you.",
        "Treat yourself to a small reward, even if it's just a favorite snack.",
      ],
      Relax: [
        "End your day by doing something relaxing — a walk, music, or gratitude reflection.",
        "Do a short guided relaxation or breathing exercise.",
        "Take a warm bath or make a cup of herbal tea.",
      ],
      Connect: [
        "Keep journaling moments that made you smile today.",
        "Send a quick message to someone who brightened your day.",
        "Plan a low-key hangout to keep the good energy going.",
      ],
    },
    Neutral: {
      "Tired but okay": [
        "Take a 10-minute break to stretch or rest your eyes.",
        "Listen to soothing music or meditate for a few minutes.",
        "Go to bed a bit early — your body will thank you.",
      ],
      "Felt lonely": [
        "Text or call a friend — small connections matter.",
        "Do something comforting, like reading or journaling.",
        "Remember, feeling lonely is okay — you’re not alone in this.",
      ],
      "Just a regular day": [
        "Try writing one thing that made today okay — it helps notice small positives.",
        "Reward yourself with a relaxing activity.",
        "Balance is good — keep that calm energy.",
      ],
      "A bit overwhelmed": [
        "Break down what’s stressing you into smaller steps.",
        "Breathe deeply and slow down your pace.",
        "You’ve handled tough days before — this one will pass too.",
      ],
    },
    Bad: {
      "Work/School Overload": [
        "Plan tomorrow with small tasks and breaks.",
        "Talk to a friend or mentor — sharing helps lighten the load.",
        "Don’t forget to rest; productivity needs recovery too.",
      ],
      "Family Conflict": [
        "Give yourself time to cool off emotionally.",
        "Write down what you feel — it helps clarify your thoughts.",
        "Try speaking to someone supportive, even outside family.",
      ],
      "Money Worries": [
        "Focus on what’s within your control today.",
        "Try listing small, practical steps to manage it.",
        "Seek advice — you don’t have to handle it alone.",
      ],
      "Relationship Strain": [
        "Take space if needed — boundaries are healthy.",
        "Do something for yourself that recharges you.",
        "Remind yourself: your worth isn’t tied to others’ opinions.",
      ],
      "Health Concerns": [
        "Be gentle with yourself — rest and hydrate well.",
        "Seek help if it feels too much — talking helps.",
        "Small self-care acts make big differences.",
      ],
    },
  };

  // Map mood index to top-level category in suggestions
  const moodCategoryMap = {
    0: "Bad",
    1: "Bad",
    2: "Neutral",
    3: "Good",
    4: "Good",
  };

  const handleMoodSelect = (index) => {
    setSelectedMood(index);
    // open hierarchical suggestions first
    const category = moodCategoryMap[index];
    setCurrentCategory(category);
    setCurrentSubCategory(null);
    setShowSuggestions(true);
    setShowNote(false);
  };

  const handleSave = () => {
    const category = moodCategoryMap[selectedMood];
    const sub = currentSubCategory;
    const tipPreview = (() => {
      if (!category) return "";
      const data = suggestions[category];
      if (sub && data && typeof data === "object" && data[sub])
        return data[sub][0];
      if (Array.isArray(data)) return data[0];
      return "";
    })();

    // show toast using react-hot-toast
    toast.success(
      <div className="p-1">
        <div className="text-sm font-semibold text-gray-800">Mood saved</div>
        <div className="text-xs text-gray-600">
          {moods[selectedMood].label}
          {category ? ` • ${category}${sub ? ` › ${sub}` : ""}` : ""}
        </div>
        {tipPreview && (
          <div className="text-xs mt-1 text-gray-700">Tip: {tipPreview}</div>
        )}
        {note && (
          <div className="text-xs mt-1 text-gray-600 italic">"{note}"</div>
        )}
      </div>,
      { duration: 3500 }
    );

    // reset selection UI but keep modal info
    setSelectedMood(null);
    setShowNote(false);
    setShowSuggestions(false);
    setCurrentCategory(null);
    setCurrentSubCategory(null);
    setNote("");
  };

  // Meditation state
  const [showMeditation, setShowMeditation] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [meditationRunning, setMeditationRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [intervalId, setIntervalId] = useState(null);

  const meditations = [
    { id: 1, title: "Breathing Exercise", duration: 60, instructions: ["Sit comfortably.", "Close your eyes.", "Inhale for 4s, hold 4s, exhale 4s."] },
    { id: 2, title: "Body Scan", duration: 180, instructions: ["Lie down or sit.", "Bring attention to your feet and slowly move up."] },
    { id: 3, title: "Loving Kindness", duration: 120, instructions: ["Silently repeat kind phrases to yourself.", "Wish well to others."] },
  ];

  // simple beep using Web Audio API
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      o.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // fallback: use alert sound
      console.log("Beep failed:", e);
    }
  };

  const startMeditation = (med) => {
    setSelectedMeditation(med);
    setTimeLeft(med.duration);
    setMeditationRunning(true);
    // clear existing
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setMeditationRunning(false);
          playBeep();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const stopMeditation = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setMeditationRunning(false);
    setTimeLeft(0);
    setSelectedMeditation(null);
  };

  // open modal when nav button dispatches event
  useEffect(() => {
    const handler = () => setShowMeditation(true);
    window.addEventListener("openMeditation", handler);
    return () => window.removeEventListener("openMeditation", handler);
  }, []);

  return (
    <div className="relative size-full min-h-screen">
      <div
        className="absolute h-[2163px] left-0 top-[-552px] w-[1441px]"
        data-name="image 1"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgImage1}
        />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 text-gray-800">
            How are you feeling today?
          </h1>
          <p className="text-xl text-gray-700">
            Select your mood to track your emotional wellness
          </p>
        </div>
        <div className="absolute bg-[#d9d9d9]/50 h-[142px] left-[115px] rounded-[100px] top-[294px] w-[1172px] backdrop-blur-sm" />
        <div className="relative flex justify-center items-center gap-12 mt-32">
          {moods.map((mood, index) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === index;
            return (
              <button
                key={index}
                onClick={() => handleMoodSelect(index)}
                className={`transition-all ${
                  isSelected ? "scale-110" : "hover:scale-105"
                }`}
              >
                <div
                  className={`size-[134px] rounded-full flex items-center justify-center ${
                    isSelected
                      ? "bg-white shadow-xl"
                      : "bg-[#d9d9d9]/70 hover:bg-white/70"
                  }`}
                >
                  <Icon
                    className="w-16 h-16"
                    style={{ color: isSelected ? mood.color : "#9CA3AF" }}
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm text-gray-700 mt-4 text-center">
                  {mood.label}
                </p>
              </button>
            );
          })}
        </div>
        {showSuggestions && currentCategory && (
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl mb-4 text-gray-800">
                    Add a note (optional)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select a topic to see tailored tips (you can add a note
                    before saving)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowSuggestions(false);
                      setSelectedMood(null);
                      setCurrentCategory(null);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>

              {Array.isArray(suggestions[currentCategory]) && (
                <div className="space-y-3">
                  {suggestions[currentCategory].map((tip, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {typeof suggestions[currentCategory] === "object" &&
                !Array.isArray(suggestions[currentCategory]) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* If a subcategory is selected, show its tips */}
                    {currentSubCategory ? (
                      <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-4 mb-4">
                          <button
                            onClick={() => setCurrentSubCategory(null)}
                            className="text-sm text-teal-600 hover:underline"
                          >
                            &larr; Back
                          </button>
                          <h4 className="text-lg text-gray-800">
                            {currentSubCategory}
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {suggestions[currentCategory][currentSubCategory].map(
                            (tip, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                              >
                                <p className="text-gray-700">{tip}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      Object.keys(suggestions[currentCategory]).map(
                        (sub, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSubCategory(sub)}
                            className="text-left p-4 rounded-lg bg-gray-50 hover:bg-white border border-gray-100"
                          >
                            <h4 className="text-gray-800">{sub}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {suggestions[currentCategory][sub][0]}
                            </p>
                          </button>
                        )
                      )
                    )}
                  </div>
                )}

              <div className="mt-16">
                <h3 className="text-2xl mb-4 text-gray-800">
                  Add a note (optional)
                </h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full h-32 p-4 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-colors"
                  >
                    Save Mood
                  </button>
                  <button
                    onClick={() => {
                      setShowSuggestions(false);
                      setSelectedMood(null);
                      setCurrentCategory(null);
                      setCurrentSubCategory(null);
                      setNote("");
                    }}
                    className="px-6 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Meditation modal */}
        {showMeditation && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowMeditation(false); stopMeditation(); }} />
            <div className="relative z-40 w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl text-gray-800">Meditations</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setShowMeditation(false); stopMeditation(); }} className="text-sm text-gray-600 hover:text-gray-800">Close</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meditations.map((m) => (
                  <div key={m.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <h4 className="text-gray-800">{m.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">Duration: {Math.floor(m.duration/60)}:{String(m.duration%60).padStart(2,'0')}</p>
                    <p className="text-sm text-gray-600 mt-2">{m.instructions[0]}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => startMeditation(m)}
                        className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition-colors"
                      >
                        Start
                      </button>
                      <button onClick={() => { setSelectedMeditation(m); }} className="px-4 text-gray-600 hover:text-gray-800">Details</button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedMeditation && (
                <div className="mt-6 bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg text-gray-800">{selectedMeditation.title}</h4>
                      <p className="text-sm text-gray-600">Instructions:</p>
                    </div>
                    <div className="text-sm text-gray-600">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
                  </div>
                  <ul className="mt-3 list-disc list-inside text-gray-700">
                    {selectedMeditation.instructions.map((ins, i) => (
                      <li key={i} className="text-sm">{ins}</li>
                    ))}
                  </ul>

                  <div className="flex gap-3 mt-4">
                    {!meditationRunning ? (
                      <button onClick={() => startMeditation(selectedMeditation)} className="flex-1 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition-colors">Start</button>
                    ) : (
                      <button onClick={stopMeditation} className="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition-colors">Stop</button>
                    )}
                    <button onClick={() => { stopMeditation(); setShowMeditation(false); }} className="px-4 text-gray-600 hover:text-gray-800">Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
  {/* Listen for nav-opened meditation event */}
        
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}