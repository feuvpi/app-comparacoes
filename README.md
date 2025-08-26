# Product Comparison Site

A modern, SEO-optimized product comparison website built with SvelteKit and powered by markdown files for easy content management.

## 🚀 Features

- **📱 Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **🔍 SEO Optimized** - Static generation, structured data, meta optimization
- **📝 Markdown-Driven** - Easy content management through markdown files
- **🏷️ Generic Categories** - Automatically adapts to any product category
- **💰 Affiliate Ready** - Built-in Amazon Associates integration
- **⚡ High Performance** - Static site generation with excellent Core Web Vitals
- **🎯 Smart Comparisons** - Dynamic field detection and filtering
- **📊 Advanced Analytics** - Built-in tracking for affiliate links and user behavior

## 🏗️ Project Structure

```
src/
├── app.html                      # Main HTML template
├── app.css                       # Global styles with Tailwind
├── routes/
│   ├── +layout.svelte           # Main layout
│   ├── +page.svelte             # Homepage
│   ├── [category]/              # Dynamic category routes
│   │   ├── +page.svelte         # Generic comparison page
│   │   ├── +page.server.js      # Category data loading
│   │   └── [product]/           # Individual product pages
│   │       ├── +page.svelte     # Product detail page
│   │       └── +page.server.js  # Product data loading
│   └── api/
│       └── categories/          # API endpoints
├── lib/
│   ├── components/              # Reusable Svelte components
│   │   ├── ProductCard.svelte
│   │   ├── ComparisonTable.svelte
│   │   ├── FilterPanel.svelte
│   │   └── ui/                  # Base UI components
│   ├── utils/                   # Utility functions
│   │   ├── content.js           # Content loading and parsing
│   │   ├── comparison.js        # Comparison logic
│   │   └── seo.js               # SEO utilities
│   ├── stores/                  # Svelte stores for state management
│   └── layouts/                 # Layout components for MDX
├── content/                     # Markdown content files
│   ├── tvs/                     # TV product files
│   │   ├── samsung-qled-55.md
│   │   └── lg-oled-cx.md
│   └── bluetooth-speakers/      # Speaker product files
│       ├── bose-revolve.md
│       └── jbl-flip-6.md
└── static/                      # Static assets
    ├── images/                  # Product images organized by category
    └── icons/                   # Site icons and favicons
```

## 🛠️ Technology Stack

- **Framework:** SvelteKit with static adapter
- **Styling:** Tailwind CSS with custom design system
- **Content:** MDSvex for markdown processing
- **Icons:** Lucide Svelte for modern icons
- **Typography:** Inter font family
- **Deployment:** Static hosting (Vercel/Netlify/Cloudflare Pages)

## 📋 Development Setup

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd comparison-site
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173)

## 📝 Content Management

### Adding a New Product Category

1. Create a new folder in `src/content/` (e.g., `washing-machines/`)
2. Add markdown files for products in that category
3. The site automatically creates a comparison page at `/washing-machines`

### Product Markdown Format

Each product should be a markdown file with frontmatter:

```markdown
---
name: "Samsung 55\" QLED 4K Q80A"
brand: "Samsung"
model: "QN55Q80AAFXZA"
price: 899
affiliate_link: "https://amzn.to/your-link"
screen_size: 55
resolution: "4K UHD"
display_type: "QLED"
smart_platform: "Tizen"
rating: 4.5
image: "/images/tvs/samsung-q80a.jpg"
pros:
  - "Excellent color accuracy"
  - "Great for gaming"
cons:
  - "Limited viewing angles"
---

Your detailed product review content goes here...
```

### Field Types Supported

- **Text:** `brand`, `model`, `name`
- **Numbers:** `price`, `screen_size`, `rating`
- **Arrays:** `pros`, `cons`, `features`
- **Booleans:** `wifi_enabled`, `waterproof`

The system automatically detects field types and creates appropriate filters and comparisons.

## 🚀 Build & Deploy

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Static Export
```bash
npm run build        # Generates static files in /build
```

### Deployment Options

**Recommended hosts for static sites:**
- **Vercel** - Automatic deployments from Git
- **Netlify** - Advanced forms and edge functions
- **Cloudflare Pages** - Global CDN with excellent performance

## 🎯 SEO Features

### Automatic SEO Optimization

