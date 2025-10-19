// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const cors = require("cors");
// const multer = require("multer");
// const { OpenAI } = require("openai");
// const os = require("os");
// require("dotenv").config(); // To load environment variables from .env file

// const app = express();
// const PORT = 3001;

// // --- Initialize OpenAI Client ---
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // --- Multer Setup for file uploads (in-memory) ---
// const upload = multer({ storage: multer.memoryStorage() });

// app.use(cors());
// app.use(express.json());

// // --- Paths ---
// const dbDir = path.join(__dirname, "db");
// const moodResultsPath = path.join(dbDir, "results.json");
// const journalPath = path.join(dbDir, "journals.json");
// const communitiesPath = path.join(dbDir, "communities.json");

// // --- Ensure db folder exists ---
// if (!fs.existsSync(dbDir)) {
//   fs.mkdirSync(dbDir, { recursive: true });
//   console.log("🗂️  Created /db directory");
// }

// // --- Helper Functions ---
// const readJsonFile = (filePath) => {
//   try {
//     if (!fs.existsSync(filePath)) {
//       fs.writeFileSync(filePath, "[]", "utf8");
//       return [];
//     }
//     const data = fs.readFileSync(filePath, "utf8");
//     return JSON.parse(data || "[]");
//   } catch (err) {
//     console.error(`❌ Error reading ${filePath}:`, err);
//     return [];
//   }
// };

// const writeJsonFile = (filePath, data) => {
//   try {
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
//   } catch (err) {
//     console.error(`❌ Error writing ${filePath}:`, err);
//   }
// };

// // =====================
// //  TRANSCRIPTION ENDPOINT (NEW)
// // =====================
// app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No audio file uploaded." });
//   }

//   // Define a temporary file path
//   const tempFilePath = path.join(os.tmpdir(), `recording-${Date.now()}.webm`);

//   try {
//     // Write the buffer from multer to a temporary file
//     await fs.promises.writeFile(tempFilePath, req.file.buffer);

//     // Create a readable stream from the temporary file
//     const stream = fs.createReadStream(tempFilePath);

//     // Send the audio stream to OpenAI Whisper for transcription
//     const transcription = await openai.audio.transcriptions.create({
//       file: stream,
//       model: "whisper-1",
//     });

//     // Send the transcribed text back to the client
//     res.json({ text: transcription.text });

//   } catch (error) {
//     console.error("❌ Transcription error:", error);
//     res.status(500).json({ message: "Error transcribing audio." });
//   } finally {
//     // Clean up: delete the temporary file
//     try {
//       await fs.promises.unlink(tempFilePath);
//     } catch (cleanupError) {
//       console.error("❌ Error deleting temporary file:", cleanupError);
//     }
//   }
// });


// // =====================
// //  MOOD ENDPOINTS
// // =====================
// app.post("/api/save-mood", (req, res) => {
//   const newEntry = req.body;
//   if (!newEntry || !newEntry.mood) {
//     return res.status(400).json({ message: "Invalid mood data received." });
//   }

//   const entries = readJsonFile(moodResultsPath);
//   entries.push(newEntry);
//   writeJsonFile(moodResultsPath, entries);

//   console.log("✅ Saved new mood entry.");
//   res.status(200).json({ message: "Mood saved successfully!" });
// });

// // =====================
// //  JOURNAL ENDPOINTS
// // =====================

// // --- GET /api/get-journals ---
// app.get("/api/get-journals", (req, res) => {
//   try {
//     const entries = readJsonFile(journalPath);
//     const sortedEntries = entries.sort(
//       (a, b) => new Date(b.date) - new Date(a.date)
//     );
//     res.status(200).json(sortedEntries);
//   } catch (err) {
//     console.error("❌ Failed to read journals:", err);
//     res.status(500).json({ message: "Could not retrieve journal entries." });
//   }
// });

// // --- POST /api/save-journal ---
// app.post("/api/save-journal", (req, res) => {
//   const newJournalEntry = req.body;

