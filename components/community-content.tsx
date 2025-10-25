"use client"

import { motion } from "framer-motion"
import { MessageCircle, Calendar, Users, BookOpen, ExternalLink, Github, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CommunityContent() {
  const platforms = [
    {
      icon: MessageCircle,
      title: "Discord",
      description: "Join our Discord server for real-time discussions, support, and community events.",
      members: "2,500+ members",
      link: "https://discord.gg/celorate",
      color: "bg-indigo-500"
    },
    {
      icon: Twitter,
      title: "Twitter",
      description: "Follow us for the latest updates, announcements, and DeFi insights.",
      members: "5,000+ followers",
      link: "https://twitter.com/celorate",
      color: "bg-blue-500"
    },
    {
      icon: Github,
      title: "GitHub",
      description: "Contribute to our open-source codebase and participate in development discussions.",
      members: "500+ stars",
      link: "https://github.com/celorate",
      color: "bg-gray-800"
    },
    {
      icon: BookOpen,
      title: "Forum",
      description: "Deep-dive discussions, governance proposals, and technical documentation.",
      members: "1,000+ posts",
      link: "https://forum.celorate.com",
      color: "bg-green-500"
    }
  ]

  const events = [
    {
      title: "Weekly Community Call",
      description: "Join us every Friday for updates, Q&A, and community discussions.",
      date: "Every Friday",
      time: "2:00 PM UTC",
      type: "Virtual"
    },
    {
      title: "Developer Workshop",
      description: "Learn how to build on CeloRate with hands-on coding sessions.",
      date: "Monthly",
      time: "3:00 PM UTC",
      type: "Virtual"
    },
    {
      title: "DeFi Meetup",
      description: "Connect with other DeFi enthusiasts and discuss the latest trends.",
      date: "Bi-weekly",
      time: "7:00 PM UTC",
      type: "Virtual"
    }
  ]

  const guidelines = [
    {
      title: "Be Respectful",
      description: "Treat all community members with respect and kindness. No harassment, discrimination, or hate speech."
    },
    {
      title: "Stay On Topic",
      description: "Keep discussions relevant to CeloRate, DeFi, and blockchain technology."
    },
    {
      title: "No Spam",
      description: "Avoid excessive self-promotion, repetitive messages, or off-topic content."
    },
    {
      title: "Help Others",
      description: "Share knowledge, answer questions, and help newcomers learn about DeFi and CeloRate."
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
        {/* Community Platforms */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Join Our Platforms</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform, index) => {
              const Icon = platform.icon
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {platform.title}
                  </h3>
                  <p className="text-foreground/60 text-sm mb-3">{platform.description}</p>
                  <p className="text-xs text-foreground/50 mb-4">{platform.members}</p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={platform.link} target="_blank" rel="noopener noreferrer">
                      Join Now
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Community Events */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Community Events</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm text-foreground/60">{event.type}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                <p className="text-foreground/60 text-sm mb-4">{event.description}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground/70"><strong>When:</strong> {event.date}</p>
                  <p className="text-foreground/70"><strong>Time:</strong> {event.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community Guidelines */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Community Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {guidelines.map((guideline, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold mb-3 text-primary">{guideline.title}</h3>
                <p className="text-foreground/70">{guideline.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contribution Opportunities */}
        <motion.div
          className="mb-20 p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">Contribute to CeloRate</h2>
          <p className="text-lg text-foreground/70 text-center mb-8 max-w-3xl mx-auto">
            Help us build the future of DeFi. There are many ways to contribute to the CeloRate ecosystem.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Github size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Code Contributions</h3>
              <p className="text-sm text-foreground/60">Submit pull requests, report bugs, and suggest features.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Documentation</h3>
              <p className="text-sm text-foreground/60">Help improve our docs, tutorials, and guides.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Community Building</h3>
              <p className="text-sm text-foreground/60">Help newcomers, moderate discussions, and organize events.</p>
            </div>
          </div>
        </motion.div>

        {/* Join CTA */}
        <motion.div
          className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Join?</h3>
          <p className="text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
            Join thousands of developers and DeFi enthusiasts building the future of decentralized finance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <a href="https://discord.gg/celorate" target="_blank" rel="noopener noreferrer">
                Join Discord
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://github.com/celorate" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
