"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Circle } from "lucide-react"

export function Roadmap() {
  const roadmapItems = [
    {
      quarter: "Q1 2025",
      title: "Protocol Launch",
      description: "Initial release with core lending functionality",
      completed: true,
    },
    {
      quarter: "Q2 2025",
      title: "Governance Token",
      description: "Launch RATE token and DAO governance",
      completed: false,
    },
    {
      quarter: "Q3 2025",
      title: "Cross-Chain Bridge",
      description: "Expand to Ethereum, Polygon, and Arbitrum",
      completed: false,
    },
    {
      quarter: "Q4 2025",
      title: "Advanced Features",
      description: "Derivatives, options, and structured products",
      completed: false,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="roadmap" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Our Roadmap</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Ambitious plans to revolutionize lending on Celo and beyond.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {roadmapItems.map((item, index) => (
            <motion.div key={index} variants={itemVariants} className="flex gap-6">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className="relative z-10">
                  {item.completed ? (
                    <CheckCircle2 size={32} className="text-primary fill-primary text-white" />
                  ) : (
                    <Circle size={32} className="text-border" />
                  )}
                </div>
                {index < roadmapItems.length - 1 && (
                  <div className="w-1 h-16 bg-gradient-to-b from-primary/50 to-border mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="pb-6">
                <div className="text-sm font-bold text-primary mb-1">{item.quarter}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-foreground/60">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
