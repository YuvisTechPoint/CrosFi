"use client"

import { motion } from "framer-motion"
import { Heart, Lock, Users, Lightbulb, Award, Handshake } from "lucide-react"

export function ValuesSection() {
  const values = [
    {
      icon: Heart,
      title: "User-Centric",
      description: "Every decision we make is guided by what's best for our users and their financial well-being.",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Lock,
      title: "Security First",
      description: "We prioritize security above all else, implementing the highest standards in smart contract development.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      title: "Inclusivity",
      description: "We believe DeFi should be accessible to everyone, regardless of their technical knowledge or location.",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously push the boundaries of what's possible in decentralized finance.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from code quality to user experience.",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: Handshake,
      title: "Trust",
      description: "We build trust through transparency, reliability, and consistent delivery of our promises.",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Our Values</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            The principles that guide everything we do at CeloRate.
          </p>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${value.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={value.color} />
                </div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{value.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Values Statement */}
        <motion.div
          className="mt-20 p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Living Our Values</h3>
            <p className="text-lg text-foreground/70 leading-relaxed">
              These values aren't just words on a page—they're the foundation of our culture and the 
              driving force behind every decision we make. From our smart contract architecture to our 
              user interface design, every aspect of CeloRate reflects our commitment to these principles.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
