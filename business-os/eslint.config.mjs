// Lint config for the Hospitality OS demo. ESLint and eslint-config-next are resolved from the repository
// root's node_modules (run `npm install` in the repo root once), so this package keeps no extra dependencies.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Compiler advisory rules, reported as warnings (not errors) on purpose:
    // the whole app renders client-side only after mount (DemoProvider gate), browser storage is read in
    // effects by design, and the sync store keeps an optimistic event buffer in a ref. These are tracked
    // as refactoring items (useSyncExternalStore) in docs/HOSPITALITY_OS_IMPLEMENTATION_ROADMAP.md.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
    },
  },
  globalIgnores([".next/**", ".next-*/**", "next-env.d.ts"]),
]);
