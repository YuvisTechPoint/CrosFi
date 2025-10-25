"use client"

import { motion } from "framer-motion"
import { Mail, MessageCircle, MapPin, Clock, Twitter, Github, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ContactInfo() {
  const contactDetails = [
    {
      icon: Mail,
      title: "Email",
      description: "Get in touch via email",
      value: "hello@celorate.com",
      action: "mailto:hello@celorate.com"
    },
    {
      icon: MessageCircle,
      title: "Discord",
      description: "Join our community",
      value: "discord.gg/celorate",
      action: "https://discord.gg/celorate"
    },
    {
      icon: MapPin,
      title: "Location",
      description: "We're remote-first",
      value: "Global Team",
      action: null
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "We typically respond within",
      value: "24 hours",
      action: null
    }
  ]

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/celorate", label: "Twitter" },
    { icon: Github, href: "https://github.com/celorate", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/celorate", label: "LinkedIn" }
  ]

  const faqs = [
    {
      question: "How do I get started with CeloRate?",
      answer: "Visit our documentation page for a complete getting started guide, or contact our support team for personalized assistance."
    },
    {
      question: "What are the fees for using the protocol?",
      answer: "CeloRate charges minimal fees for lending operations. Check our pricing page for detailed fee structure."
    },
    {
      question: "Is my money safe on CeloRate?",
      answer: "Yes, our smart contracts are audited and we follow security best practices. Your funds are secured by blockchain technology."
    },
    {
      question: "Do you offer API access?",
      answer: "Yes, we provide comprehensive API access for developers. Check our API documentation for integration details."
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="max-w-6xl mx-auto">
        {/* Contact Details */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {contactDetails.map((detail, index) => {
            const Icon = detail.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{detail.title}</h3>
                <p className="text-sm text-foreground/60 mb-3">{detail.description}</p>
                {detail.action ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={detail.action} target="_blank" rel="noopener noreferrer">
                      {detail.value}
                    </a>
                  </Button>
                ) : (
                  <p className="text-primary font-medium">{detail.value}</p>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
          <div className="flex justify-center gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-12 h-12 p-0"
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </a>
                </Button>
              )
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-bold mb-3 text-primary">{faq.question}</h4>
                <p className="text-foreground/60">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support CTA */}
        <motion.div
          className="mt-20 p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">Need More Help?</h3>
          <p className="text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of CeloRate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90">
              Visit Support Center
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
