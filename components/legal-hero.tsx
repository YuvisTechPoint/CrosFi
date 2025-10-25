"use client"

import { motion } from "framer-motion"
import { Shield, Calendar, FileText } from "lucide-react"

interface LegalHeroProps {
  title: string
}

export function LegalHero({ title }: LegalHeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  const stats = [
    { icon: Shield, value: "Secure", label: "Data Protection" },
    { icon: Calendar, value: "Updated", label: "January 2024" },
    { icon: FileText, value: "Transparent", label: "Legal Terms" },
  ]

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <Shield size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">Legal Information</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
          {title}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-foreground/70 text-balance mb-12 max-w-2xl mx-auto"
        >
          Your privacy and data protection are important to us. Please read this policy carefully.
        </motion.p>

        {/* Stats */}
        <motion.div 
          variants={itemVariants} 
          className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-border/50"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon size={24} className="text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-foreground/60">{stat.label}</div>
              </div>
            )
          })}
        </motion.div>
      </motion.div>
    </section>
  )
}
