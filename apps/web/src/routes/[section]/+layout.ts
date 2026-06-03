import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import {
	getContentSectionAdjacentItems,
	getContentSectionMetadata,
	getContentSectionSlug
} from '$lib/content/sections';
import { contentSections } from '$lib/config/navigation';

export const prerender = true;

export const load: LayoutLoad = ({ params, url }) => {
	const sectionId = params.section;

	const isKnownSection = contentSections.some((s) => s.id === sectionId);
	if (!isKnownSection) {
		error(404, 'Section not found');
	}

	const slug = getContentSectionSlug(sectionId, url.pathname);
	const { previous, next } = getContentSectionAdjacentItems(sectionId, slug);
	const metadata = getContentSectionMetadata(sectionId, url.pathname);

	return {
		sectionId,
		slug,
		metadata,
		previousDoc: previous,
		nextDoc: next,
		docOrigin: url.origin
	};
};
