"use client"

import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"
import Image from "next/image"

export function TeamSection() {
  const team = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Blockchain veteran with 8+ years in DeFi. Previously led protocol development at major DeFi platforms.",
      image: "/placeholder-user.jpg",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Sarah Johnson",
      role: "CTO",
      bio: "Smart contract architect with expertise in security auditing. PhD in Computer Science from MIT.",
      image: "/placeholder-user.jpg",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Product",
      bio: "UX/UI expert focused on making DeFi accessible. Former product lead at fintech unicorn.",
      image: "/placeholder-user.jpg",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Emily Zhang",
      role: "Head of Security",
      bio: "Cybersecurity specialist with 10+ years experience. Former security researcher at top blockchain firms.",
      image: "/placeholder-user.jpg",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "David Kim",
      role: "Head of Business Development",
      bio: "Partnership expert with deep connections in the Celo ecosystem. Former business development at Celo Foundation.",
      image: "/placeholder-user.jpg",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Lisa Thompson",
      role: "Community Manager",
      bio: "Community building specialist with passion for DeFi education. Former community lead at major DeFi protocols.",
      image: "/placeholder-user.jpg",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
  ]

  const advisors = [
    {
      name: "Dr. Maria Santos",
      role: "Advisor - Economics",
      bio: "Professor of Economics at Stanford, specializing in monetary policy and DeFi economics.",
      image: "/placeholder-user.jpg",
    },
    {
      name: "James Wilson",
      role: "Advisor - Technology",
      bio: "Former CTO of major blockchain infrastructure company. Expert in scalable blockchain solutions.",
      image: "/placeholder-user.jpg",
    },
    {
      name: "Dr. Aisha Patel",
      role: "Advisor - Security",
      bio: "Cybersecurity expert and former security auditor. PhD in Cryptography from Cambridge.",
      image: "/placeholder-user.jpg",
    },
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
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Meet Our Team</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            The passionate individuals building the future of decentralized lending.
          </p>
        </motion.div>

        {/* Core Team */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center mb-12">Core Team</h3>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-lg font-bold mb-1">{member.name}</h4>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-foreground/60 mb-4 leading-relaxed">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a
                    href={member.social.twitter}
                    className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 flex items-center justify-center transition-all"
                  >
                    <Twitter size={16} className="text-foreground/60 hover:text-primary" />
                  </a>
                  <a
                    href={member.social.linkedin}
                    className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 flex items-center justify-center transition-all"
                  >
                    <Linkedin size={16} className="text-foreground/60 hover:text-primary" />
                  </a>
                  <a
                    href={member.social.github}
                    className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 flex items-center justify-center transition-all"
                  >
                    <Github size={16} className="text-foreground/60 hover:text-primary" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Advisors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center mb-12">Advisors</h3>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {advisors.map((advisor, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image
                    src={advisor.image}
                    alt={advisor.name}
                    fill
                    className="rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-lg font-bold mb-1">{advisor.name}</h4>
                <p className="text-primary font-medium mb-3">{advisor.role}</p>
                <p className="text-sm text-foreground/60 leading-relaxed">{advisor.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Join Us CTA */}
        <motion.div
          className="mt-20 p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
          <p className="text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our vision of making DeFi accessible to everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#careers"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              View Open Positions
            </a>
            <a
              href="#contact"
              className="px-6 py-3 border border-primary/20 hover:border-primary/50 text-primary rounded-lg font-medium transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
