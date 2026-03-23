# Event Website - Production-Ready Next.js Application

A modern, production-ready Next.js application built with TypeScript, App Router, and Tailwind CSS.

## 🚀 Features

- **Next.js 16** with App Router for modern routing and server components
- **TypeScript** for type-safe development
- **Tailwind CSS v4** for responsive, utility-first styling
- **Inter Font** from Google Fonts for modern typography
- **Responsive Design** that works seamlessly across all devices
- **Dark Mode Support** with system preference detection
- **SEO Optimized** with comprehensive metadata configuration
- **API Routes** for backend functionality
- **Component Library** with reusable, accessible components
- **Utility Functions** for common tasks
- **Clean Architecture** with proper folder structure

## 📁 Project Structure

```
event-website/
├── app/                          # Next.js App Router directory
│   ├── about/
│   │   └── page.tsx             # About page
│   ├── api/
│   │   └── register/
│   │       └── route.ts         # User registration API endpoint
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles and Tailwind directives
├── components/                   # Reusable React components
│   ├── Button.tsx               # Button component
│   ├── Card.tsx                 # Card component (with Header, Body, Footer)
│   └── index.ts                 # Component exports
├── lib/                          # Utility functions and helpers
│   ├── api.ts                   # API client functions
│   └── utils.ts                 # General utility functions
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts               # Next.js configuration
└── postcss.config.mjs            # PostCSS configuration
```

## 🛠 Technologies Used

- **Next.js 16.2** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS 4** - CSS transformation tool
- **Inter Font** - Professional sans-serif font

## 🎯 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 🏗️ Architecture Overview

### App Directory Structure

- **`/app`** - Main application directory using App Router
  - Routes are defined by file structure
  - `layout.tsx` wraps all pages with common UI
  - `page.tsx` files define route content
  - `route.ts` files define API endpoints

### Components

- Located in `/components`
- Fully typed with TypeScript
- Tailwind CSS for styling
- Exported from `components/index.ts` for easy imports

### Utilities

- **`lib/api.ts`** - API client with GET, POST, PUT, DELETE functions
- **`lib/utils.ts`** - Helper functions (formatting, validation, etc.)

## 🎨 Styling

The project uses Tailwind CSS v4 with:

- **Modern class-based styling** via `@apply` directives
- **Custom theme colors** defined in `globals.css`
- **Dark mode support** using `dark:` prefix
- **Responsive breakpoints** (sm, md, lg, xl, 2xl)
- **Global typography** with proper heading hierarchy

## 🔒 Type Safety

Full TypeScript support with:

- Strict type checking enabled
- React component types
- API response types
- Form validation types

## 📄 Pages

### Home Page (`/`)
- Hero section with call-to-action
- Features showcase
- Navigation and footer

### About Page (`/about`)
- Project overview
- Technology stack details
- Feature highlights
- Getting started guide

## 🔌 API Routes

### User Registration (`POST /api/register`)

Register a new user for events.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "registeredAt": "2026-03-22T12:00:00.000Z"
  }
}
```

## 🧩 Components

### Button Component
```tsx
import { Button } from "@/components";

<Button variant="primary" size="md">
  Click me
</Button>
```

**Props:**
- `variant` - "primary" | "secondary" | "outline" | "danger"
- `size` - "sm" | "md" | "lg"
- `isLoading` - Show loading state
- All standard HTML button props

### Card Component
```tsx
import { Card, CardHeader, CardBody, CardFooter } from "@/components";

<Card hoverable>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>
```

## 🌙 Dark Mode

Dark mode is automatically enabled based on system preferences using:
- CSS `prefers-color-scheme` media query
- Tailwind's `dark:` class prefix
- No additional setup required

## 📱 Responsive Design

The project uses Tailwind's responsive classes:
- `sm:` - Small screens (640px)
- `md:` - Medium screens (768px)
- `lg:` - Large screens (1024px)
- `xl:` - Extra large (1280px)
- `2xl:` - 2XL screens (1536px)

## 🔍 SEO

The project includes:
- Metadata configuration in `layout.tsx`
- Open Graph tags
- Twitter card tags
- Robots and canonical URLs
- Site-specific SEO for each page

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Vercel automatically builds and deploys

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Deploy to Other Platforms

The project can be deployed to any Node.js hosting:
- AWS
- Google Cloud
- Azure
- Docker containers
- Traditional hosting with Node.js

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is open source and available under the MIT License.

## 💡 Tips for Development

1. **Use TypeScript** - Take advantage of type safety
2. **Component Organization** - Keep components in `/components`
3. **Utility Functions** - Extract common logic to `/lib`
4. **Consistent Naming** - Use clear, descriptive names
5. **Comments** - Add comments for complex logic
6. **Git Commits** - Write meaningful commit messages

## 🤝 Contributing

This is a template project. Feel free to customize it for your needs!

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
