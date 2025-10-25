"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Code, Zap, Shield, Users, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DocsContent() {
  const quickStart = [
    {
      title: "Connect Your Wallet",
      description: "Learn how to connect MetaMask, Valora, or other Celo-compatible wallets to CeloRate.",
      icon: Users,
      time: "2 min"
    },
    {
      title: "Make Your First Deposit",
      description: "Step-by-step guide to depositing assets and earning fixed-rate returns.",
      icon: Zap,
      time: "5 min"
    },
    {
      title: "Withdraw Your Funds",
      description: "How to withdraw your assets and earned interest from the protocol.",
      icon: Shield,
      time: "3 min"
    }
  ]

  const guides = [
    {
      title: "Getting Started",
      description: "Complete beginner's guide to using CeloRate",
      category: "Basics",
      time: "10 min read"
    },
    {
      title: "Smart Contract Integration",
      description: "How to integrate CeloRate smart contracts into your dApp",
      category: "Development",
      time: "15 min read"
    },
    {
      title: "Security Best Practices",
      description: "Important security considerations when using DeFi protocols",
      category: "Security",
      time: "8 min read"
    },
    {
      title: "Troubleshooting Guide",
      description: "Common issues and how to resolve them",
      category: "Support",
      time: "12 min read"
    }
  ]

  const resources = [
    {
      title: "API Reference",
      description: "Complete API documentation with examples",
      icon: Code,
      href: "/api"
    },
    {
      title: "Smart Contract Addresses",
      description: "Official contract addresses for all networks",
      icon: BookOpen,
      href: "#contracts"
    },
    {
      title: "SDK Documentation",
      description: "JavaScript/TypeScript SDK for easy integration",
      icon: Zap,
      href: "#sdk"
    },
    {
      title: "Community Forum",
      description: "Get help from the community and developers",
      icon: Users,
      href: "/community"
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
        {/* Quick Start */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {quickStart.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground/60">{step.time}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-foreground/60 text-sm">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Guides */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Popular Guides</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {guide.category}
                  </span>
                  <span className="text-sm text-foreground/60">{guide.time}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-foreground/60 text-sm mb-4">{guide.description}</p>
                <Button variant="ghost" size="sm" className="group-hover:text-primary">
                  Read Guide
                  <ArrowRight size={14} className="ml-1" />
                </Button>
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
          <h2 className="text-3xl font-bold text-center mb-12">Developer Resources</h2>
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
                    <ExternalLink size={14} className="ml-1" />
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          className="mb-20 p-8 rounded-2xl border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-6 text-primary">Quick Integration Example</h3>
          <div className="bg-muted rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-foreground">
              <code>{`// Connect to CeloRate
import { CeloRate } from '@celorate/sdk';

const celoRate = new CeloRate({
  network: 'celo',
  rpcUrl: 'https://forno.celo.org'
});

// Deposit CELO and earn fixed returns
const deposit = await celoRate.deposit({
  amount: '1000000000000000000', // 1 CELO
  duration: 30, // 30 days
  rate: 12.5 // 12.5% APY
});

console.log('Deposit successful:', deposit);`}</code>
            </pre>
          </div>
        </motion.div>

        {/* Support CTA */}
        <motion.div
          className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
          <p className="text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our developer community and support team are here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90">
              Join Discord
            </Button>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
