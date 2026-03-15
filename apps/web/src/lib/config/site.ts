/**
 * Canonical site-level metadata shared across SEO tags, manifests, and feeds.
 * Keep this object project-specific when using the docs template for a new brand.
 */
export const siteConfig = {
	/** Primary site name used in titles and Open Graph site fields. */
	name: 'Motion Core Documentation Template',
	/** Compact site name for environments with strict length limits. */
	shortName: 'Motion Core Documentation Template',
	/** Public canonical URL used to build absolute links. */
	url: 'https://motion-gpu.dev',
	/** Default SEO description for the homepage and fallback metadata. */
	description:
		'A reusable documentation template for modern TypeScript projects. Launch branded docs fast with configurable navigation, SEO metadata, and content structure.',
	/** Author shown in metadata and structured data. */
	author: 'Marek Jóźwiak',
	/** Primary SEO keywords for indexing and discovery. */
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
	/** Default social preview image path. */
	ogImage: '/og-image.jpg',
	/** External profile links used by docs actions and metadata. */
	links: {
		github: 'https://example.com/',
		twitter: 'https://example.com/'
	},
	/** Package metadata used in installation snippets and docs helpers. */
	package: {
		name: '@motion-core/example'
	}
};

/** Inferred type for strongly-typed consumers of `siteConfig`. */
export type SiteConfig = typeof siteConfig;
