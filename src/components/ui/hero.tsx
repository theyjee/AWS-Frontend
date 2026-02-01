"use client"
import { useRef, useState, useEffect } from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Linkedin } from "lucide-react"
import Link from "next/link"
import { QuizDashboardPreview, AWSServiceIconsGrid } from "./hero-visualizations"

export default function HeroShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentVisualization, setCurrentVisualization] = useState<"dashboard" | "icons">("dashboard")
  
  // Auto-transition between dashboard and icons every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVisualization((prev) => (prev === "dashboard" ? "icons" : "dashboard"))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  const VisualizationComponent = currentVisualization === "dashboard" ? QuizDashboardPreview : AWSServiceIconsGrid

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C488F" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#3B5BA0" />
          </linearGradient>
          <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#2C488F" />
            <stop offset="70%" stopColor="#3B5BA0" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#2C488F", "#3B5BA0", "#1E3A6F", "#ffffff"]}
        speed={0.3}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#2C488F", "#ffffff"]}
        speed={0.2}
      />

      <header className="relative z-20 flex items-center justify-between p-4 md:p-6">
        <motion.div
          className="flex items-center group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.svg
            fill="currentColor"
            viewBox="0 0 250 80"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-10 w-auto text-white group-hover:drop-shadow-lg transition-all duration-300"
            style={{
              filter: "url(#logo-glow)",
            }}
            whileHover={{
              fill: "url(#logo-gradient)",
              rotate: [0, -2, 2, 0],
              transition: {
                fill: { duration: 0.3 },
                rotate: { duration: 0.6, ease: "easeInOut" },
              },
            }}
          >
            <motion.text
              x="125"
              y="55"
              textAnchor="middle"
              fontSize="45"
              fontWeight="bold"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill="currentColor"
              initial={{ opacity: 1 }}
              whileHover={{
                opacity: [1, 0.5, 1],
                transition: { duration: 1.2, ease: "easeInOut" },
              }}
            >
              Emraay
            </motion.text>
          </motion.svg>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [-10, -20, -10],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

      </header>

      <main className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-20 px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="text-left">
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
              style={{
                filter: "url(#glass-effect)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent rounded-full" />
              <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
                ✨ Master AWS Certification
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-none tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.span
                className="block font-light text-white/90 text-3xl md:text-4xl lg:text-5xl mb-2 tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #2C488F 30%, #3B5BA0 70%, #ffffff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "url(#text-glow)",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                Interactive
              </motion.span>
              <span className="block font-black text-white drop-shadow-2xl">AWS Quiz</span>
              <span className="block font-light text-white/80 italic">Platform</span>
            </motion.h1>

            <motion.p
              className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Test your knowledge with interactive quizzes and track your progress toward AWS certification.
              Practice with real scenarios, immediate feedback, and comprehensive explanations.
            </motion.p>

            <motion.div
              className="flex items-center gap-6 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Link href="/sign-up">
                <motion.button
                  className="px-10 py-4 rounded-full bg-[#2C488F] text-white font-semibold text-sm transition-all duration-300 hover:bg-[#3B5BA0] cursor-pointer shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right side - Auto-transitioning Visualizations */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative w-full aspect-[16/10] transform scale-110 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentVisualization}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <VisualizationComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer with Social Links */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-6 z-30">
        <motion.a
          href="https://emraaysolutions.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          title="Visit Website"
        >
          <Globe className="w-5 h-5" />
        </motion.a>
        <motion.a
          href="https://www.linkedin.com/company/emraay-solutions/posts/?feedView=all"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-slate-800/60 text-slate-300 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          title="Visit LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </motion.a>
      </div>

    </div>
  )
}
