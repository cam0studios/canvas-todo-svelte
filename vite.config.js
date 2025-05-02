import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
	if (command == "serve") {
		return {
			plugins: [
				svelte(),
				tailwindcss()
			],
			base: "/canvas-todo-svelte"
		}
	}
	return {
		plugins: [
			svelte(),
			tailwindcss()
		],
		base: "/canvas-todo-svelte/"
	}
});
