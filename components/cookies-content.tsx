"use client"

import { motion } from "framer-motion"
import { Cookie, Settings, Shield, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookiesContent() {
  const cookieTypes = [
    {
      icon: Settings,
      title: "Essential Cookies",
      description: "These cookies are necessary for the website to function and cannot be switched off in our systems.",
      examples: ["Authentication", "Security", "Load balancing"],
      required: true
    },
    {
      icon: BarChart3,
      title: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: ["Page views", "User behavior", "Performance metrics"],
      required: false
    },
    {
      icon: Shield,
      title: "Functional Cookies",
      description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences.",
      examples: ["Language settings", "Theme preferences", "User preferences"],
      required: false
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
        {/* Introduction */}
        <motion.div
          className="mb-12 p-6 rounded-xl border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start gap-3 mb-4">
            <Cookie size={24} className="text-primary mt-1" />
            <h2 className="text-2xl font-bold text-primary">What Are Cookies?</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed">
            Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
          </p>
        </motion.div>

        {/* Cookie Types */}
        <motion.div
          className="space-y-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {cookieTypes.map((cookie, index) => {
            const Icon = cookie.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Icon size={24} className="text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-primary">{cookie.title}</h3>
                      {cookie.required && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-foreground/70 mb-4">{cookie.description}</p>
                    <div>
                      <h4 className="font-medium mb-2">Examples:</h4>
                      <ul className="text-sm text-foreground/60 space-y-1">
                        {cookie.examples.map((example, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Cookie Management */}
        <motion.div
          className="mb-12 p-6 rounded-xl border border-primary/20 bg-primary/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold mb-4 text-primary">Managing Your Cookie Preferences</h3>
          <p className="text-foreground/70 mb-6">
            You can control and manage cookies in several ways. Please note that disabling certain cookies may affect the functionality of our website.
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Browser Settings</h4>
              <p className="text-sm text-foreground/60">
                Most web browsers allow you to control cookies through their settings. You can usually find these settings in the 'Privacy' or 'Security' section of your browser.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Cookie Consent</h4>
              <p className="text-sm text-foreground/60">
                When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Third-Party Cookies */}
        <motion.div
          className="mb-12 p-6 rounded-xl border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold mb-4 text-primary">Third-Party Cookies</h3>
          <p className="text-foreground/70 mb-4">
            We may use third-party services that set their own cookies. These services help us analyze website traffic and improve user experience.
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-border bg-background">
              <h4 className="font-medium mb-1">Google Analytics</h4>
              <p className="text-sm text-foreground/60">
                Helps us understand how visitors use our website. You can opt out of Google Analytics tracking.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-background">
              <h4 className="font-medium mb-1">Vercel Analytics</h4>
              <p className="text-sm text-foreground/60">
                Provides performance and usage analytics for our website.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cookie Settings */}
        <motion.div
          className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold mb-4">Update Your Cookie Preferences</h3>
          <p className="text-foreground/70 mb-6">
            You can change your cookie preferences at any time by clicking the button below.
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            <Settings size={18} className="mr-2" />
            Manage Cookie Settings
          </Button>
        </motion.div>

        {/* Contact */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-foreground/60">
            <strong>Last Updated:</strong> January 15, 2024
          </p>
          <p className="text-sm text-foreground/60 mt-2">
            Questions about our cookie policy? Contact us at{" "}
            <a href="mailto:privacy@celorate.com" className="text-primary hover:underline">
              privacy@celorate.com
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
