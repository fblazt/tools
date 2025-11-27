# Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run unit tests with Vitest
- `npm test -- <filename>` - Run specific test file
- `npm start` - Serve production build

# Code Style Guidelines
- Use React Router v7 with file-based routing
- Import aliases: `~/components`, `~/lib`, `~/hooks`, `~/ui`
- TypeScript strict mode enabled
- Use shadcn/ui components with Tailwind CSS
- Component files use PascalCase (e.g., `jwt-decoder.tsx`)
- Interfaces for all complex types, prefer explicit typing
- Error handling with try-catch and user-friendly messages
- Use `cn()` utility for conditional Tailwind classes
- Follow React functional components with hooks pattern
- No default exports - use named exports for components