"use client"

import { motion } from "framer-motion"
import { ChevronDown, MessageCircle, Mail, BookOpen, Users, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function SupportContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "How do I connect my wallet to CeloRate?",
      answer: "To connect your wallet, click the 'Connect Wallet' button in the top right corner of the interface. We support MetaMask, Valora, and other Celo-compatible wallets. Make sure you're connected to the Celo network."
    },
    {
      question: "What are the minimum deposit amounts?",
      answer: "The minimum deposit amount varies by asset. For CELO, the minimum is 0.1 CELO. For other assets, please check the specific pool details on our platform."
    },
    {
      question: "How do I withdraw my funds?",
      answer: "To withdraw your funds, go to your dashboard, select the deposit you want to withdraw, and click the 'Withdraw' button. Note that early withdrawals may incur penalties depending on the terms of your deposit."
    },
    {
      question: "What are the fees for using CeloRate?",
      answer: "CeloRate charges minimal fees for lending operations. There's a small protocol fee (typically 0.1-0.5%) and gas fees for blockchain transactions. All fees are transparent and displayed before you confirm any transaction."
    },
    {
      question: "Is my money safe on CeloRate?",
      answer: "Yes, CeloRate uses audited smart contracts and follows security best practices. Your funds are secured by blockchain technology and smart contract logic. However, as with any DeFi protocol, there are inherent risks that you should understand."
    },
    {
      question: "How do I earn interest on my deposits?",
      answer: "When you deposit assets into CeloRate, you automatically start earning fixed interest rates. The interest is calculated and added to your deposit balance. You can see your earnings in real-time on your dashboard."
    },
    {
      question: "What happens if I miss a payment?",
      answer: "CeloRate operates on a fixed-rate model, so there are no monthly payments to miss. Your interest is automatically calculated and added to your deposit. You only need to manage your initial deposit and any withdrawals."
    },
    {
      question: "Can I use CeloRate on mobile?",
      answer: "Yes, CeloRate is fully responsive and works on mobile devices. You can access it through your mobile browser or use wallet apps like Valora that have built-in browser functionality."
    }
  ]

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      responseTime: "Usually within minutes",
      availability: "24/7",
      action: "Start Chat"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message and we'll respond",
      responseTime: "Within 2 hours",
      availability: "24/7",
      action: "Send Email"
    },
    {
      icon: Users,
      title: "Community Discord",
      description: "Get help from our community and team",
      responseTime: "Usually within minutes",
      availability: "24/7",
      action: "Join Discord"
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Browse our comprehensive help articles",
      responseTime: "Instant",
      availability: "24/7",
      action: "Browse Articles"
    }
  ]

  const resources = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Complete technical documentation and guides",
      href: "/docs"
    },
    {
      icon: Zap,
      title: "API Reference",
      description: "Developer API documentation and examples",
      href: "/api"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other users and developers",
      href: "/community"
    },
    {
      icon: Shield,
      title: "Security Center",
      description: "Learn about security best practices",
      href: "#security"
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
      <div className="max-w-6xl mx-auto">
        {/* Support Channels */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Get Support</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => {
              const Icon = channel.icon
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{channel.title}</h3>
                  <p className="text-foreground/60 text-sm mb-4">{channel.description}</p>
                  <div className="space-y-1 text-xs text-foreground/50 mb-4">
                    <p><strong>Response:</strong> {channel.responseTime}</p>
                    <p><strong>Available:</strong> {channel.availability}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    {channel.action}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-border rounded-xl bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <h3 className="text-lg font-medium">{faq.question}</h3>
                  <ChevronDown
                    size={20}
                    className={`text-foreground/60 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-foreground/70 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Helpful Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-foreground/60 text-sm mb-4">{resource.description}</p>
                  <Button variant="ghost" size="sm" className="group-hover:text-primary">
                    View Resource
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of CeloRate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90">
              Contact Support
            </Button>
            <Button variant="outline">
              Schedule a Call
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
