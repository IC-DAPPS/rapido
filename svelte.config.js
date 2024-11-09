import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const filesPath = (path) => `src/frontend/${path}`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			fallback: 'index.html',
			precompress: false
		}),

		files: {
			assets: filesPath('static'),
			hooks: {
				client: filesPath('src/hooks.client'),
				server: filesPath('src/hooks.server')
			},
			lib: filesPath('src/lib'),
			params: filesPath('src/params'),
			routes: filesPath('src/routes'),
			serviceWorker: filesPath('src/service-worker'),
			appTemplate: filesPath('src/app.html'),
			errorTemplate: filesPath('src/error.html')
		},
		alias: {
			'@declarations/*': './src/declarations/*',
			'@components/*': './src/frontend/src/lib/components/*',
			'@constants/*': './src/frontend/src/lib/constants/*',
			'@services/*': './src/frontend/src/lib/services/*',
			'@stores/*': './src/frontend/src/lib/stores/*',
			'@utils/*': './src/frontend/src/lib/utils/*',
			'@env/*': './src/frontend/src/env'
		}
	}
};

export default config;
