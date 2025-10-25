"use client"

import { motion } from "framer-motion"
import { Heart, Users, Zap, Globe, Award, Coffee } from "lucide-react"

export function CompanyCulture() {
  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness programs."
    },
    {
      icon: Users,
      title: "Remote First",
      description: "Work from anywhere in the world with flexible hours and async communication."
    },
    {
      icon: Zap,
      title: "Learning & Development",
      description: "Annual learning budget, conference attendance, and skill development programs."
    },
    {
      icon: Globe,
      title: "Global Team",
      description: "Collaborate with talented individuals from around the world in a diverse environment."
    },
    {
      icon: Award,
      title: "Equity Participation",
      description: "Share in the success of the company with competitive equity packages."
    },
    {
      icon: Coffee,
      title: "Work-Life Balance",
      description: "Flexible PTO, sabbaticals, and a culture that values personal time and family."
    }
  ]

  const values = [
    {
      title: "Innovation",
      description: "We encourage creative thinking and embrace new ideas that push the boundaries of DeFi."
    },
    {
      title: "Transparency",
      description: "Open communication, clear goals, and honest feedback are at the core of our culture."
    },
    {
      title: "Collaboration",
      description: "We believe the best solutions come from diverse teams working together."
    },
    {
      title: "Ownership",
      description: "Every team member has the autonomy to make decisions and drive impact."
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Our Culture & Benefits</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            We're building more than just a company - we're creating a community of passionate builders.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-foreground/60">{benefit.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Company Values */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">Our Values</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-xl font-bold mb-3 text-primary">{value.title}</h4>
                <p className="text-foreground/60">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Culture Statement */}
        <motion.div
          className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
          <p className="text-lg text-foreground/70 leading-relaxed max-w-3xl mx-auto">
            At CeloRate, we're not just building a DeFi protocol - we're creating the infrastructure 
            for a more inclusive and transparent financial system. If you're passionate about blockchain 
            technology, user experience, and making DeFi accessible to everyone, we'd love to hear from you.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
