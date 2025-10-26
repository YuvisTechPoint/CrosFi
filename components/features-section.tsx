"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Globe, Smartphone, Lock, TrendingUp } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Secure Cross-Currency Lending",
      description: "Borrow in any currency while using another as collateral. Our smart contracts ensure secure, transparent transactions across all Celo stablecoins.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Zap,
      title: "Algorithmic Interest Rates",
      description: "Dynamic interest rates that adjust automatically based on supply and demand, ensuring competitive rates for both lenders and borrowers.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description: "Access cross-currency lending from anywhere in the world. No traditional banking barriers or geographic restrictions.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Built for mobile users with intuitive interfaces. Access DeFi lending directly from your smartphone with ease.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Lock,
      title: "Automated Risk Management",
      description: "Advanced liquidation protection and risk management systems ensure the safety of your funds across all currency pairs.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      title: "Yield Optimization",
      description: "Maximize your returns with auto-compounding features and yield farming opportunities across multiple currency pairs.",
      color: "text-primary",
      bgColor: "bg-primary/10",
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
          <h2 className="text-4xl sm:text-5xl font-display mb-4 text-balance">
            Powerful Features for <span className="text-gradient-purple">Cross-Currency Lending</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto font-heading">
            Experience the future of decentralized finance with our innovative cross-currency lending protocol.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={feature.color} />
                </div>
                <h3 className="text-lg font-heading mb-2">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed font-heading">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full">
            <Zap size={20} className="text-primary" />
            <span className="text-sm font-heading text-primary">
              Built on Celo's Carbon-Negative Blockchain
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
