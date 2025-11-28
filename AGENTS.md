# Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run unit tests with Vitest
- `npm test -- <filename>` - Run specific test file (e.g., `npm test -- jwt-decoder.test.tsx`)
- `npm test:ui` - Run tests with Vitest UI
- `npm start` - Serve production build

# Code Style Guidelines
- Use React Router v7 with file-based routing, client-side only (ssr: false)
- Import aliases: `~/components`, `~/lib`, `~/hooks`, `~/ui`
- TypeScript strict mode enabled, Vitest globals configured
- Use shadcn/ui components with Tailwind CSS v4 with CSS variables
- Component files use PascalCase with kebab-case naming (e.g., `jwt-decoder.tsx`)
- Interfaces for all complex types, prefer explicit typing over `any`
- Error handling with try-catch and user-friendly messages
- Use `cn()` utility for conditional Tailwind classes
- Follow React functional components with hooks pattern
- No default exports - use named exports for components
- Test files: `*.test.tsx` alongside components, mock external dependencies
- Use Vitest with React Testing Library for unit testing
- Client-side APIs (localStorage, window) safe - ThemeProvider in App component
- Follow shadcn/ui patterns: new-york style, zinc base color, lucide icons