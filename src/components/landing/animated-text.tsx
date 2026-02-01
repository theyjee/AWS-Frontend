import React from "react"
import { motion } from "framer-motion"

interface AnimatedTextProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'
  className?: string
  delay?: number
}

export function AnimatedText({ children, as: Component = "div", className, delay = 0 }: AnimatedTextProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionComponent = (motion as any)[Component];
  
  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </MotionComponent>
  )
}
