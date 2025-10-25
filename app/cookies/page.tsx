import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LegalHero } from "@/components/legal-hero"
import { CookiesContent } from "@/components/cookies-content"

export default function Cookies() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <LegalHero title="Cookie Policy" />
      <CookiesContent />
      <Footer />
    </main>
  )
}