//   if (!newJournalEntry || !newJournalEntry.title || !newJournalEntry.content) {
//     return res.status(400).json({
//       message: "Invalid journal data. Title and content are required.",
//     });
//   }

//   if (!newJournalEntry.date) {
//     newJournalEntry.date = new Date().toISOString();
//   }

//   const entries = readJsonFile(journalPath);
//   entries.unshift(newJournalEntry);
//   writeJsonFile(journalPath, entries);

//   console.log("✅ Saved new journal entry.");
//   res.status(200).json({ message: "Journal entry saved successfully!" });
// });

// // =====================
// //  COMMUNITIES ENDPOINTS
// // =====================

// // --- GET /api/get-communities ---
// app.get("/api/get-communities", (req, res) => {
//   try {
//     const communities = readJsonFile(communitiesPath);
//     res.status(200).json(communities);
//   } catch (err) {
//     console.error("❌ Failed to read communities:", err);
//     res.status(500).json({ message: "Could not retrieve communities." });
//   }
// });

// // --- POST /api/save-community ---
// app.post("/api/save-community", (req, res) => {
//   const newCommunity = req.body;

//   if (!newCommunity || !newCommunity.name || !newCommunity.description) {
//     return res.status(400).json({
//       message: "Invalid community data. Name and description are required.",
//     });
//   }

//   const communities = readJsonFile(communitiesPath);
//   const newEntry = {
//     id: Date.now(),
//     name: newCommunity.name,
//     description: newCommunity.description,
//     createdAt: new Date().toISOString(),
//   };
//   communities.push(newEntry);
//   writeJsonFile(communitiesPath, communities);

//   console.log("✅ Saved new community:", newCommunity.name);
//   res.status(200).json({ message: "Community saved successfully!" });
// });


// // =====================
// //  COMMUNITY MESSAGES ENDPOINTS
// // =====================

// /*
//   NOTE: Commenting out this section as it conflicts with the more scalable
//   "separate JSON per community" implementation below. Both were defining the
//   same routes, which would cause the second implementation to be ignored.
// */

// // const communityMessagesPath = path.join(dbDir, "communityMessages.json");
// //
// // app.get("/api/get-messages/:communityId", (req, res) => { ... });
// // app.post("/api/save-message", (req, res) => { ... });


// // =====================
// //  COMMUNITY MESSAGES (separate JSON per community) - This is the active implementation.
// // =====================

// const communitiesDir = path.join(dbDir, "communities");

// // Ensure communities directory exists
// if (!fs.existsSync(communitiesDir)) {
//   fs.mkdirSync(communitiesDir, { recursive: true });
//   console.log("🗂️  Created /db/communities directory");
// }

// // --- GET /api/get-messages/:communityId ---
// app.get("/api/get-messages/:communityId", (req, res) => {
//   try {
//     const { communityId } = req.params;
//     const filePath = path.join(communitiesDir, `${communityId}.json`);

//     if (!fs.existsSync(filePath)) {
//       // If the file doesn't exist, it means no messages yet. Return an empty array.
//       return res.status(200).json([]);
//     }

//     const messages = readJsonFile(filePath);
//     res.status(200).json(messages);
//   } catch (err) {
//     console.error("❌ Failed to read community messages:", err);
//     res.status(500).json({ message: "Could not retrieve messages." });
//   }
// });

// // --- POST /api/save-message ---
// app.post("/api/save-message", (req, res) => {
//   const newMessage = req.body;

//   if (!newMessage || !newMessage.communityId || !newMessage.text) {
//     return res.status(400).json({
//       message: "Invalid message data. Community ID and text are required.",
//     });
//   }

//   const filePath = path.join(communitiesDir, `${newMessage.communityId}.json`);
//   const messages = readJsonFile(filePath); // readJsonFile will create the file if it doesn't exist

//   const entry = {
//     id: Date.now(),
//     user: newMessage.user || "Anonymous",
//     text: newMessage.text,
//     timestamp: new Date().toISOString(),
//   };

