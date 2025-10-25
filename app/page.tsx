import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProblemSection } from "@/components/problem-section"
import { SolutionSection } from "@/components/solution-section"
import { HowItWorks } from "@/components/how-it-works"
import { CurrencyPairShowcase } from "@/components/currency-pair-showcase"
import { FeaturesSection } from "@/components/features-section"
import { Integrations } from "@/components/integrations"
import { Roadmap } from "@/components/roadmap"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <CurrencyPairShowcase />
      <FeaturesSection />
      <Integrations />
      <Roadmap />
      <CTASection />
      <Footer />
    </main>
  )
}
