# MinusOne Music Admin Frontend - Detailed Architecture & Design Document

## 1. Executive Summary
This document defines the architectural blueprint for the MinusOne Music Admin Frontend. The system is designed as a medium-complexity Single Page Application (SPA) optimized for maintainability, type safety, and developer ergonomics. It strictly adheres to standard enterprise patterns, focusing on clean, predictable, and scalable code to seamlessly interface with the Spring Boot backend.

## 2. Technology Stack & Toolchain
- **Core Framework:** Vue 3.5 (Composition API, strict `<script setup>` usage).
- **Language:** TypeScript 5.9 (Strict mode enabled, enforcing strict typing for all API contracts).
- **Build Engine:** Vite 6.x (Configured for aggressive chunk splitting and fast Hot Module Replacement).
- **UI Component Library:** Element Plus (Standardized enterprise UI foundation).
- **CSS Engine:** Tailwind CSS v4.x (CSS-first `@theme` configuration, utility-first styling).
- **Routing:** Vue Router 4.x (Lazy-loaded routes, typed routing).
- **State Management:** Pinia 3.x (Dedicated exclusively to global app state and authentication).
- **HTTP Client:** Axios (Wrapped in a singleton service with global interceptors).
- **Date Utility:** Day.js (Lightweight standard for formatting backend ISO dates).
- **Tooling:** pnpm (package manager), ESLint (Flat Config), Prettier.

## 3. Advanced Directory Structure
The architecture enforces a strict separation of concerns. Domain logic (API, Types) is decoupled from UI representation (Views, Components), and global state is strictly reserved for application-wide context.

```text
minusone-admin-web/
├── .env.development         # VITE_API_BASE_URL=http://localhost:8080, VITE_CDN_URL=...
├── .env.production          # VITE_API_BASE_URL=/api
├── src/
│   ├── api/                 # Domain-driven HTTP modules
│   │   ├── core/            # Axios instance, interceptors, error handling
│   │   ├── auth.ts          # Auth API
│   │   ├── account.ts       # Account API
│   │   ├── song.ts          # Song API
│   │   └── resource.ts      # Resource API
│   ├── assets/              # Static assets & Global CSS
│   │   └── styles/
│   │       ├── main.css     # Tailwind v4 entry (@import "tailwindcss")
│   │       └── element.css  # Element Plus CSS variable overrides
│   ├── components/          # Dumb/Presentational components
│   │   ├── common/          # PageHeader.vue, StatusBadge.vue
│   │   └── upload/          # MediaUploader.vue (el-upload wrapper)
│   ├── composables/         # Smart/Stateful logic (Vue Reactivity)
│   │   ├── usePagination.ts # Standardized Spring Boot pagination sync
│   │   └── useFormDialog.ts # Standardized dialog open/close/reset logic
│   ├── constants/           # Enums and immutable configuration
│   │   └── roles.ts         # User role definitions
│   ├── layouts/             # Application shells
│   │   └── AdminLayout/
│   │       ├── index.vue    # el-container wrapper
│   │       ├── Sidebar.vue  # el-menu (collapsible)
│   │       └── Header.vue   # Breadcrumbs, User Dropdown
│   ├── router/              # Route definitions & Guards
│   │   ├── index.ts         # Router initialization & beforeEach guard
│   │   └── routes.ts        # Route tree
│   ├── store/               # Global State (Pinia)
│   │   ├── auth.ts          # JWT, User Profile
│   │   └── app.ts           # Sidebar state, Theme settings
│   ├── types/               # Strict TypeScript Interfaces
│   │   ├── api.d.ts         # PageResponseDto, ErrorResponse
│   │   ├── models.d.ts      # AccountDto, SongDto, ResourceDto
│   │   └── requests.d.ts    # AccountCreateRequest, SongUpdateRequest
│   ├── utils/               # Pure functions (No Vue dependencies)
│   │   ├── formatters.ts    # Day.js date formatting, file size formatting
│   │   └── validators.ts    # Custom Element Plus form validators
│   ├── views/               # Smart/Container components (Pages)
│   │   ├── login/           # Login.vue
│   │   ├── accounts/        # AccountList.vue, components/AccountForm.vue
│   │   ├── songs/           # SongList.vue, components/SongForm.vue
│   │   └── resources/       # ResourceGallery.vue
│   ├── App.vue              # Root Component
│   └── main.ts              # Entry Point
```

## 4. Core System Design Details

### 4.1. HTTP & Error Handling Strategy (`src/api/core/http.ts`)
The Axios instance acts as the central nervous system for API communication. It standardizes how the frontend interacts with the Spring Boot backend, centralizing error parsing and token management.

