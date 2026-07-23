## 2026-07-22T10:48:11Z

<USER_REQUEST>
You are an Implementation Worker executing Milestone M3: R3 Performance & Memory Optimization.
Working directory: /Users/siracsimsek/Desktop/open source browser/.agents/worker_m3_perf_v2
Workspace root: /Users/siracsimsek/Desktop/open source browser
Project Index: /Users/siracsimsek/Desktop/open source browser/PROJECT.md
User Request Record: /Users/siracsimsek/Desktop/open source browser/.agents/ORIGINAL_REQUEST.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks for Milestone M3:
1. Dynamic Import of `@mlc-ai/web-llm` (`src/services/aiEngine.ts`):
   - Replace static top-level import `import { CreateMLCEngine, ... } from '@mlc-ai/web-llm'` in `aiEngine.ts` with dynamic import `const { CreateMLCEngine } = await import('@mlc-ai/web-llm')` inside `initializeModel()`.
   - Verify that Vite splits `@mlc-ai/web-llm` into a separate chunk (`web-llm-*.js`), shrinking the initial main JS bundle (`index-*.js`) from 6.23 MB down to ~220 KB.
2. WebGPU VRAM & WASM Memory Disposal (`src/services/aiEngine.ts`):
   - Add `if (this.engine) { try { await this.engine.unload(); } catch(e){} this.engine = null; }` before initializing a new `MLCEngine` instance in `initializeModel()`.
   - Expose a `dispose()` / `unload()` method on `AIEngineService`.
3. Synchronous Disk I/O & Tab Switching Latency (`src/App.tsx`):
   - Omit `extractedText` from `tabs_session` serialization or debounce `localStorage.setItem('tabs_session', ...)` using `setTimeout` / `requestIdleCallback` to prevent main-thread stutter during fast tab switching.
4. React Component Memoization & useCallback:
   - Wrap `TopBar`, `BrowserView`, `ZenCopilot`, and modal components in `React.memo`.
   - Wrap tab action handlers in `useCallback` in `src/App.tsx`.
5. Verification:
   - Run `npm run build` and `npm test`. Ensure 0 TypeScript / Vite errors, reduced main bundle size, and 100% test pass (117/117 passed).

Write handoff report to `/Users/siracsimsek/Desktop/open source browser/.agents/worker_m3_perf_v2/handoff.md` and update `progress.md`.
</USER_REQUEST>
