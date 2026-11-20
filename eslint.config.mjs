// ESLint 9 flat config (Next.js 16 removed `next lint`; `npm run lint` runs ESLint directly).
// Same rules as the previous .eslintrc.json: next/core-web-vitals, with plain <img> allowed.
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      // Pages Router rule; this project uses the App Router only (no /pages directory).
      '@next/next/no-html-link-for-pages': 'off',
      // React Compiler advisories added in eslint-plugin-react-hooks v7 (not part of the previous lint setup).
      // Kept visible as warnings; fixing them means refactoring approved components, which is out of scope.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts', 'content-export/**', '.data/**']),
]);
