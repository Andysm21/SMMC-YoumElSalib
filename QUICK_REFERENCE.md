# Quick Reference Guide

## 🚀 Start Development

```bash
npm run dev
```
Navigate to `http://localhost:3000`

---

## 📝 Common Tasks

### Create a New Page
Create a new file in `/app/[page-name]/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
};

export default function Page() {
  return (
    <main>
      <h1>Welcome</h1>
    </main>
  );
}
```

### Create a New API Route
Create a new file in `/app/api/[endpoint]/route.ts`:

```tsx
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Hello" });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### Create a New Component
Create a new file in `/components/[Name].tsx`:

```tsx
import { cn } from "@/lib/utils";

export interface MyComponentProps {
  className?: string;
}

export function MyComponent({ className }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      Content
    </div>
  );
}
```

Export it in `components/index.ts`:
```ts
export { MyComponent } from "./MyComponent";
export type { MyComponentProps } from "./MyComponent";
```

### Create a New Utility
Add to `/lib/utils.ts` or create `/lib/[utility].ts`:

```ts
export function myFunction(param: string): string {
  return param.toUpperCase();
}
```

---

## 🎨 Styling Patterns

### Using Tailwind Classes
```tsx
<div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

### Responsive Classes
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>
```

### Dark Mode
```tsx
<button className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
  Click me
</button>
```

### Using the `cn()` Helper
```tsx
import { cn } from "@/lib/utils";

const className = cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-class"
);
```

---

## 📦 Using Components

### Button
```tsx
import { Button } from "@/components";

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

Options:
- `variant`: "primary" | "secondary" | "outline" | "danger"
- `size`: "sm" | "md" | "lg"
- `isLoading`: boolean
- `disabled`: boolean

### Card
```tsx
import { Card, CardHeader, CardBody, CardFooter } from "@/components";

<Card hoverable>
  <CardHeader>Title</CardHeader>
  <CardBody>Content goes here</CardBody>
  <CardFooter>Footer content</CardFooter>
</Card>
```

---

## 🔗 Using API Client

```tsx
import { apiPost, apiGet } from "@/lib/api";

// POST request
const response = await apiPost("/api/register", {
  name: "John Doe",
  email: "john@example.com"
});

if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}

// GET request
const data = await apiGet("/api/users");
```

---

## 📱 Responsive Breakpoints

```tsx
<div className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: 50% width
  lg:w-1/3         // Desktop: 33% width
  text-sm          // Mobile: small text
  md:text-base     // Tablet: base text
  lg:text-lg       // Desktop: large text
">
  Content
</div>
```

Breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

---

## 🎯 Common Utilities

```ts
import { 
  cn,                    // Combine class names
  formatDate,            // Format date
  formatDateTime,        // Format date & time
  truncate,              // Truncate text
  isValidEmail,          // Validate email
  debounce,              // Debounce function
  deepClone              // Deep clone object
} from "@/lib/utils";
```

---

## 🔐 Type Definitions

Use types from `/lib/types.ts`:

```ts
import type { 
  User, 
  RegistrationData, 
  RegistrationResponse 
} from "@/lib/types";

const user: User = {
  id: "1",
  name: "John",
  email: "john@example.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

---

## ⚙️ Configuration

### Site Configuration
Edit `lib/constants.ts`:
```ts
export const SITE_CONFIG = {
  name: "My App",
  description: "Description",
  url: "https://myapp.com",
  // ...
};
```

### Environment Variables
Edit `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### TypeScript Config
Edit `tsconfig.json`:
- `@/*` - Path alias for root imports
- Strict mode enabled for type safety

---

## 🚢 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Deploy to Vercel
1. Push to GitHub
2. Connect to Vercel
3. Auto-deploys on push

### Deploy to Other Platforms
1. Run `npm run build`
2. Deploy `.next/` folder
3. Set Node.js version to 18.17+

---

## 🐛 Debugging

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Next.js Debug Mode
```bash
DEBUG=* npm run dev
```

### Build Analysis
```bash
npm run build -- --analyze
```

---

## 📚 File Naming Conventions

- **Components**: PascalCase (Button.tsx, MyCard.tsx)
- **Pages**: kebab-case in directory (about/page.tsx)
- **API routes**: kebab-case (register/route.ts)
- **Utilities**: camelCase (api.ts, utils.ts)
- **Types**: filename.ts with exported types
- **Constants**: UPPER_CASE for const values

---

## ✅ Checklist Before Deployment

- [ ] Update site metadata in `app/layout.tsx`
- [ ] Replace logo/branding in components
- [ ] Update navigation links
- [ ] Configure environment variables
- [ ] Test all pages and APIs
- [ ] Run `npm run build` successfully
- [ ] Check for console errors
- [ ] Test on mobile devices
- [ ] Update .env.example with needed variables
- [ ] Remove unused code
- [ ] Add your custom components
- [ ] Configure analytics if needed

---

## 📞 Helpful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

---

**Happy coding! 🎉**
