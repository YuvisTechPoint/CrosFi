"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, ExternalLink } from "lucide-react"
import { useState } from "react"

interface HelpSectionProps {
  title: string
  content: string
  links?: Array<{
    label: string
    href: string
    external?: boolean
  }>
  className?: string
}

export function HelpSection({ 
  title, 
  content, 
  links = [],
  className = "" 
}: HelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{content}</p>
          
          {links.length > 0 && (
            <div className="space-y-2">
              {links.map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(link.href, link.external ? '_blank' : '_self')}
                >
                  {link.label}
                  {link.external && <ExternalLink className="w-3 h-3 ml-1" />}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
