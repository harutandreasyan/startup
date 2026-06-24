# 08 — Web Application (React + Vite)

## Architecture as built (2026-06-24)
- **Component structure:** every component/page lives in its own folder with
  `index.ts` (`export { default } from './<Name>'`), `<Name>.tsx` (**default export**),
  and `styles.ts`. Tailwind class strings live in `styles.ts` and are pulled in via a
  `useStyles`/`cx` helper (`src/lib/useStyles.ts`) — react-jss-like ergonomics, still
  Tailwind, zero runtime CSS. Components are imported as **default imports**.
- **Styling:** Tailwind v4 + semantic CSS-variable tokens, light/dark via `.dark` class.
- **State/data:** Zustand stores + TanStack Query. Toasts via `stores/toast.store` + `<Toaster/>`.
- **Page transitions:** each page owns ONE entrance animation (CSS `animate-fade-in-up`, or a
  framer-motion stagger on Dashboard/Gallery). The old `AnimatePresence`-around-`<Outlet/>`
  wrapper was REMOVED (it double-mounted pages). Don't reintroduce it.
- **Tools:** Generate page routes by `?type=`. Free: Text-to-Image (+ style presets),
  Background Removal (in-browser, `components/tools/BackgroundRemover`). Gated paid tools show
  a "coming soon" panel. Availability source of truth: `src/lib/generation.ts`.
- **Other pages:** Credits (plans + packs + **usage stats** from `GET /users/me/stats** + tx
  history), Settings (profile w/ required name, email change, delete account), Gallery.
- **Auth forms:** custom in-app validation (no native browser bubbles — `noValidate` + inline
  field errors).
- **Build note:** workspace packages compile to CommonJS; `vite.config.ts` `optimizeDeps.include`
  must list `@creatorai/shared` + `@creatorai/api-client` (see docs/02 / project memory).

## Tech Stack
- React 19 + TypeScript
- Vite (build tool)
- React Router v7 (routing)
- Zustand (state management)
- TanStack Query (server state / API caching)
- Tailwind CSS v4 (styling)
- Supabase JS (auth)
- Axios (API client)

## Page Structure

```
apps/web/src/
├── main.tsx
├── App.tsx
├── index.css                    # Tailwind imports
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── api.ts                   # Axios instance with auth interceptor
│   └── websocket.ts             # WebSocket connection for generation updates
├── stores/
│   ├── auth.store.ts            # User session state
│   ├── credits.store.ts         # Credit balance
│   └── generation.store.ts      # Active generation state
├── hooks/
│   ├── useAuth.ts
│   ├── useCredits.ts
│   ├── useGeneration.ts
│   └── useModels.ts
├── pages/
│   ├── Landing.tsx              # Marketing / hero page (unauthenticated)
│   ├── Login.tsx                # Email + Google + Apple sign in
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── Dashboard.tsx            # Home after login — recent generations
│   ├── Generate.tsx             # Main generation page
│   ├── Gallery.tsx              # User's generation history
│   ├── Credits.tsx              # Buy credits / manage subscription
│   ├── Settings.tsx             # Profile, account, preferences
│   └── NotFound.tsx
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx        # Sidebar + content area
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── SocialButtons.tsx
│   ├── generation/
│   │   ├── PromptInput.tsx      # Text prompt input with suggestions
│   │   ├── ModelSelector.tsx    # Choose AI model
│   │   ├── ParamsPanel.tsx      # Model-specific settings
│   │   ├── GenerationCard.tsx   # Single result display
│   │   ├── GenerationGrid.tsx   # Gallery grid of results
│   │   ├── ProgressBar.tsx      # Real-time generation progress
│   │   └── ImageEditor.tsx      # Basic editing (crop, inpaint mask)
│   ├── credits/
│   │   ├── CreditBalance.tsx    # Shows current balance
│   │   ├── CreditPacks.tsx      # Purchase options
│   │   └── TransactionHistory.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Spinner.tsx
│       └── ImagePreview.tsx
└── routes.tsx                   # React Router config
```

## Key Pages

### Generate Page (main feature)

```
┌─────────────────────────────────────────────────────┐
│  [Sidebar]  │  Generate                    [💎 450] │
│             │                                       │
│  Dashboard  │  ┌─ Model ─────────────────────────┐  │
│  Generate   │  │ [Flux Schnell ▾]  2 credits     │  │
│  Gallery    │  └─────────────────────────────────┘  │
│  Credits    │                                       │
│  Settings   │  ┌─ Prompt ────────────────────────┐  │
│             │  │ A futuristic city at sunset...   │  │
│             │  │                                  │  │
│             │  │ [Negative prompt ▸]              │  │
│             │  └─────────────────────────────────┘  │
│             │                                       │
│             │  ┌─ Settings ──────────────────────┐  │
│             │  │ Size: [1024x1024 ▾]             │  │
│             │  │ Steps: [──●──────] 25           │  │
│             │  │ Seed: [random]                  │  │
│             │  └─────────────────────────────────┘  │
│             │                                       │
│             │  [✨ Generate]                        │
│             │                                       │
│             │  ┌─ Result ────────────────────────┐  │
│             │  │                                  │  │
│             │  │      [Generated Image]           │  │
│             │  │                                  │  │
│             │  │ [Download] [Upscale] [Remix]     │  │
│             │  └─────────────────────────────────┘  │
└─────────────┴───────────────────────────────────────┘
```

### Landing Page (unauthenticated)
- Hero section with example generations
- Feature highlights (image, video, 3D)
- Pricing section
- Testimonials (later)
- CTA → Sign up

## Routing

```typescript
// routes.tsx
const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },

  // Protected routes (require auth)
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/generate', element: <Generate /> },
      { path: '/generate/:type', element: <Generate /> },  // /generate/video
      { path: '/gallery', element: <Gallery /> },
      { path: '/credits', element: <Credits /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);
```

## API Integration

```typescript
// lib/api.ts
import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

## Real-time Generation Updates

```typescript
// lib/websocket.ts
// Connect after auth, listen for generation progress
const ws = new WebSocket(`${WS_URL}?token=${accessToken}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: 'generation.progress', generationId: '...', progress: 0.5 }
  // { type: 'generation.completed', generationId: '...', outputUrls: [...] }
  // { type: 'generation.failed', generationId: '...', error: '...' }
};
```

## Steps

- [ ] Initialize Vite + React + TypeScript project
- [ ] Set up Tailwind CSS
- [ ] Set up React Router with all routes
- [ ] Create AppLayout component (sidebar + header)
- [ ] Build auth pages (Login, Register, ForgotPassword)
- [ ] Integrate Supabase auth (login, register, Google OAuth)
- [ ] Set up Axios with auth interceptor
- [ ] Build Generate page (prompt input, model selector, params)
- [ ] Implement generation submission + progress display
- [ ] Build Gallery page (grid of past generations)
- [ ] Build Credits page (balance, purchase packs via Stripe)
- [ ] Build Settings page (profile, change password, delete account)
- [ ] Build Landing page (marketing, pricing)
- [ ] Add responsive design (mobile web)
- [ ] Set up TanStack Query for API state management
- [ ] Add loading states, error handling, toast notifications

## Next Step
Proceed to [09-MOBILE-APP.md](./09-MOBILE-APP.md)
