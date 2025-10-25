"use client"

import { motion } from "framer-motion"

export function TermsContent() {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: "By accessing and using CeloRate's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      id: "description",
      title: "Description of Service",
      content: "CeloRate provides a decentralized lending protocol on the Celo blockchain that enables users to lend and borrow digital assets with fixed interest rates. Our service includes smart contracts, user interfaces, and related tools."
    },
    {
      id: "user-responsibilities",
      title: "User Responsibilities",
      content: "Users are responsible for maintaining the security of their wallets and private keys, understanding the risks associated with DeFi protocols, and complying with applicable laws and regulations in their jurisdiction."
    },
    {
      id: "prohibited-uses",
      title: "Prohibited Uses",
      content: "You may not use our service for illegal activities, money laundering, fraud, or any activity that violates applicable laws. You may not attempt to hack, disrupt, or exploit our smart contracts or systems."
    },
    {
      id: "risks",
      title: "Risks and Disclaimers",
      content: "DeFi protocols involve significant risks including smart contract risks, market volatility, and potential loss of funds. Users should only invest what they can afford to lose and should understand these risks before participating."
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      content: "CeloRate shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from your use of the service."
    },
    {
      id: "governance",
      title: "Protocol Governance",
      content: "CeloRate operates as a decentralized protocol. Governance decisions may be made through community voting using governance tokens. Users may participate in governance according to the protocol's governance mechanisms."
    },
    {
      id: "modifications",
      title: "Service Modifications",
      content: "We reserve the right to modify, suspend, or discontinue any part of our service at any time. We will provide reasonable notice of significant changes when possible."
    },
    {
      id: "termination",
      title: "Termination",
      content: "We may terminate or suspend your access to our service immediately, without prior notice, for any reason, including breach of these terms."
    },
    {
      id: "governing-law",
      title: "Governing Law",
      content: "These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles."
    },
    {
      id: "changes-terms",
      title: "Changes to Terms",
      content: "We reserve the right to modify these terms at any time. We will notify users of material changes through our platform or other communication methods."
    },
    {
      id: "contact",
      title: "Contact Information",
      content: "For questions about these terms, please contact us at legal@celorate.com or through our contact page."
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
        {/* Last Updated */}
        <motion.div
          className="mb-8 p-4 rounded-lg border border-primary/20 bg-primary/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-foreground/70">
            <strong>Last Updated:</strong> January 15, 2024
          </p>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {sections.map((section) => (
            <motion.div
              key={section.id}
              id={section.id}
              variants={itemVariants}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <h2 className="text-2xl font-bold mb-4 text-primary">{section.title}</h2>
              <p className="text-foreground/70 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold mb-4">Questions About Our Terms?</h3>
          <p className="text-foreground/70 mb-6">
            If you have any questions about these terms of service, please contact our legal team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:legal@celorate.com"
              className="px-6 py-3 border border-primary/20 hover:border-primary/50 text-primary rounded-lg font-medium transition-colors"
            >
              Email Legal Team
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
