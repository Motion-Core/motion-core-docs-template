#!/usr/bin/env bun
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const configPath = path.join(appRoot, 'src/lib/config/docs.ts');
const docsRoutesPath = path.join(appRoot, 'src/routes/docs');
const outputPath = path.join(appRoot, 'src/lib/generated/docs-manifest.ts');

/**
 * @typedef {{ slug: string; name: string; category?: string; items?: DocItem[] }} DocItem
 */
/**
 * @typedef {{
 * 	categoryOrder?: string[];
 * 	defaults?: {
 * 		category?: string;
 * 		rootCategory?: string;
 * 		rootName?: string;
 * 		rootOrder?: number;
 * 		defaultOrder?: number;
 * 	};
 * 	overrides?: Record<string, {
 * 		name?: string;
 * 		category?: string;
 * 		order?: number;
 * 		hidden?: boolean;
 * 	}>;
 * }} DocsConfig
 */
/**
 * @typedef {{ name?: string; title?: string; category?: string; order?: number; hidden?: boolean }} Frontmatter
 */
/**
 * @typedef {{ slug: string; name: string; category: string; order: number }} ResolvedDoc
 */

function invariant(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

/**
 * @param {string} value
 */
function escapeString(value) {
	return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

/**
 * @param {string} text
 */
function slugify(text) {
	return text
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * @param {string} value
 */
function toTitleCase(value) {
	return value
		.split(/[-_/]+/)
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(' ');
}

/**
 * @param {string} content
 * @returns {Frontmatter}
 */
function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};

	const body = match[1];
	/** @type {Frontmatter} */
	const result = {};

	for (const line of body.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const kv = trimmed.match(/^([A-Za-z0-9_]+)\s*:\s*(.+)$/);
		if (!kv) continue;

		const key = kv[1];
		let rawValue = kv[2].trim();

		if (
			(rawValue.startsWith("'") && rawValue.endsWith("'")) ||
			(rawValue.startsWith('"') && rawValue.endsWith('"'))
		) {
			rawValue = rawValue.slice(1, -1);
		}

		if (key === 'order') {
			const parsed = Number(rawValue);
			if (Number.isFinite(parsed)) {
				result.order = parsed;
			}
			continue;
		}

		if (key === 'hidden') {
			result.hidden = rawValue === 'true';
			continue;
		}

		if (key === 'title' || key === 'name' || key === 'category') {
			result[key] = rawValue;
		}
	}

	return result;
}

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function walk(directory) {
	/** @type {string[]} */
	const files = [];
	const entries = await readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(fullPath)));
			continue;
		}
		if (entry.isFile()) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * @param {ResolvedDoc[]} docs
 * @param {string[]} categoryOrder
 * @returns {DocItem[]}
 */
function toNavigation(docs, categoryOrder) {
	/** @type {Map<string, ResolvedDoc[]>} */
	const byCategory = new Map();
	for (const doc of docs) {
		if (!byCategory.has(doc.category)) {
			byCategory.set(doc.category, []);
		}
		byCategory.get(doc.category).push(doc);
	}

	const explicitOrderIndex = new Map(categoryOrder.map((category, idx) => [category, idx]));
	const sortedCategories = Array.from(byCategory.keys()).sort((a, b) => {
		const ai = explicitOrderIndex.get(a);
		const bi = explicitOrderIndex.get(b);
		if (ai !== undefined && bi !== undefined) return ai - bi;
		if (ai !== undefined) return -1;
		if (bi !== undefined) return 1;
		return a.localeCompare(b);
	});

	const usedGroupSlugs = new Set();

	return sortedCategories.map((category) => {
		const baseSlug = slugify(category) || 'docs';
		let uniqueSlug = baseSlug;
		let suffix = 2;
		while (usedGroupSlugs.has(uniqueSlug)) {
			uniqueSlug = `${baseSlug}-${suffix}`;
			suffix += 1;
		}
		usedGroupSlugs.add(uniqueSlug);

		const docsInCategory = byCategory.get(category) ?? [];

		return {
			slug: uniqueSlug,
			name: category,
			items: docsInCategory.map((doc) => ({
				slug: doc.slug,
				name: doc.name
			}))
		};
	});
}

/**
 * @param {unknown} value
 * @param {number} indentLevel
 * @returns {string}
 */
function toTs(value, indentLevel = 0) {
	const indent = '\t'.repeat(indentLevel);
	const childIndent = '\t'.repeat(indentLevel + 1);

	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const rows = value.map((item) => `${childIndent}${toTs(item, indentLevel + 1)}`);
		return `[\n${rows.join(',\n')}\n${indent}]`;
	}

	if (value && typeof value === 'object') {
		const entries = Object.entries(/** @type {Record<string, unknown>} */ (value)).filter(
			([, propValue]) => propValue !== undefined
		);
		if (entries.length === 0) return '{}';

		const rows = entries.map(
			([key, propValue]) => `${childIndent}${key}: ${toTs(propValue, indentLevel + 1)}`
		);
		return `{\n${rows.join(',\n')}\n${indent}}`;
	}

	if (typeof value === 'string') {
		return `'${escapeString(value)}'`;
	}

	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}

	if (value === null) return 'null';
	throw new Error(`Unsupported value in docs config: ${String(value)}`);
}

