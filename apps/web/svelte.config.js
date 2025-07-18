import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import pkg from './package.json' with { type: 'json' };

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		prerender: {
			// entries: ['/ores/ore_gold', '/stats/ore_gold']
		},
		paths: {
			// base: process.env.ELECTRON ? '' : ''
		},
        version: {
            name: pkg.version,
        },

	}
};

export default config;
