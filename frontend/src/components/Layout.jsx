import { useEffect, useState } from "react";

export default function Layout({ children }) {
  const [blobPosition, setBlobPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let animationFrame;

    const handleMouseMove = (e) => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        setVelocity({ x: dx, y: dy });
        lastX = e.clientX;
        lastY = e.clientY;
        setBlobPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-500 via-sky-400 to-orange-400 text-gray-900 transition-colors duration-700">
      {/* ✨ Interactive floating blob */}
      <div
        className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-50 transition-transform duration-300 ease-out"
        style={{
          background:
            "radial-gradient(circle at center, rgba(231, 231, 231, 0.5), rgba(255, 251, 251, 0.1) 70%)",
          transform: `translate(${blobPosition.x - 200}px, ${blobPosition.y - 200}px)
                      scale(${1 + Math.min(Math.abs(velocity.x + velocity.y) / 200, 0.3)})`,
        }}
      />

      {/* 🌈 Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
