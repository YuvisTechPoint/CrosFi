import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ApiHero } from "@/components/api-hero"
import { ApiContent } from "@/components/api-content"

export default function API() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ApiHero />
      <ApiContent />
      <Footer />
    </main>
  )
}
