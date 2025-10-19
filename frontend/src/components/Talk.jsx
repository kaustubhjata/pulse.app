import Layout from "./Layout.jsx";

export default function Talk() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center">
        <h1 className="text-5xl text-white drop-shadow-lg mb-12">Chat with Pulse</h1>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Bot message box */}
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-gray-100 min-h-[200px]">
            <h3 className="text-lg font-semibold mb-2">Pulse Bot</h3>
            <p>Hello! How are you feeling today?</p>
          </div>

          {/* Glass-like central button */}
          <button className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-full px-10 py-6 text-white text-xl font-semibold shadow-lg hover:bg-white/30 transition-all">
            Talk
          </button>

          {/* User message box */}
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-gray-100 min-h-[200px]">
            <h3 className="text-lg font-semibold mb-2">You</h3>
            <p>Hi Pulse! I'm feeling a bit stressed today.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
