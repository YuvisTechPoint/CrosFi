import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BlogHero } from "@/components/blog-hero"
import { BlogPosts } from "@/components/blog-posts"

export default function Blog() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <BlogHero />
      <BlogPosts />
      <Footer />
    </main>
  )
}
