"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <motion.div
        className="max-w-4xl mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-12 sm:p-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <motion.h2
          className="text-4xl sm:text-5xl font-bold mb-4 text-balance"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Ready to Start Cross-Currency Lending?
        </motion.h2>

        <motion.p
          className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join the future of cross-currency lending on Celo. Borrow in any currency, collateralize with another. Start with any amount.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white cursor-pointer">
            Start Lending
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="cursor-pointer">
            View Markets
          </Button>
        </motion.div>

        {/* Vault CTA */}
        <motion.div
          className="mt-12 pt-8 border-t border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-2">🌱 Earn 8% APY with CeloYield Vault</h3>
          <p className="text-foreground/60 mb-6">
            Maximize your yields on Celo stablecoins with automated optimization
          </p>
          <Link href="/vault">
            <Button size="lg" variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
              Launch Vault
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
