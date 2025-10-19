import Layout from "../components/Layout";
import { Plus, Calendar, Search } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null); // For modal view

  // Fetch journals from the server on component load
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await fetch("/api/get-journals");
        const data = await response.json();
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setEntries(sortedData);
      } catch (error) {
        console.error("Failed to fetch journals:", error);
        toast.error("Could not load journal entries.");
      }
    };
    fetchJournals();
  }, []);

  // Filter entries whenever search term changes
  useEffect(() => {
    const results = entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEntries(results);
  }, [searchTerm, entries]);

  // Save handler
  const handleSaveEntry = async () => {
    if (!newTitle && !newContent) {
      toast.error("Cannot save an empty entry.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      title: newTitle || "Untitled Entry",
      content: newContent,
      preview:
        newContent.substring(0, 100) + (newContent.length > 100 ? "..." : ""),
    };

    try {
      const response = await fetch("/api/save-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) throw new Error("Server failed to save the entry.");

      setEntries([newEntry, ...entries]);
      setNewTitle("");
      setNewContent("");
      setShowNewEntry(false);
      toast.success("Journal entry saved!");
    } catch (error) {
      console.error("Failed to save entry:", error);
      toast.error("Could not save journal entry.");
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        {/* Header and New Entry button */}
        <div className="flex items-center justify-between mb-12 text-white drop-shadow-md">
          <div>
            <h1 className="text-5xl mb-2">Journal</h1>
            <p className="text-xl opacity-90">
              Your personal space for thoughts and reflections
            </p>
          </div>
          <button
            onClick={() => setShowNewEntry(!showNewEntry)}
            className="bg-white text-teal-600 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        {/* New Entry Form */}
        {showNewEntry && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Entry title..."
              className="w-full text-2xl mb-4 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your thoughts..."
              className="w-full h-64 p-4 rounded-xl border border-gray-300 resize-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveEntry}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700"
              >
                Save Entry
              </button>
              <button
                onClick={() => setShowNewEntry(false)}
                className="px-8 py-3 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Journal Entries Preview List */}
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/90 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl text-gray-800 font-semibold">
                  {entry.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(entry.date)}</span>
                </div>
              </div>

              {/* Preview content */}
              <div className="text-gray-700 mt-2">
                <p>
                  {entry.content.length > 120
                    ? entry.content.substring(0, 120) + "..."
                    : entry.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for full journal view */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative shadow-xl">
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl"
              >
                ✕
              </button>

              <h2 className="text-3xl font-semibold text-gray-800 mb-2">
                {selectedEntry.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {formatDate(selectedEntry.date)}
              </p>

              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {selectedEntry.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
