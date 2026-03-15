import type { DocItem } from '../types/doc';
import { docsManifest as generatedDocsManifest } from '$lib/generated/docs-manifest';

export const docsManifest: DocItem[] = generatedDocsManifest;

export const getDocBySlug = (slug: string) => {
	return docsManifest.find((doc) => doc.slug === slug);
};

export const getDocHref = (slug: string) => {
	return slug ? `/docs/${slug}` : '/docs';
};

export const getAdjacentDocs = (slug: string) => {
	const index = docsManifest.findIndex((doc) => doc.slug === slug);
	if (index === -1) {
		return { previous: null, next: null };
	}
	const previous = index > 0 ? docsManifest[index - 1] : null;
	const next = index < docsManifest.length - 1 ? docsManifest[index + 1] : null;
	return { previous, next };
};
