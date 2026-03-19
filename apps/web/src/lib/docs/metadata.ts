import { parseDocSource } from './frontmatter';

type DocMetadata = {
	href: `/docs/${string}`;
	slug: string;
	title: string;
	description?: string;
};

const docModules = import.meta.glob<string>('/src/routes/docs/**/+page.svx', {
	query: '?raw',
	eager: true,
	import: 'default'
});

export function getDocMetadata(path: string): DocMetadata | null {
	const normalizedPath = normalizePath(path);
	const filePath = `/src/routes${normalizedPath}/+page.svx`;
	const rawSource = docModules[filePath];
	if (!rawSource) {
		return null;
	}

	const { metadata } = parseDocSource(rawSource);
	const { title, name, description } = metadata;
	if (!title && !name && !description) {
		return null;
	}

	const slug = normalizedPath.replace(/^\/docs(?:\/|$)/, '');

	return {
		href: normalizedPath as `/docs/${string}`,
		slug,
		title: name || title || slugToTitle(slug),
		description
	};
}

function slugToTitle(slug: string) {
	return slug
		.split('/')
		.filter(Boolean)
		.map((segment) => segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()))
		.join(' — ');
}

function normalizePath(path: string) {
	if (path === '/') return path;
	return path.replace(/\/+$/, '');
}

export type { DocMetadata };
