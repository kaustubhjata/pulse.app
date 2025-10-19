import {
  Home,
  Heart,
  BookOpen,
  BarChart3,
  Info,
  User,
  MessageCircle,
  Users, // ✅ for communities
} from "lucide-react";

export default function Navigation({ currentPage, onNavigate }) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "mood", label: "Mood", icon: Heart },
    { id: "talk", label: "Chat", icon: MessageCircle },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "insights", label: "Insights", icon: BarChart3 },
    { id: "communities", label: "Communities", icon: Users }, // ✅ FIXED LINE
    { id: "about", label: "About", icon: Info },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-teal-600" />
            <span className="text-teal-600 font-semibold">Pulse</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-teal-100 text-teal-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
