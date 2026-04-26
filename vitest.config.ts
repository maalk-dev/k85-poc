import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{unit,integration}.test.ts'],
    exclude: [...configDefaults.exclude],

    typecheck: { enabled: true },

    silent: true,
    passWithNoTests: true,
    mockReset: true,
    unstubEnvs: true,
  },
});
