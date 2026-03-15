export const siteConfig = {
	name: 'Motion Core Documentation Template',
	shortName: 'Motion Core Documentation Template',
	url: 'https://motion-gpu.dev',
	description:
		'A reusable documentation template for modern TypeScript projects. Launch branded docs fast with configurable navigation, SEO metadata, and content structure.',
	author: 'Marek Jóźwiak',
	keywords: [
		'documentation',
		'docs template',
		'static docs',
		'typescript',
		'sveltekit',
		'seo',
		'developer docs',
		'knowledge base',
		'template',
		'motion core documentation template'
	],
	ogImage: '/og-image.jpg',
	links: {
		github: 'https://example.com/',
		twitter: 'https://example.com/'
	},
	package: {
		name: '@motion-core/example'
	}
};

export type SiteConfig = typeof siteConfig;
