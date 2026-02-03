# Agent Guidelines for Vue-TypeScript Project

## Project Overview
Vue 3 + TypeScript auto parts management system (汽配进销存) with Naive UI components and Pinia state management.

## Build Commands

```bash
# Frontend (myvue/)
cd myvue
npm install
npm run dev          # Start dev server on port 5173
npm run build        # Production build
npm run typecheck    # TypeScript checking (if configured)

# Backend (server/)
cd server
npm install
npm start            # Start Express server on port 3000
```

## Testing

**Status: No testing framework configured.**

To add testing:
```bash
npm install -D vitest @vue/test-utils
# Add to package.json scripts:
# "test": "vitest",
# "test:run": "vitest run"
```

Running single tests (once configured):
```bash
npm test -- <pattern>     # Run tests matching pattern
npm test -- --run         # Run once (CI mode)
```

## Code Style Guidelines

### Vue Components
- Use `<script setup lang="ts" name="组件名">` format
- Template section follows script section
- Chinese component names allowed: `name="配件资料"`

### Naming Conventions
- **Components:** PascalCase (AddInforVue, TableVue)
- **Files:** PascalCase for components, camelCase for utils
- **Variables:** camelCase (formValue, partInfoData)
- **Types:** PascalCase (PartInfoData, ApiResponse)
- **Props/Events:** descriptive with type annotations

### Import Patterns
```typescript
import { ref, watch, onMounted, computed } from 'vue'
import type { FormInst, SelectOption, DataTableColumns } from 'naive-ui'
import { useMessage, useDialog } from 'naive-ui'
import apiClient from '@/utils/apiClient'
import type { PartInfoData } from '@/types'
```

### Component Communication
- Props down with type safety: `defineProps<{ data: RowData[] }>`
- Events up: `defineEmits<{ (e: 'refresh'): void }>`
- Use `mitt` for global events (emitter.ts)

### API Integration
- Use centralized apiClient from '@/utils/apiClient'
- Extract data automatically: `response || []`
- Wrap in try-catch-finally with loading state

```typescript
const loading = ref(false)
async function fetchData() {
  loading.value = true
  try {
    const response = await apiClient.get('/endpoint')
    data.value = response || []
  } catch (error: any) {
    message.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}
```

### Form Handling
- Use Naive UI form components with grid layout
- Add validation rules with custom validators
- Use debounce for search inputs (lodash)

```typescript
const debouncedSearch = debounce(() => {
  refreshData(formValue.value)
}, 1000)

watch(() => formValue.value, () => {
  debouncedSearch()
}, { deep: true })
```

### TypeScript Types
- Define interfaces in `src/types/index.ts`
- Use strict typing, avoid `any`
- Type ref values: `ref<PartInfoData[]>([])`

### Error Handling
- Always use typed errors: `catch (error: any)`
- Show user-friendly messages via Naive UI message
- Log errors for debugging

### Database Fields (Backend)
- Map frontend fields to DB fields consistently
- Use PostgreSQL parameterized queries ($1, $2)
- Include ILIKE for case-insensitive search

## Project Structure
```
myvue/src/
├── components/     # Reusable UI components
├── views/         # Page views organized by module
│   ├── base/      # Base data modules (parts, customers, etc.)
│   └── common/    # Shared views
├── stores/        # Pinia state management
├── types/         # TypeScript definitions
├── utils/         # API client and utilities
└── router/        # Dynamic routing configuration

server/
├── pgsqlDemo/     # Database services
└── app.js         # Express server entry
```

## Key Conventions
- Use Chinese for UI labels and component names
- Always release database clients in finally blocks
- Use virtual-scroll for large tables with max-height
- Map DB snake_case to frontend camelCase (e.g., created_at → createdAt)
- Keep scoped styles minimal

## Vue Best Practices (from skills)

### Component Props & Types
- Extract props types from components using `ComponentProps<typeof Component>`
- Use `defineModel()` for v-model with proper update events
- Use `withDefaults()` with union types carefully (avoid `undefined` issues)
- Use fallthrough attributes `$attrs` properly in wrapper components
- Enable strictTemplates in tsconfig for template type checking

### Volar & IDE
- Use `moduleResolution: "bundler"` in tsconfig
- Fix Volar 3.0 breaking changes (takeover mode, separate TS server)
- Handle unplugin-auto-import conflicts (duplicate type definitions)
- Use `@vue-ignore` and `@vue-skip` comments for template control

### Performance
- Avoid deep watchers on large arrays (use Vue 3.5 efficient reactivity)
- Disable code actions on save for large projects if slow
- Fix duplicate plugin issues in Vite config

### Testing
- Mock Pinia stores in Vitest with `createPinia()` and `setActivePinia()`
- Test HMR behavior in SSR apps

## PostgreSQL Best Practices (from skills)

### Data Types
- Prefer TEXT over VARCHAR (no length limit, same performance)
- Use TIMESTAMPTZ for timestamps (timezone-aware)
- Use BIGINT for IDs (64-bit range)
- Use JSONB for semi-structured data (with GIN indexes)
- Use arrays for simple lists

### Constraints & Indexes
- Always use foreign keys with ON DELETE/UPDATE actions
- Add CHECK constraints for data validation
- Use UNIQUE constraints for natural keys
- Index strategy: B-tree (default), GIN (JSONB/full-text), GiST (geospatial), BRIN (time-series)

### Partitioning
- Use RANGE partitioning for time-series data
- Use LIST partitioning for categorical data  
- Use HASH partitioning for even distribution

## API Design Principles (from skills)

### REST
- Resource-oriented architecture (nouns not verbs)
- Proper HTTP methods: GET/POST/PUT/PATCH/DELETE
- Versioning: URL path (`/v1/`) or header (Accept)
- Pagination: cursor-based for large datasets, offset for small
- Status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500
- Error format: `{ "error": { "code": "...", "message": "...", "details": {} } }`

### GraphQL
- Schema-first design
- Use DataLoader pattern to prevent N+1 queries
- Proper resolver organization
- Input types for mutations

### Security
- Validate all inputs
- Use parameterized queries
- Rate limiting
- Authentication & authorization

## Important Notes
- No ESLint/Prettier configured - maintain consistency manually
- Backend uses CommonJS (require/module.exports)
- Frontend uses ES modules with path alias `@`
- Database: PostgreSQL with pg driver
- API proxy: `/api` → `http://localhost:3000`
- Skills installed: vue-best-practices, postgresql, api-design-principles
