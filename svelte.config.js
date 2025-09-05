import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	
	kit: {
		adapter: adapter({
			// path to the directory where the static files will be written
			pages: 'build',
			// path to the directory where the app will write prerendered pages and client-side assets
			assets: 'build',
			// fallback page for SPA mode
			fallback: undefined,
			// precompress static assets
			precompress: false,
			// strict mode - fails build if any pages can't be prerendered
			strict: true
		}),
		// Prerender all pages for static generation
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
			entries: ['*']
		}
	},
	
	extensions: ['.svelte', '.md']
};

export default config;