import type { DocItem } from '$lib/types/doc';

/**
 * Manual documentation navigation tree.
 * The order of items controls sidebar rendering and previous/next doc navigation.
 */
export const docsNavigation: DocItem[] = [
	{
		slug: 'reference',
		name: 'Reference',
		items: [
			{
				slug: '',
				name: 'Text Components'
			},
			{
				slug: 'structure-components',
				name: 'Structure Components'
			}
		]
	},
	{
		slug: 'changelog',
		name: 'Changelog'
	}
];
