import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AboutHero } from "@/components/about-hero"
import { MissionSection } from "@/components/mission-section"
import { TeamSection } from "@/components/team-section"
import { ValuesSection } from "@/components/values-section"
import { StorySection } from "@/components/story-section"

export default function About() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <AboutHero />
      <StorySection />
      <MissionSection />
      <ValuesSection />
      <TeamSection />
      <Footer />
    </main>
  )
}
