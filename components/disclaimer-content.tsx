"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"

export function DisclaimerContent() {
  const disclaimers = [
    {
      title: "Investment Risk Warning",
      content: "Digital assets and DeFi protocols involve substantial risk of loss and are not suitable for all investors. The value of digital assets can go down as well as up, and you may lose some or all of your investment. Past performance is not indicative of future results."
    },
    {
      title: "Smart Contract Risks",
      content: "While our smart contracts have been audited, they may contain bugs, vulnerabilities, or other issues that could result in loss of funds. Smart contract technology is experimental and carries inherent risks."
    },
    {
      title: "Regulatory Uncertainty",
      content: "The regulatory environment for digital assets and DeFi is evolving and uncertain. Changes in laws or regulations may adversely affect the value or use of our services."
    },
    {
      title: "Technology Risks",
      content: "Blockchain technology, smart contracts, and related technologies are experimental and may have bugs, vulnerabilities, or other issues. Network congestion, forks, or other technical issues may affect service availability."
    },
    {
      title: "Market Volatility",
      content: "Digital asset markets are highly volatile and unpredictable. Prices can fluctuate dramatically in short periods, which may result in significant losses."
    },
    {
      title: "No Financial Advice",
      content: "Nothing on our platform constitutes financial, investment, or legal advice. All information is provided for educational purposes only. You should consult with qualified professionals before making investment decisions."
    },
    {
      title: "Third-Party Risks",
      content: "Our protocol may integrate with third-party services, protocols, or tokens. We do not control these third parties and are not responsible for their actions, failures, or risks."
    },
    {
      title: "No Guarantees",
      content: "We make no representations or warranties about the accuracy, reliability, or completeness of any information on our platform. All information is provided 'as is' without warranty of any kind."
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
      <div className="max-w-4xl mx-auto">
        {/* Warning Banner */}
        <motion.div
          className="mb-8 p-6 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-orange-600 dark:text-orange-400 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200 mb-2">
                Important Risk Warning
              </h3>
              <p className="text-orange-700 dark:text-orange-300">
                Please read this disclaimer carefully before using CeloRate. By using our services, you acknowledge and accept these risks.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer Sections */}
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {disclaimers.map((disclaimer, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <h2 className="text-xl font-bold mb-4 text-primary">{disclaimer.title}</h2>
              <p className="text-foreground/70 leading-relaxed">{disclaimer.content}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Final Warning */}
        <motion.div
          className="mt-12 p-8 rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <AlertTriangle size={48} className="text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4 text-red-800 dark:text-red-200">
            Proceed at Your Own Risk
          </h3>
          <p className="text-red-700 dark:text-red-300 leading-relaxed max-w-2xl mx-auto">
            By using CeloRate, you acknowledge that you have read, understood, and agree to this disclaimer. 
            You are solely responsible for your investment decisions and any losses that may occur.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
