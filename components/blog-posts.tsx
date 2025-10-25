"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BlogPosts() {
  const blogPosts = [
    {
      id: 1,
      title: "Introducing Fixed-Rate Lending on Celo",
      excerpt: "Learn how CeloRate is revolutionizing DeFi with predictable, transparent fixed-rate lending solutions.",
      author: "Alex Chen",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Product",
      featured: true,
    },
    {
      id: 2,
      title: "The Future of Decentralized Finance",
      excerpt: "Exploring the trends and innovations shaping the future of DeFi and blockchain technology.",
      author: "Sarah Johnson",
      date: "2024-01-10",
      readTime: "8 min read",
      category: "Technology",
      featured: false,
    },
    {
      id: 3,
      title: "Security First: Smart Contract Auditing",
      excerpt: "How we ensure the highest security standards for our lending protocol through rigorous auditing.",
      author: "Emily Zhang",
      date: "2024-01-05",
      readTime: "6 min read",
      category: "Security",
      featured: false,
    },
    {
      id: 4,
      title: "Building Community in DeFi",
      excerpt: "The importance of community-driven development and governance in decentralized protocols.",
      author: "Lisa Thompson",
      date: "2024-01-01",
      readTime: "4 min read",
      category: "Community",
      featured: false,
    },
    {
      id: 5,
      title: "Celo Ecosystem Integration",
      excerpt: "How CeloRate integrates with the broader Celo ecosystem for seamless user experience.",
      author: "David Kim",
      date: "2023-12-28",
      readTime: "7 min read",
      category: "Integration",
      featured: false,
    },
    {
      id: 6,
      title: "Understanding Fixed vs Variable Rates",
      excerpt: "A comprehensive guide to different interest rate models in DeFi lending protocols.",
      author: "Michael Rodriguez",
      date: "2023-12-25",
      readTime: "9 min read",
      category: "Education",
      featured: false,
    },
  ]

  const categories = ["All", "Product", "Technology", "Security", "Community", "Integration", "Education"]

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
        {/* Categories Filter */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Featured Post */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-8">Featured Article</h2>
          {(() => {
            const featured = blogPosts.find(post => post.featured)
            return featured ? (
              <div className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {featured.category}
                  </span>
                  <span className="text-sm text-foreground/60">Featured</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">{featured.title}</h3>
                <p className="text-lg text-foreground/70 mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-foreground/60 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(featured.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {featured.readTime}
                  </div>
                  <span>By {featured.author}</span>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  Read Article
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            ) : null
          })()}
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {blogPosts.filter(post => !post.featured).map((post) => (
            <motion.article
              key={post.id}
              variants={itemVariants}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {post.category}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-foreground/60 mb-4 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-foreground/60 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(post.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {post.readTime}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">By {post.author}</span>
                <Button variant="ghost" size="sm" className="group-hover:text-primary">
                  Read More
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Load More */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
