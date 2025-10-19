import Layout from "../components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Calendar, Heart, BookOpen } from "lucide-react";

export default function InsightsPage() {
  const moodData = [
    { day: "Mon", score: 3.5 },
    { day: "Tue", score: 4.2 },
    { day: "Wed", score: 3.8 },
    { day: "Thu", score: 4.5 },
    { day: "Fri", score: 4.8 },
    { day: "Sat", score: 4.3 },
    { day: "Sun", score: 4.0 },
  ];

  const weeklyStats = [
    { week: "Week 1", mood: 3.5, entries: 5 },
    { week: "Week 2", mood: 3.8, entries: 6 },
    { week: "Week 3", mood: 4.2, entries: 7 },
    { week: "Week 4", mood: 4.0, entries: 6 },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 text-white drop-shadow-md">
          <h1 className="text-5xl mb-2">Your Insights</h1>
          <p className="text-xl opacity-90">Track your emotional patterns and progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: <Heart className="w-5 h-5 text-teal-600" />,
              bg: "bg-teal-100",
              title: "Avg. Mood",
              value: "4.2/5",
              subtitle: "↑ 12% from last week",
              color: "text-green-600",
            },
            {
              icon: <BookOpen className="w-5 h-5 text-amber-600" />,
              bg: "bg-amber-100",
              title: "Journal Entries",
              value: "24",
              subtitle: "This month",
              color: "text-gray-600",
            },
            {
              icon: <Calendar className="w-5 h-5 text-purple-600" />,
              bg: "bg-purple-100",
              title: "Streak",
              value: "12 days",
              subtitle: "Keep it up!",
              color: "text-gray-600",
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-green-600" />,
              bg: "bg-green-100",
              title: "Improvement",
              value: "+18%",
              subtitle: "vs. last month",
              color: "text-gray-600",
            },
          ].map((item, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${item.bg} p-2 rounded-lg`}>{item.icon}</div>
                <span className="text-sm text-gray-600">{item.title}</span>
              </div>
              <p className="text-3xl text-gray-800">{item.value}</p>
              <p className={`text-sm mt-1 ${item.color}`}>{item.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl mb-6 text-gray-800">Daily Mood This Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis domain={[0, 5]} stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={3} dot={{ fill: "#14B8A6", r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl mb-6 text-gray-800">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px" }} />
                <Bar dataKey="mood" fill="#14B8A6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Patterns */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl mb-6 text-gray-800">Mood Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
              <p className="text-sm text-gray-700 mb-2">Most Common Mood</p>
              <p className="text-2xl text-gray-800">Happy 😊</p>
              <p className="text-sm text-gray-600 mt-1">65% of the time</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <p className="text-sm text-gray-700 mb-2">Best Day</p>
              <p className="text-2xl text-gray-800">Friday</p>
              <p className="text-sm text-gray-600 mt-1">Avg mood: 4.8/5</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-gray-700 mb-2">Best Time</p>
              <p className="text-2xl text-gray-800">Morning</p>
              <p className="text-sm text-gray-600 mt-1">10 AM - 12 PM</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
