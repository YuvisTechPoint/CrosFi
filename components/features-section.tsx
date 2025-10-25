"use client"

import { motion } from "framer-motion"
import { BarChart3, Lock, Zap, Eye, Users, Shield } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Multi-Currency Support",
      description: "Access cUSD, cEUR, cREAL, and eXOF liquidity with any currency as collateral.",
    },
    {
      icon: Lock,
      title: "Mento Oracle Integration",
      description: "Real-time exchange rates via decentralized Mento Protocol oracles.",
    },
    {
      icon: Zap,
      title: "Instant Cross-Currency Loans",
      description: "Borrow in any currency instantly using different currency collateral.",
    },
    {
      icon: Eye,
      title: "Transparent Risk Management",
      description: "Real-time health factors and liquidation thresholds for all positions.",
    },
    {
      icon: Users,
      title: "Global Liquidity Access",
      description: "Access liquidity pools across all supported Celo stablecoins.",
    },
    {
      icon: Shield,
      title: "Smart Contract Security",
      description: "Audited contracts with multi-sig governance. Your funds are protected.",
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
    <section
      id="features"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Cross-Currency Features</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Everything you need for secure, transparent, and efficient cross-currency lending.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
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
                className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur hover:border-primary/50 hover:bg-card transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-foreground/60">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          className="mt-20 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-bold">Feature</th>
                <th className="text-center py-4 px-4 font-bold">celorate</th>
                <th className="text-center py-4 px-4 font-bold">Traditional Banks</th>
                <th className="text-center py-4 px-4 font-bold">Other DeFi</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Cross-Currency Lending", celorate: true, banks: false, defi: false },
                { feature: "Multi-Currency Collateral", celorate: true, banks: false, defi: false },
                { feature: "Real-time Exchange Rates", celorate: true, banks: false, defi: false },
                { feature: "24/7 Access", celorate: true, banks: false, defi: true },
                { feature: "No Intermediaries", celorate: true, banks: false, defi: true },
                { feature: "Instant Settlement", celorate: true, banks: false, defi: true },
                { feature: "Transparent Fees", celorate: true, banks: false, defi: true },
              ].map((row, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-4 px-4 font-medium">{row.feature}</td>
                  <td className="text-center py-4 px-4">
                    {row.celorate ? (
                      <span className="text-primary font-bold">✓</span>
                    ) : (
                      <span className="text-foreground/30">✗</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.banks ? (
                      <span className="text-foreground/50">✓</span>
                    ) : (
                      <span className="text-foreground/30">✗</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.defi ? (
                      <span className="text-foreground/50">✓</span>
                    ) : (
                      <span className="text-foreground/30">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  )
}