//   messages.push(entry);
//   writeJsonFile(filePath, messages);

//   console.log(`💬 Saved message in community ${newMessage.communityId}`);
//   res.status(200).json({ message: "Message saved successfully!" });
// });


// // =====================
// //  SERVER START
// // =====================
// app.listen(PORT, () => {
//   console.log(`✅ Backend server running at http://localhost:${PORT}`);
// });



const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const os = require("os");
const { exec } = require("child_process"); // --- MODIFIED: Import exec for running shell commands
const { GoogleGenerativeAI } = require("@google/generative-ai"); // --- MODIFIED: Import Google Gemini
require("dotenv").config();

const app = express();
const PORT = 3001;

// --- MODIFIED: Initialize Gemini Client ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Multer Setup for file uploads (in-memory) ---
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- Paths ---
const dbDir = path.join(__dirname, "db");
const moodResultsPath = path.join(dbDir, "results.json");
const journalPath = path.join(dbDir, "journals.json");
const communitiesPath = path.join(dbDir, "communities.json");

// --- Ensure db folder exists ---
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log("🗂️  Created /db directory");
}

// --- Helper Functions ---
const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf8");
      return [];
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error(`❌ Error reading ${filePath}:`, err);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`❌ Error writing ${filePath}:`, err);
  }
};

// ===========================================
//  TRANSCRIPTION ENDPOINT (LOCAL WHISPER)
// ===========================================
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No audio file uploaded." });
  }

  // Define temporary file paths for input audio and output text
  const tempId = `recording-${Date.now()}`;
  const tempDir = os.tmpdir();
  const tempAudioPath = path.join(tempDir, `${tempId}.webm`);
  // Whisper CLI creates a .txt file with the same name as the input
  const tempTxtPath = path.join(tempDir, `${tempId}.webm.txt`);

  try {
    // 1. Write the audio buffer from multer to a temporary file
    await fs.promises.writeFile(tempAudioPath, req.file.buffer);
    console.log(`🎤 Audio saved to temporary file: ${tempAudioPath}`);

    // 2. Construct and execute the local Whisper command
    // We use the 'base' model for speed. You can change this to 'small', 'medium', etc.
    // The command tells Whisper to process our audio file and save the output in the same directory.
    // This is the new, corrected line
    const command = `whisper "${tempAudioPath}" --model base --output_dir "${tempDir}" --language en`;


    // ==================
// ✅ NEW CODE
// ==================
const stdout = await new Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Whisper exec error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return reject(new Error("Failed to transcribe audio."));
    }
    console.log(`Whisper stdout: ${stdout}`);
    resolve(stdout);
  });
});

// 3. Parse the transcription result directly from stdout
// This regex looks for the closing bracket ']' and captures all text after it.
const match = stdout.match(/]\s*(.*)/s);
const transcribedText = match ? match[1] : "";

    // 4. Send the transcribed text back to the client
    res.json({ text: transcribedText.trim() });

  } catch (error) {
    console.error("❌ Transcription process error:", error);
    res.status(500).json({ message: "Error transcribing audio." });
  } finally {
    // 5. Clean up: delete the temporary audio and text files
    try {
      await fs.promises.unlink(tempAudioPath);
    } catch (e) { console.error("Could not delete temp audio file", e); }
    try {
      // Only try to delete the text file if it was created
      if (fs.existsSync(tempTxtPath)) {
        await fs.promises.unlink(tempTxtPath);
      }
    } catch (e) { console.error("Could not delete temp text file", e); }
  }
});


// =====================
//  MOOD ENDPOINTS
// =====================
app.post("/api/save-mood", (req, res) => {
  const newEntry = req.body;
  if (!newEntry || !newEntry.mood) {
    return res.status(400).json({ message: "Invalid mood data received." });
  }
  const entries = readJsonFile(moodResultsPath);
  entries.push(newEntry);
  writeJsonFile(moodResultsPath, entries);
  console.log("✅ Saved new mood entry.");
  res.status(200).json({ message: "Mood saved successfully!" });
});


