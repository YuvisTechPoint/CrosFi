import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CommunityHero } from "@/components/community-hero"
import { CommunityContent } from "@/components/community-content"

export default function Community() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <CommunityHero />
      <CommunityContent />
      <Footer />
    </main>
  )
}
