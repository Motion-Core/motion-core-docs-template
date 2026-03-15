import type { DocItem } from '$lib/types/doc';

/**
 * Manual docs navigation source of truth.
 * Keep order as-is to control sidebar and previous/next navigation.
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
	}
];
