import Layout from "../components/Layout";
import { User, Mail, Bell, Lock, Palette, Globe } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 text-white drop-shadow-md">
          <h1 className="text-5xl mb-2">Profile & Settings</h1>
          <p className="text-xl opacity-90">Manage your account and preferences</p>
        </div>

        {/* Profile Info */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl text-gray-800 mb-1">Welcome back!</h2>
              <p className="text-gray-600">Member since October 2025</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Full Name</label>
              <input type="text" defaultValue="test user" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input type="email" defaultValue="test.user@email.com" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8">
          <h2 className="text-2xl text-gray-800 mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" /> Notifications
          </h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">App Notifications</span>
            <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="w-6 h-6 accent-teal-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Daily Mood Reminder</span>
            <input type="checkbox" checked={dailyReminder} onChange={() => setDailyReminder(!dailyReminder)} className="w-6 h-6 accent-teal-600" />
          </div>
        </div>

        {/* Account Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: <Lock className="w-6 h-6 text-purple-600" />, title: "Change Password", desc: "Update your account security." },
            { icon: <Palette className="w-6 h-6 text-amber-600" />, title: "Theme & Appearance", desc: "Customize your look and feel." },
            { icon: <Globe className="w-6 h-6 text-green-600" />, title: "Language", desc: "Choose your preferred language." },
            { icon: <Mail className="w-6 h-6 text-blue-600" />, title: "Contact Support", desc: "Get help from our team." },
          ].map((item, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/90 transition">
              <div className="flex items-center gap-4 mb-3">
                {item.icon}
                <h3 className="text-xl text-gray-800">{item.title}</h3>
              </div>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
