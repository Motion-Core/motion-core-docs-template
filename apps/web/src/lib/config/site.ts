export const siteConfig = {
	name: 'Motion GPU',
	shortName: 'Motion GPU Docs',
	url: 'https://motion-gpu.dev',
	description:
		'A WebGPU-first library for Svelte 5. Build high-performance, GPU-accelerated visualizations with a declarative API, strict runtime contracts, and type-safe WGSL shaders.',
	author: 'Marek Jóźwiak',
	keywords: [
		'webgpu',
		'svelte',
		'svelte 5',
		'shaders',
		'wgsl',
		'graphics',
		'gpu',
		'visualization',
		'creative coding',
		'motion-gpu'
	],
	ogImage: '/og-image.jpg',
	links: {
		github: 'https://github.com/motion-core/motion-gpu',
		twitter: 'https://x.com/madebyhex'
	},
	package: {
		name: '@motion-core/motion-gpu'
	}
};

export type SiteConfig = typeof siteConfig;
