"use client"

import { motion } from "framer-motion"
import { Target, Globe, Shield, Users, Zap, Eye } from "lucide-react"

export function MissionSection() {
  const missions = [
    {
      icon: Target,
      title: "Accessibility",
      description: "Making DeFi accessible to everyone, everywhere, with simple and intuitive interfaces.",
    },
    {
      icon: Shield,
      title: "Security",
      description: "Building on audited smart contracts with multi-sig governance for maximum security.",
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "Every transaction is on-chain and publicly verifiable for complete transparency.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Serving users worldwide with mobile-first design and low transaction costs.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a strong community of users, developers, and partners in the Celo ecosystem.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously innovating to provide the best fixed-rate lending experience.",
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
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Our Mission & Vision</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            We're committed to building a more inclusive and transparent financial system.
          </p>
        </motion.div>

        {/* Mission Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {missions.map((mission, index) => {
            const Icon = mission.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur hover:border-primary/50 hover:bg-card transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{mission.title}</h3>
                <p className="text-foreground/60">{mission.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Vision Statement */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
            <p className="text-xl text-foreground/70 leading-relaxed">
              To become the leading fixed-rate lending protocol on Celo, enabling millions of users 
              worldwide to access secure, transparent, and predictable financial services. We envision 
              a future where DeFi is as accessible and reliable as traditional finance, but with the 
              added benefits of transparency, global accessibility, and user control.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
