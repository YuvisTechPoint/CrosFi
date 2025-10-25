import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LegalHero } from "@/components/legal-hero"
import { PrivacyContent } from "@/components/privacy-content"

export default function Privacy() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <LegalHero title="Privacy Policy" />
      <PrivacyContent />
      <Footer />
    </main>
  )
}