// ==================================
//  JOURNAL ENDPOINTS (WITH GEMINI)
// ==================================

// --- GET /api/get-journals ---
app.get("/api/get-journals", (req, res) => {
  try {
    const entries = readJsonFile(journalPath);
    const sortedEntries = entries.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    res.status(200).json(sortedEntries);
  } catch (err) {
    console.error("❌ Failed to read journals:", err);
    res.status(500).json({ message: "Could not retrieve journal entries." });
  }
});

// --- POST /api/save-journal ---
app.post("/api/save-journal", (req, res) => {
  const newJournalEntry = req.body;
  if (!newJournalEntry || !newJournalEntry.title || !newJournalEntry.content) {
    return res.status(400).json({ message: "Invalid journal data." });
  }
  if (!newJournalEntry.date) {
    newJournalEntry.date = new Date().toISOString();
  }
  const entries = readJsonFile(journalPath);
  entries.unshift(newJournalEntry);
  writeJsonFile(journalPath, entries);
  console.log("✅ Saved new journal entry.");
  res.status(200).json({ message: "Journal entry saved successfully!" });
});


// --- ✨ NEW ✨: POST /api/journal/analyze (Uses Gemini) ---
app.post("/api/journal/analyze", async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: "No text provided for analysis." });
    }

    try {
        // Use the gemini-pro model for text-based tasks
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a helpful mental wellness assistant. Analyze the following journal entry for its underlying mood, key themes, and potential cognitive distortions. Provide a short, compassionate, one-paragraph summary. Do not give medical advice. Journal Entry: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysis = response.text();

        res.json({ analysis });

    } catch (error) {
        console.error("❌ Gemini API error:", error);
        res.status(500).json({ message: "Failed to get analysis from AI." });
    }
});


// =====================
//  COMMUNITIES ENDPOINTS
// =====================
const communitiesDir = path.join(dbDir, "communities");
if (!fs.existsSync(communitiesDir)) {
  fs.mkdirSync(communitiesDir, { recursive: true });
  console.log("🗂️  Created /db/communities directory");
}

app.get("/api/get-communities", (req, res) => {
  const communities = readJsonFile(communitiesPath);
  res.status(200).json(communities);
});

app.post("/api/save-community", (req, res) => {
  const newCommunity = req.body;
  if (!newCommunity || !newCommunity.name) {
    return res.status(400).json({ message: "Invalid community data." });
  }
  const communities = readJsonFile(communitiesPath);
  const newEntry = {
    id: Date.now(),
    name: newCommunity.name,
    description: newCommunity.description,
    createdAt: new Date().toISOString(),
  };
  communities.push(newEntry);
  writeJsonFile(communitiesPath, communities);
  console.log("✅ Saved new community:", newCommunity.name);
  res.status(200).json({ message: "Community saved successfully!" });
});


// =====================
//  COMMUNITY MESSAGES ENDPOINTS
// =====================
app.get("/api/get-messages/:communityId", (req, res) => {
  const { communityId } = req.params;
  const filePath = path.join(communitiesDir, `${communityId}.json`);
  if (!fs.existsSync(filePath)) return res.status(200).json([]);
  const messages = readJsonFile(filePath);
  res.status(200).json(messages);
});

app.post("/api/save-message", (req, res) => {
  const newMessage = req.body;
  if (!newMessage || !newMessage.communityId || !newMessage.text) {
    return res.status(400).json({ message: "Invalid message data." });
  }
  const filePath = path.join(communitiesDir, `${newMessage.communityId}.json`);
  const messages = readJsonFile(filePath);
  const entry = {
    id: Date.now(),
    user: newMessage.user || "Anonymous",
    text: newMessage.text,
    timestamp: new Date().toISOString(),
  };
  messages.push(entry);
  writeJsonFile(filePath, messages);
  console.log(`💬 Saved message in community ${newMessage.communityId}`);
  res.status(200).json({ message: "Message saved successfully!" });
});

// =====================
//  SERVER START
// =====================
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});