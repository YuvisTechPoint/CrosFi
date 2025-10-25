import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SupportHero } from "@/components/support-hero"
import { SupportContent } from "@/components/support-content"

export default function Support() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <SupportHero />
      <SupportContent />
      <Footer />
    </main>
  )
}
