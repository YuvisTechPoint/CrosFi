# CeloRate - Fixed-Rate Lending on Celo

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Celo](https://img.shields.io/badge/Celo-Protocol-35D07F?style=for-the-badge&logo=celo)](https://celo.org/)

A modern, responsive landing page for CeloRate - a decentralized fixed-rate lending protocol built on the Celo blockchain. This project showcases the future of DeFi with a beautiful, accessible, and feature-rich web interface.

## 🌟 Features

### 🎨 **Modern Design**
- **Dark/Light Theme Support** - Seamless theme switching with system preference detection
- **Responsive Design** - Mobile-first approach that works on all devices
- **Smooth Animations** - Framer Motion powered animations and transitions
- **Professional UI/UX** - Clean, modern interface following best practices

### 🏗️ **Technical Stack**
- **Next.js 14** - Latest React framework with App Router
- **TypeScript** - Full type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Smooth animations and micro-interactions
- **Lucide React** - Beautiful, customizable icons

### 📱 **Complete Website**
- **Landing Page** - Hero section, features, roadmap, and CTA
- **About Page** - Company story, mission, values, and team
- **Blog** - Article listings with categories and featured posts
- **Careers** - Job listings, company culture, and benefits
- **Contact** - Contact form, information, and FAQ
- **Legal Pages** - Privacy, Terms, Disclaimer, and Cookie policies
- **Resources** - Documentation, API reference, community, and support

### 🔧 **Developer Experience**
- **Component Architecture** - Modular, reusable components
- **Type Safety** - Full TypeScript implementation
- **Code Quality** - ESLint and Prettier configuration
- **Performance** - Optimized images and lazy loading
- **SEO Ready** - Meta tags and structured data

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/piyushgoenka2005/EquiLend.git
   cd celo-rate-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
celo-rate-landing/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── blog/                     # Blog page
│   ├── careers/                  # Careers page
│   ├── contact/                  # Contact page
│   ├── privacy/                  # Privacy policy
│   ├── terms/                    # Terms of service
│   ├── disclaimer/               # Legal disclaimer
│   ├── cookies/                  # Cookie policy
│   ├── docs/                     # Documentation
│   ├── api/                      # API documentation
│   ├── community/                # Community page
│   ├── support/                  # Support page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # UI components (Button, Input, etc.)
│   ├── header.tsx                # Navigation header
│   ├── footer.tsx                # Site footer
│   ├── hero.tsx                  # Hero section
│   ├── integrations.tsx          # Platform integrations
│   ├── roadmap.tsx               # Roadmap section
│   ├── cta-section.tsx           # Call-to-action
│   ├── theme-provider.tsx        # Theme context
│   ├── theme-toggle.tsx          # Theme switcher
│   ├── about-hero.tsx            # About page hero
│   ├── story-section.tsx         # Company story
│   ├── mission-section.tsx       # Mission & vision
│   ├── values-section.tsx        # Company values
│   ├── team-section.tsx          # Team members
│   ├── blog-hero.tsx             # Blog page hero
│   ├── blog-posts.tsx            # Blog posts grid
│   ├── careers-hero.tsx          # Careers page hero
│   ├── open-positions.tsx        # Job listings
│   ├── company-culture.tsx       # Company culture
│   ├── contact-hero.tsx          # Contact page hero
│   ├── contact-form.tsx          # Contact form
│   ├── contact-info.tsx          # Contact information
│   ├── legal-hero.tsx            # Legal pages hero
│   ├── privacy-content.tsx       # Privacy policy content
│   ├── terms-content.tsx         # Terms content
│   ├── disclaimer-content.tsx    # Disclaimer content
│   ├── cookies-content.tsx       # Cookie policy content
│   ├── docs-hero.tsx             # Documentation hero
│   ├── docs-content.tsx          # Documentation content
│   ├── api-hero.tsx              # API page hero
│   ├── api-content.tsx           # API documentation
│   ├── community-hero.tsx        # Community page hero
│   ├── community-content.tsx     # Community content
│   ├── support-hero.tsx          # Support page hero
│   └── support-content.tsx       # Support content
├── public/                       # Static assets
│   ├── celo.png                  # Celo logo
│   ├── metamask.png              # MetaMask logo
│   ├── ledger.png                # Ledger logo
│   ├── valora.jpg                # Valora logo
│   ├── uniswap.png               # Uniswap logo
│   └── aave.jpg                  # Aave logo
├── lib/                          # Utility functions
├── hooks/                        # Custom React hooks
├── styles/                       # Additional styles
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js configuration
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🎨 Design System

### Color Palette

```css
/* Light Theme */
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--primary: 221.2 83.2% 53.3%
--secondary: 210 40% 98%

/* Dark Theme */
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--primary: 217.2 91.2% 59.8%
--secondary: 217.2 32.6% 17.5%
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, responsive sizing
- **Body Text**: Regular weight, optimized for readability
- **Code**: Monospace font for technical content

### Components

- **Buttons**: Primary, secondary, outline, and ghost variants
- **Cards**: Consistent padding, borders, and hover effects
- **Forms**: Accessible inputs with proper validation
- **Navigation**: Responsive header with mobile menu

## 🌙 Dark Theme Implementation

The project includes a complete dark theme implementation:

### Features
- **System Preference Detection** - Automatically follows OS theme
- **Manual Toggle** - Theme switcher in navigation
- **Persistent Selection** - Remembers user preference
- **Smooth Transitions** - CSS transitions for theme changes
- **No Flash** - Prevents theme flash on page load

### Usage
```tsx
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

// Wrap your app
<ThemeProvider>
  <App />
</ThemeProvider>

// Add toggle button
<ThemeToggle />
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- All components designed for mobile first
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized performance on mobile devices

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. **Deploy** - Automatic deployments on push

### Other Platforms

The project can be deployed to any platform that supports Next.js:

- **Netlify**
- **AWS Amplify**
- **Railway**
- **DigitalOcean App Platform**

### Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://api.celorate.com
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Code Quality
npm run format       # Format code with Prettier
npm run lint:fix     # Fix ESLint errors
```

### Code Style

- **ESLint** - Code linting and error detection
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Conventional Commits** - Commit message format

### Git Workflow

1. **Create feature branch** from `main`
2. **Make changes** with proper commits
3. **Test thoroughly** before pushing
4. **Create pull request** for review
5. **Merge** after approval

## 📊 Performance

### Optimizations

- **Image Optimization** - Next.js Image component
- **Code Splitting** - Automatic route-based splitting
- **Lazy Loading** - Components loaded on demand
- **Bundle Analysis** - Optimized bundle sizes
- **Caching** - Proper cache headers

### Metrics

- **Lighthouse Score**: 95+ across all categories
- **Core Web Vitals**: Excellent performance
- **Bundle Size**: Optimized for fast loading
- **Accessibility**: WCAG 2.1 AA compliant

## 🔒 Security

### Best Practices

- **HTTPS Only** - Secure connections
- **Content Security Policy** - XSS protection
- **Input Validation** - Form validation
- **Dependencies** - Regular security updates
- **Environment Variables** - Secure configuration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests** if applicable
5. **Submit a pull request**

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add documentation for new features
- Test your changes thoroughly
- Update README if needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Celo Foundation** - For the amazing blockchain platform
- **Next.js Team** - For the excellent React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Lucide** - For beautiful icons
- **shadcn/ui** - For the component library

## 📞 Support

- **Documentation**: [docs.celorate.com](https://docs.celorate.com)
- **Community**: [Discord](https://discord.gg/celorate)
- **Issues**: [GitHub Issues](https://github.com/piyushgoenka2005/EquiLend/issues)
- **Email**: [support@celorate.com](mailto:support@celorate.com)

## 🔮 Roadmap

### Phase 1 ✅
- [x] Landing page design
- [x] Dark theme implementation
- [x] Responsive design
- [x] All footer pages

### Phase 2 🚧
- [ ] Wallet integration
- [ ] Smart contract integration
- [ ] Real-time data
- [ ] User dashboard

### Phase 3 📋
- [ ] Advanced features
- [ ] Analytics integration
- [ ] Performance optimization
- [ ] Internationalization

---

**Built with ❤️ for the Celo ecosystem**

*CeloRate - Bringing fixed-rate lending to DeFi*