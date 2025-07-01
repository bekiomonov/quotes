# 📖 Quotes Carousel App

A modern quote app that fetches and displays inspiring quotes in a beautiful, autoplay-enabled slider. Quotes are fetched from multiple sources and cached locally for offline use.

---

## ✨ Features

- 🎡 Autoplay carousel
- 🌐 Fetches quotes from:
  - [https://dummyjson.com/quotes/random](https://dummyjson.com/quotes/random)
  - [https://api.realinspire.live/quote](https://api.realinspire.live/quote)
- 📦 Offline support with `localStorage` fallback
- ❤️ Like and ⭐ rate quotes
- 🗂 Favorites page with list of liked quotes
- 🌙 Theme switching with `next-themes`
- 🌍 Internationalization with `next-intl`
- 🧪 Test suite using `vitest` and `@testing-library/react`

---

## 🛠 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **State Management**: Zustand (coming soon ⏳)
- **Testing**: Vitest, React Testing Library, MSW
- **Tooling**: ESLint, Prettier, Husky, Lint-Staged
- **Package Manager**: Yarn

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/quotes.git
cd quotes
yarn install
```

---

## 🧪 Testing

```bash
yarn test          # Run all tests
yarn test:watch    # Run tests in watch mode
```

---

## 🚀 Development

```bash
yarn dev
```

Then open http://localhost:3000

---

## 🏗️ Production Build

```bash
yarn build
yarn start
```

---

## 🔐 Environment Variables

```env
NEXT_PUBLIC_DUMMYJSON_API=https://dummyjson.com/quotes/random
NEXT_PUBLIC_REALINSPIRE_API=https://api.realinspire.live/v1/quotes/random
```

---

## 💡 How It Works

- On load, the app fetches a random quote from the two APIs, whichever comes first is displayed and another is cancelled.
- If offline, quotes are pulled from the local cache (localStorage).
- When the network is restored, it continues fetching from the online source.
- Carousel supports autoplay and navigation.
- Users can like and rate quotes.
- Liked quotes are stored and displayed on a separate favorites page.

## 🧼 Code Quality

```bash
yarn lint       # Lint with ESLint
yarn format     # Format with Prettier
```

> Pre-commit hooks are configured via husky and lint-staged.