- **Meta Tags:** Auto-generated titles, descriptions, OG tags
- **Structured Data:** Product schema, breadcrumbs, reviews
- **Sitemap:** Automatically generated XML sitemap
- **Performance:** Optimized images, lazy loading, code splitting
- **Canonical URLs:** Proper canonicalization for duplicate content

### Content SEO Best Practices

1. Use descriptive product names in filenames
2. Include detailed product descriptions
3. Add pros/cons for user value
4. Use high-quality images with alt text
5. Include affiliate disclosures

## 💰 Monetization

### Amazon Associates Integration

1. Sign up for [Amazon Associates](https://affiliate-program.amazon.com/)
2. Get your affiliate tracking ID
3. Add affiliate links to product markdown files
4. Include proper FTC disclosures

### Affiliate Link Format
```markdown
affiliate_link: "https://amzn.to/abc123?tag=yourID-20"
```

### FTC Compliance
- All affiliate links include proper disclosures
- Clear indication of sponsored content
- Proper nofollow/sponsored link attributes

## 📊 Analytics & Tracking

### Recommended Analytics Setup

- **Google Analytics 4** - User behavior and conversion tracking
- **Google Search Console** - SEO performance monitoring
- **Amazon Associates Reports** - Commission tracking

### Built-in Tracking Features

- Affiliate link click tracking
- Product view analytics
- Comparison usage metrics
- Search query tracking

## 🔧 Customization

### Design System

The site uses a custom Tailwind configuration with:
- **Primary Colors:** Blue gradient (#3b82f6 to #1d4ed8)
- **Accent Colors:** Green (#10b981)
- **Typography:** Inter font family
- **Components:** Reusable design patterns

### Adding Custom Components

1. Create component in `src/lib/components/`
2. Follow naming convention: `ComponentName.svelte`
3. Use TypeScript for props when possible
4. Include proper accessibility attributes

## 🧪 Testing

### Development Testing
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Check code quality
```

### Performance Testing
- Lighthouse audits for each page type
- Core Web Vitals monitoring
- Mobile responsiveness testing

## 🤝 Contributing

### Content Guidelines

1. **Product Research:** Verify all specifications
2. **Image Quality:** Use high-resolution product images
3. **Review Quality:** Write genuine, helpful reviews
4. **Affiliate Compliance:** Follow FTC guidelines

### Code Contributions

1. Follow existing code style
2. Include tests for new features
3. Update documentation
4. Test across different browsers

## 📈 Performance Targets

### Core Web Vitals Goals
- **LCP:** < 2.5s (Largest Contentful Paint)
- **FID:** < 100ms (First Input Delay)
- **CLS:** < 0.1 (Cumulative Layout Shift)

### Additional Performance Metrics
- **Lighthouse Score:** > 95
- **Bundle Size:** < 100kb initial load
- **Image Optimization:** WebP format with fallbacks
- **Caching Strategy:** Long-term caching for static assets

## 📚 Resources

### Documentation
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [MDSvex Documentation](https://mdsvex.pngwn.io/)

### SEO Resources
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Core Web Vitals](https://web.dev/vitals/)
- [Structured Data Guidelines](https://developers.google.com/search/docs/guides/intro-structured-data)

### Affiliate Marketing
- [Amazon Associates Program](https://affiliate-program.amazon.com/)
- [FTC Guidelines](https://www.ftc.gov/tips-advice/business-center/guidance/ftcs-endorsement-guides-what-people-are-asking)

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
- Check node modules installation
- Verify all markdown files have valid frontmatter
- Ensure image paths exist

**Content Not Loading:**
- Verify markdown file structure
- Check content folder permissions
- Validate frontmatter syntax

**Performance Issues:**
- Optimize images (use WebP format)
- Check for unused dependencies
- Enable gzip compression

## 📞 Support

For questions and support:
- 📧 Check documentation first
- 🐛 Open an issue for bugs
- 💡 Submit feature requests via issues
- 📚 Reference the troubleshooting guide

---

## 🏁 Getting Started Checklist

- [ ] Dependencies installed
- [ ] Development server running
- [ ] Sample content created
- [ ] First product category added
- [ ] Affiliate program signup initiated
- [ ] Analytics setup planned

Ready to start building your product comparison empire! 🚀