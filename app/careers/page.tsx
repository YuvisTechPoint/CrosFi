import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CareersHero } from "@/components/careers-hero"
import { OpenPositions } from "@/components/open-positions"
import { CompanyCulture } from "@/components/company-culture"

export default function Careers() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <CareersHero />
      <OpenPositions />
      <CompanyCulture />
      <Footer />
    </main>
  )
}
