# Tools

A modern suite of fast, privacy-first developer utilities built with React Router v7. All processing happens locally in your browser with zero server uploads.

## Tools

- **Generators & Encoding**
  - QR Code Generator - Create customizable QR codes with adjustable size and colors

- **Security & Auth**
  - JWT Decoder - Decode and inspect JSON Web Tokens with expiration checking

- **Media & Images**
  - Image to WebP Converter - Convert images to WebP format with quality control

- **Text & Formatting**
  - Markdown Previewer - Preview and render Markdown with GitHub Flavored Markdown support

- **Network & APIs**
  - JSON API Tester - Test REST APIs with custom headers, methods, and JSON payloads

## Tech Stack

- React 19 with React Router v7 (client-side)
- TypeScript with strict mode
- Tailwind CSS v4 with CSS variables
- shadcn/ui components (Radix UI + Tailwind)
- Vitest + React Testing Library

## Features

- 🔒 All tools run entirely in the browser - no server uploads
- 🌙 Dark/light theme support with persistent preference
- 📱 Responsive design with mobile-friendly sidebar navigation
- 🔍 Built-in tool search functionality
- 🐳 Docker support for containerized deployment
- ✅ Comprehensive unit tests

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open http://localhost:5173 to start using the tools.

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

### Testing

Run the unit tests:

```bash
npm test
```

Run tests with the Vitest UI:

```bash
npm run test:ui
```

## Building for Production

Create a production build:

```bash
npm run build
```

Serve the production build:

```bash
npm start
```

Built with [React Router](https://reactrouter.com/).
