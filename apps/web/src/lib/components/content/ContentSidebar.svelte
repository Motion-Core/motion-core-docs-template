<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { brandingConfig } from '$lib/config/branding';
	import { contentUiDefaults, type SectionUiConfig } from '$lib/config/content-ui';
	import { siteConfig } from '$lib/config/site';
	import { cn } from '$lib/utils/cn';
	import ScrollArea from '$lib/components/ui/ScrollArea.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import SearchTrigger from '$lib/components/content/search/SearchTrigger.svelte';
	import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';
	import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte';
	import { getHref } from '$lib/content/manifest';
	import type { ContentItem } from '$lib/config/navigation';
	import { resolve } from '$app/paths';

	type SectionLink = {
		label: string;
		href: string;
	};

	const {
		navigation,
		navigationLabel = contentUiDefaults.sidebar.navigationLabel,
		basePath = '/docs',
		showSearch = contentUiDefaults.search.enabled,
		showThemeToggle = contentUiDefaults.sidebar.showThemeToggle,
		showRepositoryLink = contentUiDefaults.sidebar.showRepositoryLink,
		repositoryUrl = siteConfig.links.github,
		repositoryAriaLabel = contentUiDefaults.sidebar.repositoryAriaLabel,
		searchConfig = contentUiDefaults.search,
		sectionLinks = [],
		showBranding = true
	}: {
		navigation: ContentItem[];
		navigationLabel?: string;
		basePath?: string;
		showSearch?: boolean;
		showThemeToggle?: boolean;
		showRepositoryLink?: boolean;
		repositoryUrl?: string;
		repositoryAriaLabel?: string;
		searchConfig?: SectionUiConfig['search'];
		sectionLinks?: SectionLink[];
		showBranding?: boolean;
	} = $props();

	const currentPath = $derived(
		page.url.pathname.length > 1 ? page.url.pathname.replace(/\/+$/, '') : page.url.pathname
	);

	let expandedGroupOverrides = $state<Record<string, boolean | undefined>>({});

	function normalizePath(pathname: string) {
		return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
	}

	function isSectionLinkActive(href: string) {
		const normalizedHref = normalizePath(href);
		return (
			currentPath === normalizedHref ||
			(normalizedHref !== '/' && currentPath.startsWith(`${normalizedHref}/`))
		);
	}

	function contentHref(slug: string) {
		return getHref(basePath, slug);
	}

	function itemMatchesCurrentPath(item: ContentItem): boolean {
		if (contentHref(item.slug) === currentPath) {
			return true;
		}

		return item.items?.some((child) => itemMatchesCurrentPath(child)) ?? false;
	}

	const autoExpandedGroups = $derived.by<Record<string, boolean | undefined>>(() => {
		const expanded: Record<string, boolean> = {};
		for (const item of navigation) {
			if (item.items?.length) {
				expanded[item.slug] = item.items.some((child) => itemMatchesCurrentPath(child));
			}
		}
		return expanded;
	});

	function isGroupActive(slug: string) {
		const override = expandedGroupOverrides[slug];
		if (override !== undefined) return override;

		const auto = autoExpandedGroups[slug];
		if (auto !== undefined) return auto;

		return false;
	}

	function toggleGroup(slug: string) {
		expandedGroupOverrides[slug] = !isGroupActive(slug);
	}
</script>

<aside class="flex h-full min-h-0 flex-col bg-background" aria-label={navigationLabel + ' sidebar'}>
	<div class="flex flex-col gap-2 p-4 pb-0 lg:p-0">
		{#if showBranding}
			<a href={resolve('/')} class="flex items-center gap-2">
				<span
					class="inline-flex shrink-0 items-center text-accent [&>svg]:size-6 [&>svg]:fill-current"
					aria-hidden="true"
				>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html brandingConfig.logoRaw}
				</span>
				<span class="text-xl font-medium tracking-tight text-foreground">{brandingConfig.name}</span
				>
			</a>
		{/if}

		{#if sectionLinks.length > 1}
			<nav
				class="inset-shadow inline-flex flex-wrap gap-1 rounded-sm bg-background-inset p-1 text-xs font-medium"
				aria-label="Content sections"
			>
				{#each sectionLinks as link (link.href)}
					{@const isActive = isSectionLinkActive(link.href)}
					<a
						// @ts-expect-error arg cannot be cast as `resolve`s expected type
						href={resolve(link.href)}
						class={cn(
							'rounded-xs px-3 py-1.5 transition-colors duration-150 ease-out',
							isActive
								? 'bg-accent/10 text-accent'
								: 'text-foreground-muted hover:bg-background-muted hover:text-foreground'
						)}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}

		{#if showSearch}
			<SearchTrigger {searchConfig} />
		{/if}
	</div>

	<ScrollArea
		class="flex-1"
		viewportClass="px-4 py-4 lg:px-0 min-h-0"
		viewportStyle="mask-image: linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent);"
	>
		<nav class="flex flex-col space-y-1" aria-label={navigationLabel}>
			{#each navigation as item (item.slug)}
				{#if item.items?.length}
					{@const groupIsActive = isGroupActive(item.slug)}
					<button
						onclick={() => {
							toggleGroup(item.slug);
						}}
						class={cn(
							'flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-sm font-medium tracking-normal transition-all duration-150 ease-out hover:bg-background-muted hover:text-foreground',
							groupIsActive ? 'text-foreground' : 'text-foreground-muted'
						)}
					>
						<span>{item.name}</span>
						<ChevronRight
							class={cn('size-4 transition-transform duration-150', groupIsActive && 'rotate-90')}
						/>
					</button>
					{#if groupIsActive}
						<div
							transition:slide={{ duration: 220 }}
							class="relative flex flex-col gap-1 overflow-hidden pl-5 before:absolute before:top-1 before:bottom-1 before:left-3 before:w-px before:bg-border"
						>
							{#each item.items as child (child.slug)}
								{@const href = contentHref(child.slug)}
								{@const isActive = currentPath === href}
								<a
									// @ts-expect-error arg cannot be cast as `resolve`s expected type
									href={resolve(href)}
									class={cn(
										'block rounded-sm px-3 py-1.5 text-sm font-medium tracking-normal transition-all duration-150 ease-out',
										isActive
											? 'bg-accent/10 text-accent'
											: 'text-foreground-muted hover:bg-background-muted hover:text-foreground'
									)}
								>
									{child.name}
								</a>
							{/each}
						</div>
					{/if}
				{:else}
					{@const href = contentHref(item.slug)}
					{@const isActive = currentPath === href}
					<a
						// @ts-expect-error arg cannot be cast as `resolve`s expected type
						href={resolve(href)}
						class={cn(
							'block rounded-sm px-3 py-1.5 text-sm tracking-normal transition-all duration-150 ease-out',
							isActive
								? 'bg-accent/10 text-accent'
								: 'text-foreground-muted hover:bg-background-muted hover:text-foreground'
						)}
					>
						{item.name}
					</a>
				{/if}
			{/each}
		</nav>
	</ScrollArea>

	<div class="flex items-center gap-1 p-4 lg:p-0">
		{#if showThemeToggle}
			<ThemeToggle />
		{/if}
		{#if showRepositoryLink}
			<a
				class="group transition-scale inset-shadow relative inline-flex size-7 cursor-pointer items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95]"
				href={repositoryUrl}
				target="_blank"
				rel="external"
				aria-label={`${repositoryAriaLabel} (opens in a new tab)`}
			>
				<LogoGithub class="size-4 flex-none" />
			</a>
		{/if}
	</div>
</aside>