/**
 * @param {ResolvedDoc[]} manifest
 */
function assertUniqueLeafSlugs(manifest) {
	const seen = new Set();
	for (const item of manifest) {
		invariant(!seen.has(item.slug), `Duplicate leaf slug in navigation config: "${item.slug}"`);
		seen.add(item.slug);
	}
}

/**
 * @returns {Promise<DocsConfig>}
 */
async function loadDocsConfig() {
	const moduleUrl = pathToFileURL(configPath).href;
	const configModule = await import(moduleUrl);

	invariant(
		typeof configModule === 'object' && configModule !== null,
		`${path.relative(appRoot, configPath)} must export a module object`
	);

	const config = configModule.docsConfig;
	invariant(
		typeof config === 'object' && config !== null,
		`${path.relative(appRoot, configPath)} must export a docsConfig object`
	);

	return /** @type {DocsConfig} */ (config);
}

async function main() {
	const [config, files] = await Promise.all([loadDocsConfig(), walk(docsRoutesPath)]);

	const categoryOrder = Array.isArray(config.categoryOrder)
		? config.categoryOrder.filter((value) => typeof value === 'string')
		: [];
	const defaults = config.defaults ?? {};
	const overrides = config.overrides ?? {};
	const defaultCategory =
		typeof defaults.category === 'string' && defaults.category.trim().length > 0
			? defaults.category
			: 'Documentation';
	const rootCategory =
		typeof defaults.rootCategory === 'string' && defaults.rootCategory.trim().length > 0
			? defaults.rootCategory
			: 'Getting Started';
	const rootName =
		typeof defaults.rootName === 'string' && defaults.rootName.trim().length > 0
			? defaults.rootName
			: 'Overview';
	const rootOrder = Number.isFinite(defaults.rootOrder) ? Number(defaults.rootOrder) : -1000;
	const defaultOrder = Number.isFinite(defaults.defaultOrder)
		? Number(defaults.defaultOrder)
		: 1000;

	const docFiles = files.filter((filePath) => filePath.endsWith(`${path.sep}+page.svx`));
	invariant(docFiles.length > 0, 'No documentation pages found in src/routes/docs');

	/** @type {ResolvedDoc[]} */
	const resolvedDocs = [];

	for (const filePath of docFiles) {
		const relativeFilePath = path.relative(docsRoutesPath, filePath).replaceAll(path.sep, '/');
		const slug =
			relativeFilePath === '+page.svx' ? '' : relativeFilePath.replace(/\/\+page\.svx$/, '');

		const fileContent = await readFile(filePath, 'utf8');
		const frontmatter = parseFrontmatter(fileContent);
		const override = overrides[slug] ?? {};
		const isHidden = override.hidden === true || frontmatter.hidden === true;
		if (isHidden) continue;

		const leafSegment = slug.split('/').filter(Boolean).at(-1) ?? '';
		const fallbackName = slug === '' ? rootName : toTitleCase(leafSegment || slug);
		const name =
			override.name ??
			frontmatter.name ??
			(slug === '' ? rootName : (frontmatter.title ?? fallbackName));
		invariant(
			typeof name === 'string' && name.trim().length > 0,
			`Invalid name for slug "${slug}"`
		);

		const derivedCategory =
			slug.includes('/') && slug !== '' ? toTitleCase(slug.split('/')[0]) : defaultCategory;
		const category =
			override.category ?? frontmatter.category ?? (slug === '' ? rootCategory : derivedCategory);
		invariant(
			typeof category === 'string' && category.trim().length > 0,
			`Invalid category for slug "${slug}"`
		);

		const order = Number.isFinite(override.order)
			? Number(override.order)
			: Number.isFinite(frontmatter.order)
				? Number(frontmatter.order)
				: slug === ''
					? rootOrder
					: defaultOrder;

		resolvedDocs.push({
			slug,
			name,
			category,
			order
		});
	}

	assertUniqueLeafSlugs(resolvedDocs);

	const explicitOrderIndex = new Map(categoryOrder.map((category, idx) => [category, idx]));
	resolvedDocs.sort((a, b) => {
		if (a.category !== b.category) {
			const ai = explicitOrderIndex.get(a.category);
			const bi = explicitOrderIndex.get(b.category);
			if (ai !== undefined && bi !== undefined) return ai - bi;
			if (ai !== undefined) return -1;
			if (bi !== undefined) return 1;
			return a.category.localeCompare(b.category);
		}
		if (a.order !== b.order) return a.order - b.order;
		return a.slug.localeCompare(b.slug);
	});

	const docsNavigation = toNavigation(resolvedDocs, categoryOrder);
	const docsManifest = resolvedDocs.map((doc) => ({
		slug: doc.slug,
		name: doc.name,
		category: doc.category
	}));

	const generated = `/* This file is auto-generated by scripts/generate-docs-manifest.mjs. Do not edit manually. */
import type { DocItem } from '$lib/types/doc';

export const docsNavigation: DocItem[] = ${toTs(docsNavigation)};

export const docsManifest: DocItem[] = ${toTs(docsManifest)};
`;

	await mkdir(path.dirname(outputPath), { recursive: true });
	await writeFile(outputPath, generated, 'utf8');

	console.log(
		`Generated ${path.relative(appRoot, outputPath)} from ${path.relative(appRoot, configPath)}`
	);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
