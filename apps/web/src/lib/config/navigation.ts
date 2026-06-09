import type { DeepPartial, SectionUiConfig } from '$lib/config/content-ui';
import { Devices, Scan } from 'carbon-icons-svelte';
import type { Component } from 'svelte';

export type ContentSectionLink = {
	label: string;
	href: string;
	icon?: Component<{ size?: number; class?: string }>;
	description?: string;
};

export type ContentSectionConfig = {
	/**
	 * URL-safe identifier used as the route segment and content directory name.
	 * The base path is derived as `/${id}`.
	 */
	id: string;
	label: string;
	navigation: ContentItem[];
	ui?: DeepPartial<SectionUiConfig>;
	icon?: Component;
	description?: string;
};

export type ContentItem = {
	slug: string;
	name: string;
	category?: string;
	showPagination?: boolean;
	items?: ContentItem[];
};

export const contentSections: ContentSectionConfig[] = [
	{
		id: 'docs',
		label: 'Docs',
		icon: Scan,
		description: 'An introction on how to use this template',
		navigation: [
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
		]
	},
	{
		id: 'examples',
		label: 'Examples',
		icon: Devices,
		description: 'Dummy examples to showcase the template’s sections',
		navigation: [
			{
				name: 'Dummy category',
				slug: 'dummy-category',
				items: [
					{
						slug: '',
						name: 'Example 1'
					},
					{
						slug: 'example-2',
						name: 'Example 2'
					}
				]
			}
		],
		ui: {
			toc: {
				enabled: false
			},
			pageActions: {
				enabled: false
			}
		}
	}
];
