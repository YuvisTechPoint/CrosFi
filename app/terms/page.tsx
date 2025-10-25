import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LegalHero } from "@/components/legal-hero"
import { TermsContent } from "@/components/terms-content"

export default function Terms() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <LegalHero title="Terms of Service" />
      <TermsContent />
      <Footer />
    </main>
  )
}
