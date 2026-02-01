"use client"
import { motion } from "framer-motion"
import { Cloud, Database, Server, Zap, Shield, Globe, BarChart3, CheckCircle2 } from "lucide-react"

// AWS Service Icons Grid
export function AWSServiceIconsGrid() {
  const services = [
    { icon: Cloud, name: "EC2", color: "from-[#2C488F]/40 to-[#3B5BA0]/40", delay: 0 },
    { icon: Database, name: "S3", color: "from-[#2C488F]/40 to-[#3B5BA0]/40", delay: 0.1 },
    { icon: Server, name: "Lambda", color: "from-[#3B5BA0]/40 to-[#4A6CB1]/40", delay: 0.2 },
    { icon: Zap, name: "DynamoDB", color: "from-[#2C488F]/40 to-[#3B5BA0]/40", delay: 0.3 },
    { icon: Shield, name: "IAM", color: "from-[#2C488F]/40 to-[#3B5BA0]/40", delay: 0.4 },
    { icon: Globe, name: "CloudFront", color: "from-[#3B5BA0]/40 to-[#4A6CB1]/40", delay: 0.5 },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-3 gap-8 p-8">
        {services.map((service, i) => {
          const Icon = service.icon
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: service.delay,
              }}
            >
              <motion.div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.color} backdrop-blur-sm border border-white/20 flex items-center justify-center mb-2`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: service.delay,
                  ease: "easeInOut",
                }}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>
              <span className="text-white/70 text-xs font-medium">{service.name}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Quiz Dashboard Preview
export function QuizDashboardPreview() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2C488F]" />
            <span className="text-white font-semibold">Quiz Progress</span>
          </div>
          <span className="text-white/60 text-sm">85%</span>
        </motion.div>
        
        {/* Progress Bar */}
        <motion.div
          className="h-3 bg-white/10 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#2C488F] to-[#3B5BA0] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "85%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Completed", value: "42", color: "text-green-400" },
            { label: "In Progress", value: "8", color: "text-blue-400" },
            { label: "Total", value: "50", color: "text-white" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-white/60 text-xs mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Recent Activity */}
        <div className="mt-6 space-y-2">
          {["EC2 Basics", "S3 Storage", "Lambda Functions"].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 text-white/70 text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
            >
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
