"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OpenPositions() {
  const positions = [
    {
      id: 1,
      title: "Senior Smart Contract Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "3-5 years",
      description: "Lead the development of our core lending protocol smart contracts with a focus on security and efficiency.",
      requirements: [
        "Solidity expertise with 3+ years experience",
        "Experience with DeFi protocols",
        "Security-first mindset",
        "Strong understanding of blockchain fundamentals"
      ],
      posted: "2024-01-10"
    },
    {
      id: 2,
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "2-4 years",
      description: "Build beautiful, intuitive user interfaces for our lending platform using React and Next.js.",
      requirements: [
        "React/Next.js expertise",
        "TypeScript proficiency",
        "Web3 integration experience",
        "UI/UX design sensibility"
      ],
      posted: "2024-01-08"
    },
    {
      id: 3,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "3-5 years",
      description: "Manage our infrastructure and deployment pipelines for a secure, scalable DeFi platform.",
      requirements: [
        "AWS/GCP experience",
        "Docker and Kubernetes",
        "CI/CD pipeline management",
        "Blockchain node management"
      ],
      posted: "2024-01-05"
    },
    {
      id: 4,
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      experience: "4-6 years",
      description: "Drive product strategy and roadmap for our DeFi lending platform.",
      requirements: [
        "DeFi/Web3 product experience",
        "Strong analytical skills",
        "User research experience",
        "Cross-functional leadership"
      ],
      posted: "2024-01-03"
    },
    {
      id: 5,
      title: "Community Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      experience: "2-3 years",
      description: "Build and engage our community across social platforms and events.",
      requirements: [
        "Social media management",
        "Community building experience",
        "DeFi/Web3 knowledge",
        "Event organization skills"
      ],
      posted: "2024-01-01"
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
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Open Positions</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Join our team and help build the future of decentralized finance.
          </p>
        </motion.div>

        {/* Positions Grid */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {positions.map((position) => (
            <motion.div
              key={position.id}
              variants={itemVariants}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                      {position.department}
                    </span>
                    <span className="text-sm text-foreground/60">
                      Posted {new Date(position.posted).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{position.title}</h3>
                  <p className="text-foreground/60 mb-4">{position.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {position.type}
                    </div>
                    <span>{position.experience}</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Key Requirements:</h4>
                    <ul className="text-sm text-foreground/60 space-y-1">
                      {position.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button className="bg-primary hover:bg-primary/90">
                    Apply Now
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Open Positions Message */}
        <motion.div
          className="text-center mt-12 p-8 rounded-xl border border-primary/20 bg-primary/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold mb-2">Don't See a Role That Fits?</h3>
          <p className="text-foreground/70 mb-4">
            We're always looking for talented individuals. Send us your resume and let us know how you'd like to contribute.
          </p>
          <Button variant="outline">
            Send Resume
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
