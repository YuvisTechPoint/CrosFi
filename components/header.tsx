"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useWallet } from "@/contexts/WalletContext"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { address, isConnected, isLoading, connect, disconnect } = useWallet()

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect()
    } else {
      connect()
    }
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Vault", href: "/vault" },
    { label: "Markets", href: "/markets" },
    { label: "Lend", href: "/lend" },
    { label: "Positions", href: "/positions" },
    { label: "Rates", href: "/rates" },
  ]

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl text-primary" style={{ fontFamily: 'var(--font-orbitron)' }}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm" style={{ fontFamily: 'var(--font-orbitron)' }}>
            CR
          </div>
          <span style={{ fontFamily: 'var(--font-orbitron)' }}>lCelo</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-foreground hover:text-primary transition-colors text-sm nav-link"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex gap-3">
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleWalletClick}
            disabled={isLoading}
          >
            {isLoading 
              ? "Connecting..." 
              : isConnected && address 
                ? truncateAddress(address)
                : "Connect Wallet"
            }
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t border-border">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-transparent"
                onClick={handleWalletClick}
                disabled={isLoading}
              >
                {isLoading 
                  ? "Connecting..." 
                  : isConnected && address 
                    ? truncateAddress(address)
                    : "Connect Wallet"
                }
              </Button>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                Launch App
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
