import React from "react"
import { motion, Variants } from "framer-motion"

interface AnimatedGroupProps {
  children: React.ReactNode
  preset?: "blur-slide" | "slide" | "fade"
  className?: string
  delay?: number
}

const presets: Record<string, Variants> = {
  "blur-slide": {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" }
  },
  "slide": {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  "fade": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
}

export function AnimatedGroup({ children, preset = "fade", className, delay = 0 }: AnimatedGroupProps) {
  const variants = presets[preset]
  
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}
