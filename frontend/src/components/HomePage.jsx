import {
  Heart,
  BookOpen,
  BarChart3,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage({ onNavigate }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Helper function to get YouTube thumbnail from URL ---
  const getYoutubeThumbnail = (url) => {
    let videoId = "";
    try {
      // Ensure the URL is valid before proceeding
      const urlObj = new URL(url);
      if (urlObj.hostname === "youtu.be") {
        // Handles short URLs like https://youtu.be/VIDEO_ID
        videoId = urlObj.pathname.slice(1);
      } else if (
        urlObj.hostname.includes("youtube.com") &&
        urlObj.searchParams.has("v")
      ) {
        // Handles standard URLs like https://www.youtube.com/watch?v=VIDEO_ID
        videoId = urlObj.searchParams.get("v");
      }
    } catch (error) {
      console.error("Invalid URL for thumbnail:", url, error);
      // Return a placeholder if the URL is malformed or invalid
      return "https://placehold.co/480x360/1e293b/ffffff?text=Invalid+Link";
    }

    if (videoId) {
      // Use mqdefault for medium quality, or hqdefault for high quality
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }

    // Return a generic placeholder if no video ID could be extracted
    return "https://placehold.co/480x360/1e293b/ffffff?text=Video";
  };

  // --- Fetch recommendations when the component loads ---
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const backendHost = window.location.hostname;
        const backendPort = 5000;
        const backendOrigin =
          backendHost === "localhost" || backendHost === "127.0.0.1"
            ? `${window.location.protocol}//${backendHost}:${backendPort}`
            : "";
        const url = `${backendOrigin}/api/recommend`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
        }

        const data = await res.json();
        // Ensure we have an array to prevent mapping errors
        setRecommendations(data.youtube_videos || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        // Set to empty array on error so nothing shows
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-6xl mb-6 text-white drop-shadow-lg">
          Welcome to Pulse
        </h1>
        <p className="text-xl text-blue-50 max-w-2xl mx-auto">
          Track your emotions, reflect on your day, and gain insights into your
          mental wellness journey.
        </p>
      </div>

      {/* --- Recommendations Section --- */}
      {isLoading ? (
        <div className="text-center text-white p-8">
          Loading recommendations...
        </div>
      ) : (
        recommendations.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-6">
              Recommended For You
            </h2>
            {/* Horizontally scrolling container */}
            <div className="flex overflow-x-auto space-x-6 pb-4 -mx-6 px-6">
              {recommendations.map((video, index) => (
                <a
                  key={index}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block flex-shrink-0 w-72 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={getYoutubeThumbnail(video.url)}
                      alt={video.title}
                      className="w-full h-40 object-cover transition-transform group-hover:scale-110"
                      // Add a fallback for broken image links
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/480x360/1e293b/ffffff?text=Video+Not+Found";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <div className="p-4">
                    <h4
                      className="font-semibold text-gray-800 truncate"
                      title={video.title}
                    >
                      {video.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )
      )}
      {/* --- END of Recommendations Section --- */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {/* Mood Tracker */}
        <div
          onClick={() => onNavigate("mood")}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 cursor-pointer hover:bg-white/90 transition-all hover:scale-105"
        >
          <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-2xl mb-3 text-gray-800">Track Your Mood</h3>
          <p className="text-gray-700 mb-4">
            Log how you're feeling with our simple and intuitive mood tracker.
          </p>
          <div className="flex items-center gap-2 text-teal-600">
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Journal */}
        <div
          onClick={() => onNavigate("journal")}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 cursor-pointer hover:bg-white/90 transition-all hover:scale-105"
        >
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-2xl mb-3 text-gray-800">Daily Journal</h3>
          <p className="text-gray-700 mb-4">
            Write down your thoughts and reflect on your experiences.
          </p>
          <div className="flex items-center gap-2 text-amber-600">
            <span>Start writing</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Insights */}
        <div
          onClick={() => onNavigate("insights")}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 cursor-pointer hover:bg-white/90 transition-all hover:scale-105"
        >
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-2xl mb-3 text-gray-800">View Insights</h3>
          <p className="text-gray-700 mb-4">
            Understand patterns in your mood and emotional well-being.
          </p>
          <div className="flex items-center gap-2 text-purple-600">
            <span>See insights</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Chatbot */}
        <div
          onClick={() => onNavigate("talk")}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 cursor-pointer hover:bg-white/90 transition-all hover:scale-105"
        >
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl mb-3 text-gray-800">Chat with Bot</h3>
          <p className="text-gray-700 mb-4">
            Talk to our AI assistant and get guidance or just share your
            thoughts.
          </p>
          <div className="flex items-center gap-2 text-blue-600">
            <span>Start chatting</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => onNavigate("mood")}
          className="bg-white text-teal-700 px-8 py-4 rounded-full hover:bg-teal-50 transition-colors shadow-md"
        >
          Start Tracking Today
        </button>
      </div>
    </div>
  );
}
