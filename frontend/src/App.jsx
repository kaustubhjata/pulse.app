import { useState } from "react";
import HomePage from "./components/HomePage.jsx";
import MoodTrackerPage from "./components/MoodTrackerPage.jsx";
import JournalPage from "./components/JournalPage.jsx";
import InsightsPage from "./components/InsightsPage.jsx";
import TalkPage from "./components/Talk.jsx";
import Chatroom from "./components/Chatroom.jsx";
import AboutPage from "./components/AboutPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import CommunitiesPage from "./components/CommunitiesPage.jsx";
import Layout from "./components/Layout.jsx";
import Navigation from "./components/Navigation.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "mood":
        return <MoodTrackerPage />;
      case "journal":
        return <JournalPage />;
      case "insights":
        return <InsightsPage />;
      case "talk":
        return <Chatroom />;
      case "communities": // ✅ NEW
        return <CommunitiesPage />;
      case "about":
        return <AboutPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="pt-16">{renderPage()}</main>
    </Layout>
  );
}
