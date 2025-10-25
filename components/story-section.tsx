"use client"

import { motion } from "framer-motion"
import { Calendar, Target, Zap, Users } from "lucide-react"

export function StorySection() {
  const timeline = [
    {
      year: "2024 Q1",
      title: "The Vision",
      description: "Founded with a vision to democratize access to fixed-rate lending on the Celo blockchain, making DeFi more accessible and predictable for users worldwide.",
      icon: Target,
    },
    {
      year: "2024 Q2",
      title: "Protocol Development",
      description: "Built the core smart contracts and infrastructure for secure, transparent fixed-rate lending with zero counterparty risk.",
      icon: Zap,
    },
    {
      year: "2024 Q3",
      title: "Community Building",
      description: "Launched our community and began building partnerships with key players in the Celo ecosystem and DeFi space.",
      icon: Users,
    },
    {
      year: "2024 Q4",
      title: "Public Launch",
      description: "Successfully launched the CeloRate protocol, enabling users to earn predictable returns through fixed-rate lending.",
      icon: Calendar,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Our Story</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            From concept to reality, here's how we're building the future of decentralized lending.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {timeline.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div key={index} variants={itemVariants} className="flex gap-6">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                      <Icon size={20} className="text-primary" />
                    </div>
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-1 h-16 bg-gradient-to-b from-primary/50 to-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8 flex-1">
                  <div className="text-sm font-bold text-primary mb-2">{item.year}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          className="mt-20 p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-lg text-foreground/70 leading-relaxed">
              To create a more inclusive and transparent financial system by providing secure, 
              predictable fixed-rate lending solutions on the Celo blockchain. We believe that 
              everyone deserves access to fair and transparent financial services, regardless of 
              their location or economic status.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
