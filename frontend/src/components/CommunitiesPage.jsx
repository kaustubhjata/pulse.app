import { useState, useEffect } from "react";
import { Users, MessageSquare, Plus, Send, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // --- Fetch communities ---
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await fetch("/api/get-communities");
        const data = await res.json();
        setCommunities(data);
      } catch (err) {
        console.error("Error fetching communities:", err);
        toast.error("Failed to load communities");
      }
    };
    fetchCommunities();
  }, []);

  // --- Fetch messages for selected community ---
  useEffect(() => {
    if (!selectedCommunity) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/get-messages/${selectedCommunity.id}`);
        const data = await res.json();
        if (data.length === 0) {
          setMessages([
            {
              id: 1,
              user: "System",
              text: "Welcome to this community! Start chatting below.",
              timestamp: new Date().toISOString(),
            },
          ]);
        } else {
          setMessages(data);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      }
    };
    fetchMessages();
  }, [selectedCommunity]);

  // --- Create community ---
  const handleCreateCommunity = async () => {
    if (!newCommunity.name || !newCommunity.description) {
      toast.error("Please enter both name and description");
      return;
    }

    const response = await fetch("/api/save-community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCommunity),
    });

    if (response.ok) {
      toast.success("Community created!");
      setNewCommunity({ name: "", description: "" });
      setShowNewForm(false);
      const res = await fetch("/api/get-communities");
      setCommunities(await res.json());
    } else {
      toast.error("Failed to create community");
    }
  };

  // --- Send message ---
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageObj = {
      communityId: selectedCommunity.id,
      text: newMessage,
      user: "You",
    };

    try {
      const res = await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageObj),
      });
      if (!res.ok) throw new Error("Failed to send message");

      setMessages((prev) => [
        ...prev,
        { ...messageObj, id: Date.now(), timestamp: new Date().toISOString() },
      ]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Could not send message");
    }
  };

  // --- Show discussion view ---
  if (selectedCommunity) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-6 pt-32 pb-40">
        <button
          onClick={() => setSelectedCommunity(null)}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Communities
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-md">
          <h2 className="text-3xl font-semibold text-teal-700 mb-4">{selectedCommunity.name}</h2>
          <p className="text-gray-700 mb-8">{selectedCommunity.description}</p>

          <div className="bg-gray-50 rounded-2xl p-6 h-96 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div className="text-gray-800"dangerouslySetInnerHTML={{__html: msg.text.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer" class="text-teal-600 underline hover:text-teal-800">$1</a>'
    ),
  }}
/>

            ))}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main community list view ---
  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 pt-32 pb-40">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-3">Communities</h1>
        <p className="text-xl text-blue-50">
          Connect, share, and grow with others on similar journeys.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-10 shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Your Communities</h2>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-xl hover:bg-teal-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create New
          </button>
        </div>

        {showNewForm && (
          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Community name"
              value={newCommunity.name}
              onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />
            <textarea
              placeholder="Community description"
              value={newCommunity.description}
              onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />
            <button
              onClick={handleCreateCommunity}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition"
            >
              Save Community
            </button>
          </div>
        )}
      </div>

      {/* Community list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {communities.length === 0 ? (
          <p className="text-gray-600">No communities yet. Create one to get started!</p>
        ) : (
          communities.map((community) => (
            <div
              key={community.id}
              onClick={() => setSelectedCommunity(community)}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/90 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <Users className="text-teal-600 w-6 h-6" />
                <h3 className="text-xl font-semibold text-gray-800">{community.name}</h3>
              </div>
              <p className="text-gray-700 mb-4">{community.description}</p>
              <div className="flex items-center gap-2 text-teal-600">
                <MessageSquare className="w-4 h-4" />
                <span>Join Discussion</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
