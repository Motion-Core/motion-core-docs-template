import { fileURLToPath, URL } from 'node:url';
import adapter from '@sveltejs/adapter-cloudflare';
import { type Config } from '@sveltejs/kit';
import type { PreprocessorGroup } from 'svelte/compiler';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { escapeSvelte, mdsvex } from 'mdsvex';
import { createHighlighter } from 'shiki';
import { tableCellFormatter } from './utils/rehypeTableCellFormatter.ts';

const themes = {
	light: 'github-light',
	dark: 'github-dark'
} as const;
const highlighter = await createHighlighter({
	themes: Object.values(themes),
	langs: ['svelte', 'bash', 'json', 'typescript', 'wgsl']
});

const markdownLayout = fileURLToPath(
	new URL('./src/lib/components/docs/MarkdownLayout.svelte', import.meta.url)
);

const config: Config = {
	extensions: ['.svelte', '.svx'],
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		mdsvex({
			extensions: ['.svx'],
			layout: {
				docs: markdownLayout
			},
			rehypePlugins: [tableCellFormatter],
			highlight: {
				highlighter: async (code: string, lang?: string | null) => {
					const language = lang ?? 'text';
					const lightHtml = escapeSvelte(
						highlighter.codeToHtml(code, {
							lang: language,
							theme: themes.light
						})
					);
					const darkHtml = escapeSvelte(
						highlighter.codeToHtml(code, {
							lang: language,
							theme: themes.dark
						})
					);
					const htmlLightProp = JSON.stringify(lightHtml);
					const htmlDarkProp = JSON.stringify(darkHtml);
					const langProp = JSON.stringify(language);
					const rawProp = JSON.stringify(code);
					return `<svelte:component this={Reflect.get(globalThis, "__MarkdownPre")} lang={${langProp}} htmlLight={${htmlLightProp}} htmlDark={${htmlDarkProp}} raw={${rawProp}} />`;
				}
			}
		}) as PreprocessorGroup,
		vitePreprocess()
	],

	kit: {
		adapter: adapter(),
		typescript: {
			config: (config) => ({
				...config,
				include: [...(config.include ?? []), '../eslint.config.ts', '../svelte.config.ts']
			})
		}
	}
};

export default config;
