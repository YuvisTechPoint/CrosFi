"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function Integrations() {
  const integrations = [
    { name: "Celo", logo: "/celo.png" },
    { name: "MetaMask", logo: "/metamask.png" },
    { name: "Ledger", logo: "/ledger.png" },
    { name: "Valora", logo: "/valora.jpg" },
    { name: "Uniswap", logo: "/uniswap.png" },
    { name: "Aave", logo: "/aave.jpg" },
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Integrated with Leading Platforms</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Seamlessly connect with your favorite wallets and DeFi protocols.
          </p>
        </motion.div>

        {/* Integration Logos */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-center justify-center p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-center">
                <div className="mb-2 group-hover:scale-110 transition-transform flex justify-center">
                  <Image
                    src={integration.logo}
                    alt={`${integration.name} logo`}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                <div className="text-sm font-medium text-foreground/70">{integration.name}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          className="mt-12 p-6 rounded-xl border border-primary/20 bg-primary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-foreground/70">
            More integrations coming soon. <span className="text-primary font-bold">Join our community</span> to stay
            updated.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
