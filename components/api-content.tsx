"use client"

import { motion } from "framer-motion"
import { Copy, Check, Key, Zap, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ApiContent() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/pools",
      description: "Get all available lending pools",
      example: "curl -X GET https://api.celorate.com/v1/pools"
    },
    {
      method: "GET",
      path: "/api/v1/pools/{poolId}/rates",
      description: "Get current interest rates for a specific pool",
      example: "curl -X GET https://api.celorate.com/v1/pools/celo/rates"
    },
    {
      method: "POST",
      path: "/api/v1/deposits",
      description: "Create a new deposit",
      example: "curl -X POST https://api.celorate.com/v1/deposits -d '{\"poolId\":\"celo\",\"amount\":\"1000000000000000000\"}'"
    },
    {
      method: "GET",
      path: "/api/v1/user/{address}/deposits",
      description: "Get user's deposit history",
      example: "curl -X GET https://api.celorate.com/v1/user/0x123.../deposits"
    }
  ]

  const features = [
    {
      icon: Key,
      title: "API Key Authentication",
      description: "Secure your API calls with API keys. Get your key from the dashboard."
    },
    {
      icon: Zap,
      title: "Rate Limiting",
      description: "1000 requests per hour for free tier. Higher limits available for enterprise."
    },
    {
      icon: Shield,
      title: "HTTPS Only",
      description: "All API endpoints use HTTPS encryption for secure data transmission."
    },
    {
      icon: Globe,
      title: "Global CDN",
      description: "Fast response times worldwide with our global content delivery network."
    }
  ]

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

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
        {/* Base URL */}
        <motion.div
          className="mb-12 p-6 rounded-xl border border-primary/20 bg-primary/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-bold mb-4 text-primary">Base URL</h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 p-3 bg-background rounded-lg border text-sm font-mono">
              https://api.celorate.com
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard("https://api.celorate.com", "base")}
            >
              {copiedEndpoint === "base" ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </motion.div>

        {/* API Endpoints */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">API Endpoints</h2>
          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      endpoint.method === 'GET' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                </div>
                <p className="text-foreground/70 mb-4">{endpoint.description}</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono text-xs overflow-x-auto">
                    {endpoint.example}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(endpoint.example, endpoint.path)}
                  >
                    {copiedEndpoint === endpoint.path ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">API Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
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
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 text-sm">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* SDK Example */}
        <motion.div
          className="mb-20 p-8 rounded-2xl border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-6 text-primary">SDK Integration</h3>
          <div className="bg-muted rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-foreground">
              <code>{`// Install the SDK
npm install @celorate/sdk

// Initialize the client
import { CeloRateAPI } from '@celorate/sdk';

const api = new CeloRateAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.celorate.com'
});

// Get all pools
const pools = await api.pools.getAll();

// Get rates for CELO pool
const rates = await api.pools.getRates('celo');

// Create a deposit
const deposit = await api.deposits.create({
  poolId: 'celo',
  amount: '1000000000000000000', // 1 CELO in wei
  duration: 30 // 30 days
});`}</code>
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
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
            Get your API key and start building with CeloRate's powerful API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90">
              Get API Key
            </Button>
            <Button variant="outline">
              View Full Documentation
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