- **Request Interceptor:**
  - Injects the `Authorization: Bearer <token>` header from the Pinia auth store.
  - Strips empty strings or `null` values from request payloads to ensure clean data transmission.
- **Response Interceptor:**
  - **2xx Responses:** Extracts `.data` and returns the typed payload directly to the calling function.
  - **400 Bad Request (Validation):** Intercepts Spring Boot `@Valid` errors. Parses the JSON error array and triggers a single `ElMessage.error` containing the specific field validation failures.
  - **401 Unauthorized:** Clears the Pinia Auth store, drops the token, and redirects to `/login?redirect={current_path}`.
  - **403 Forbidden:** Displays an "Access Denied" notification.
  - **500 Internal Error:** Displays a generic "System Error" notification, shielding the UI from raw stack traces.

### 4.2. Pagination Synchronization (`src/composables/usePagination.ts`)
Spring Boot `Pageable` is 0-indexed, while Element Plus `<el-pagination>` is 1-indexed. The `usePagination` composable encapsulates this translation layer to ensure seamless data synchronization across all list views.

- **State:** Manages `loading`, `data`, `page` (0-indexed for API), `size`, and `totalElements`.
- **Actions:** Exposes `handleCurrentChange(val)` which subtracts 1 before calling the API, and `handleSizeChange(val)` which resets the page to 0.

### 4.3. Form Validation & Data Mutation
Forms utilize Element Plus `<el-form>` bound to standard `[Entity]CreateRequest` or `[Entity]UpdateRequest` types.
- **Validation Rules:** Defined using standard rules within the `<script setup>`. Custom validators (e.g., regex checking if a URL is valid for `mediaUrl`) are extracted to `src/utils/validators.ts` for consistent reuse.
- **State Reset Strategy:** Dialog components utilize the `destroy-on-close` prop on `<el-dialog>`. This guarantees a completely fresh Vue component instance and state upon reopening, ensuring predictable form initialization.

### 4.4. Media & Resource Management
The backend provides a CDN-like delivery endpoint at `app.media.delivery-url`.
- **Uploading:** The `MediaUploader.vue` component wraps `<el-upload>`. It uses a custom `http-request` override to route the upload through the centralized Axios instance, ensuring the JWT token is attached and errors are handled globally.
- **Rendering:** Resource URLs are constructed by appending the `filename` from `ResourceDto` to the base delivery URL (configured in `.env` as `VITE_CDN_URL`).
- **Previews:** Audio files use a minimalist custom audio player component built with native HTML5 `<audio>` tags styled with Tailwind, providing a lightweight and integrated user experience.

## 5. Styling & Theming Architecture

### 5.1. Tailwind CSS v4 Integration
Tailwind v4 manages all configuration directly in CSS, utilizing the modern CSS-first engine for maximum performance and simplicity.
```css
/* src/assets/styles/main.css */
@import "tailwindcss";

@theme {
  --color-primary: var(--el-color-primary);
  --color-success: var(--el-color-success);
  --color-warning: var(--el-color-warning);
  --color-danger: var(--el-color-danger);
}

/* Base resets and custom utilities */
@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}
```

### 5.2. Element Plus Customization
Element Plus uses CSS variables for theming. We override these variables at the root level (`src/assets/styles/element.css`) to match the MinusOne brand identity. By mapping Tailwind's `@theme` to Element's CSS variables, both the utility classes and the UI components share the exact same standardized color palette.

## 6. Security Implementation
- **Authentication:** JWT is stored in `localStorage` and transmitted via strict Bearer token headers, aligning with standard practices for decoupled Admin SPAs.
- **XSS Prevention:** Data binding exclusively uses Vue's text interpolation (`{{ }}`) which automatically escapes HTML, neutralizing XSS risks.
- **Route Guards:** The `router.beforeEach` hook checks `to.meta.requiresAuth`. If `true`, it verifies the token's existence in the Pinia store before allowing navigation, securing access to dashboard chunks.

## 7. Build & Performance Optimization
- **Chunk Splitting:** Vite is configured to split vendor dependencies into separate chunks to optimize browser caching and reduce the initial load payload.
  ```typescript
  // vite.config.ts snippet
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor':['vue', 'vue-router', 'pinia'],
          'element-plus':['element-plus', '@element-plus/icons-vue']
        }
      }
    }
  }
  ```
- **Auto-Import Strategy:** Utilizes `unplugin-vue-components` and `unplugin-auto-import`. Auto-imports are strictly scoped to Vue core APIs (`ref`, `computed`, `onMounted`) and Element Plus components to maintain clarity. Domain logic, API calls, and composables must always be explicitly imported, ensuring traceable dependency graphs.