import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DocsHero } from "@/components/docs-hero"
import { DocsContent } from "@/components/docs-content"

export default function Docs() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <DocsHero />
      <DocsContent />
      <Footer />
    </main>
  )
}
