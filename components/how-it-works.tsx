"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Select Collateral Currency",
      description: "Choose from cUSD, cEUR, cREAL, or eXOF to use as collateral for your loan.",
    },
    {
      number: "02",
      title: "Choose Borrowing Currency",
      description: "Select the currency you want to borrow, different from your collateral.",
    },
    {
      number: "03",
      title: "Deposit Collateral",
      description: "Deposit your chosen collateral and see real-time conversion rates via Mento.",
    },
    {
      number: "04",
      title: "Receive Loan",
      description: "Get your loan in the desired currency with transparent terms and rates.",
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">How Cross-Currency Lending Works</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Create cross-currency positions in four simple steps. Borrow in any currency, collateralize with another.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="relative">
              {/* Card */}
              <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 h-full">
                <div className="text-4xl font-bold text-primary/30 mb-4">{step.number}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-foreground/60 text-sm">{step.description}</p>
              </div>

              {/* Arrow connector (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight size={24} className="text-primary/30" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
