import { error } from '@sveltejs/kit';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import type { RequestHandler } from './$types';
import { brandLogoRaw, getDocBySlug, getDocMetadata, interVariableDataUri, siteConfig } from '$lib';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MAX_TITLE_LENGTH = 88;
const MAX_DESCRIPTION_LENGTH = 180;
const canonicalOrigin = new URL(siteConfig.url).origin;
const SYSTEM_FONT_STACK = 'Inter, sans-serif';

const clampText = (value: string, maxLength: number) => {
	const text = value.trim();
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

const dataUriToUint8Array = (dataUri: string) => {
	const base64 = dataUri.slice(dataUri.indexOf(',') + 1);

	if (typeof Buffer !== 'undefined') {
		return Uint8Array.from(Buffer.from(base64, 'base64'));
	}

	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
};

const escapeXml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

const wrapText = (value: string, maxCharsPerLine: number, maxLines: number) => {
	const words = value.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return [''];

	const lines: string[] = [];
	let current = '';
	let truncated = false;

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;

		if (candidate.length <= maxCharsPerLine) {
			current = candidate;
			continue;
		}

		if (current) {
			lines.push(current);
		} else {
			lines.push(clampText(word, maxCharsPerLine));
		}

		if (lines.length >= maxLines) {
			truncated = true;
			current = '';
			break;
		}

		current = word;
	}

	if (!truncated && current) {
		lines.push(current);
	}

	if (lines.length > maxLines) {
		lines.length = maxLines;
		truncated = true;
	}

	if (truncated && lines.length > 0) {
		const last = lines.length - 1;
		lines[last] = clampText(lines[last], Math.max(1, maxCharsPerLine - 1));
		if (!lines[last].endsWith('…')) {
			lines[last] = `${lines[last].replace(/[.\s]+$/g, '')}…`;
		}
	}

	return lines;
};

const renderTspans = (lines: string[], x: number, lineHeight: number) =>
	lines
		.map((line, index) => {
			const dy = index === 0 ? 0 : lineHeight;
			return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
		})
		.join('');

const ogFontBuffers = Promise.resolve([dataUriToUint8Array(interVariableDataUri)]);

type ResvgWasmState = {
	promise?: Promise<void>;
	initialized?: boolean;
};

const resvgState = globalThis as typeof globalThis & { __docsOgResvgWasmState?: ResvgWasmState };
if (!resvgState.__docsOgResvgWasmState) {
	resvgState.__docsOgResvgWasmState = {};
}

const ensureResvgWasm = (origin: string) => {
	const state = resvgState.__docsOgResvgWasmState as ResvgWasmState;
	if (state.initialized) {
		return Promise.resolve();
	}

	if (!state.promise) {
		state.promise = fetch(new URL('/resvg-index_bg.wasm', origin))
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to load resvg wasm: ${response.status}`);
				}
				return response.arrayBuffer();
			})
			.then((buffer) => initWasm(buffer))
			.then(() => {
				state.initialized = true;
			})
			.catch((err: unknown) => {
				const message = err instanceof Error ? err.message : String(err);
				if (message.includes('Already initialized')) {
					state.initialized = true;
					return;
				}
				state.promise = undefined;
				throw err;
			});
	}
	return state.promise;
};

const logoDataUri = `data:image/svg+xml,${encodeURIComponent(
	brandLogoRaw.replaceAll('currentColor', '#ff6900')
)}`;

export const GET: RequestHandler = async ({ params, url }) => {
	const rawSlug = (params.slug ?? '').replace(/^\/+|\/+$/g, '');
	const slug = rawSlug === '' || rawSlug === 'index' || rawSlug === 'docs' ? '' : rawSlug;

	const metadata = getDocMetadata(`/docs/${slug}`);
	if (!metadata) {
		throw error(404, 'Document not found');
	}

	const category = getDocBySlug(metadata.slug)?.category ?? 'Documentation';
	const title = clampText(metadata.title, MAX_TITLE_LENGTH);
	const description = clampText(
		metadata.description ?? 'Documentation page.',
		MAX_DESCRIPTION_LENGTH
	);
	const pageUrl = new URL(`/docs/${metadata.slug}`, canonicalOrigin).href;
	const titleLines = wrapText(title, 18, 2);
	const descriptionLines = wrapText(description, 56, 2);
	const titleY = 340;
	const titleLineHeight = 100;
	const descriptionY = titleY + (titleLines.length - 1) * titleLineHeight + 92;
	const fontBuffers = await ogFontBuffers;
	await ensureResvgWasm(url.origin);

	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
	<rect width="100%" height="100%" fill="#ffffff" />
	<g font-family="${SYSTEM_FONT_STACK}">
		<image href="${logoDataUri}" x="40" y="40" width="78" height="78" />
		<text x="1160" y="82" fill="#8a8f98" font-size="24" font-weight="400" text-anchor="end">${escapeXml(pageUrl)}</text>
		<text x="40" y="250" fill="#8a8f98" font-size="21" font-weight="500" letter-spacing="1.2">${escapeXml(category.toUpperCase())}</text>
		<text x="40" y="${titleY}" fill="#111318" font-size="98" font-weight="700">${renderTspans(titleLines, 40, titleLineHeight)}</text>
		<text x="40" y="${descriptionY}" fill="#5f6672" font-size="36" font-weight="400">${renderTspans(descriptionLines, 40, 48)}</text>
	</g>
</svg>`;

	const rendered = new Resvg(svg, {
		fitTo: { mode: 'width', value: OG_WIDTH },
		font: {
			fontBuffers,
			defaultFontFamily: 'Inter',
			sansSerifFamily: 'Inter'
		}
	}).render();
	const png = rendered.asPng();
	const pngBody = new Uint8Array(png.byteLength);
	pngBody.set(png);

	return new Response(pngBody, {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=3600'
		}
	});
};
