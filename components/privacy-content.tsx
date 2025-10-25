"use client"

import { motion } from "framer-motion"

export function PrivacyContent() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      content: "CeloRate ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized lending protocol and related services."
    },
    {
      id: "information-collection",
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your wallet address, transaction data, and communication preferences."
    },
    {
      id: "blockchain-data",
      title: "Blockchain Data",
      content: "Since CeloRate operates on the Celo blockchain, all transactions are publicly visible. We do not control or have access to your private keys, but we may analyze publicly available blockchain data to improve our services."
    },
    {
      id: "usage-information",
      title: "Usage Information",
      content: "We collect information about how you interact with our platform, including pages visited, features used, and time spent on our services. This helps us improve user experience and platform performance."
    },
    {
      id: "cookies-tracking",
      title: "Cookies and Tracking",
      content: "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings."
    },
    {
      id: "data-usage",
      title: "How We Use Your Information",
      content: "We use collected information to provide, maintain, and improve our services, process transactions, communicate with you, ensure security, and comply with legal obligations."
    },
    {
      id: "data-sharing",
      title: "Information Sharing",
      content: "We do not sell your personal information. We may share information with service providers, legal authorities when required, or in connection with business transfers, always with appropriate safeguards."
    },
    {
      id: "data-security",
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure."
    },
    {
      id: "your-rights",
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information. You can also opt out of certain communications and request data portability. Contact us to exercise these rights."
    },
    {
      id: "data-retention",
      title: "Data Retention",
      content: "We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements."
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers."
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      content: "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information."
    },
    {
      id: "policy-changes",
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the 'Last Updated' date."
    },
    {
      id: "contact-us",
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy or our privacy practices, please contact us at privacy@celorate.com or through our contact page."
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
        {/* Table of Contents */}
        <motion.div
          className="mb-12 p-6 rounded-xl border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm text-foreground/60 hover:text-primary transition-colors py-1"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </div>
        </motion.div>

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
          <h3 className="text-xl font-bold mb-4">Questions About Your Privacy?</h3>
          <p className="text-foreground/70 mb-6">
            We're committed to transparency and protecting your privacy. If you have any questions or concerns, please don't hesitate to reach out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:privacy@celorate.com"
              className="px-6 py-3 border border-primary/20 hover:border-primary/50 text-primary rounded-lg font-medium transition-colors"
            >
              Email Privacy Team
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
