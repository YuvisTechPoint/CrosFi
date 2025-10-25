import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LegalHero } from "@/components/legal-hero"
import { DisclaimerContent } from "@/components/disclaimer-content"

export default function Disclaimer() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <LegalHero title="Legal Disclaimer" />
      <DisclaimerContent />
      <Footer />
    </main>
  )
}
