import Layout from "../components/Layout";
import { Heart, Shield, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-16 text-white drop-shadow-md">
          <h1 className="text-5xl mb-4">About Pulse</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Your companion for emotional wellness and self-discovery
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 mb-12">
          <h2 className="text-3xl mb-6 text-gray-800">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Pulse was created to help people develop a deeper understanding of their emotional well-being.
            We believe that by tracking your moods and reflecting on your experiences, you can gain valuable insights into your mental health and make positive changes in your life.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Mental wellness is a journey, not a destination. We're here to support you every step of the way with intuitive tools that make self-reflection easy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {[
            { icon: <Heart className="w-8 h-8 text-teal-600" />, title: "Mindful Tracking", desc: "Simple, consistent emotional awareness tools.", bg: "bg-teal-100" },
            { icon: <Shield className="w-8 h-8 text-purple-600" />, title: "Privacy First", desc: "Your thoughts remain secure and confidential.", bg: "bg-purple-100" },
            { icon: <Target className="w-8 h-8 text-amber-600" />, title: "Meaningful Insights", desc: "Visualize trends and emotional triggers.", bg: "bg-amber-100" },
            { icon: <Users className="w-8 h-8 text-green-600" />, title: "Community Support", desc: "Connect with others on a shared journey.", bg: "bg-green-100" },
          ].map((item, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8">
              <div className={`${item.bg} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>{item.icon}</div>
              <h3 className="text-2xl mb-3 text-gray-800">{item.title}</h3>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-teal-100 to-purple-100 rounded-3xl p-12 text-center">
          <h2 className="text-3xl mb-4 text-gray-800">Start Your Journey Today</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Taking care of your mental health is essential. Begin tracking moods, journaling, and finding insights about yourself.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-teal-600 text-white px-8 py-4 rounded-full hover:bg-teal-700">Get Started</button>
            <button className="bg-white text-teal-600 px-8 py-4 rounded-full hover:bg-gray-50">Learn More</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
