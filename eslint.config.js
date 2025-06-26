// eslint.config.js im Projekt-Root
import webConfig from './apps/web/eslint.config.js';

export default [
  ...webConfig,
  {
    ignores: [
      'apps/desktop/**',
      'plugins/**',
    ],
  },
  // Hier können weitere App-Konfigurationen ergänzt werden, z.B. Desktop
]; 