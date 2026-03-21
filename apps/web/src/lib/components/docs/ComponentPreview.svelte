<script module lang="ts">
	let componentPreviewCounter = 0;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { getHighlighter } from '$lib/utils/highlighter';
	import ScrollArea from '../ui/ScrollArea.svelte';
	import ShikiCodeBlock from './ShikiCodeBlock.svelte';
	import CopyCodeButton from './markdown/CopyCodeButton.svelte';

	type SourceTab = {
		name: string;
		code: string;
		language?: string;
	};

	type ComponentProps = {
		code?: string;
		language?: string;
		label?: string;
		children?: Snippet;
		codeSlot?: Snippet;
		sources?: SourceTab[];
		class?: string;
		[key: string]: unknown;
	};

	const {
		children,
		codeSlot,
		code: providedCode,
		language: providedLanguage,
		label: providedLabel,
		sources: providedSources,
		class: className = '',
		...restProps
	}: ComponentProps = $props();
	componentPreviewCounter += 1;
	const tabsInstanceId = `component-preview-${componentPreviewCounter}`;
	const panelId = `${tabsInstanceId}-panel`;

	let previewKey = $state(0);

	const tabs = $derived(
		(() => {
			const normalized =
				providedSources?.filter((tab): tab is SourceTab => Boolean(tab?.code)) ?? [];

			if (normalized.length > 0) {
				return normalized;
			}

			if (providedCode) {
				return [
					{
						name: providedLabel ?? 'Code',
						code: providedCode,
						language: providedLanguage
					}
				];
			}

			return [];
		})() as SourceTab[]
	);

	let activeTab = $state(0);

	$effect(() => {
		void tabs;
		if (activeTab > tabs.length - 1) {
			activeTab = 0;
		}
	});

	const activeSource = $derived((tabs.at(activeTab) ?? null) as SourceTab | null);
	const activeTabId = $derived(`${tabsInstanceId}-tab-${activeTab}`);

	let highlightedSources = $state<Record<string, { light: string; dark: string }>>({});

	$effect(() => {
		getHighlighter().then((highlighter) => {
			tabs.forEach((tab) => {
				if (!highlightedSources[tab.name]) {
					const lang = tab.language ?? 'typescript';
					const light = highlighter.codeToHtml(tab.code, {
						lang,
						theme: 'github-light'
					});
					const dark = highlighter.codeToHtml(tab.code, {
						lang,
						theme: 'github-dark'
					});
					highlightedSources[tab.name] = { light, dark };
				}
			});
		});
	});

	function setActiveTab(index: number) {
		activeTab = index;
	}

	function focusTabByIndex(index: number) {
		const tabElement = document.getElementById(`${tabsInstanceId}-tab-${index}`);
		if (tabElement instanceof HTMLButtonElement) {
			tabElement.focus();
		}
	}

	function handleTabKeydown(event: KeyboardEvent, index: number) {
		if (!tabs.length) return;
		const lastIndex = tabs.length - 1;
		let nextIndex: number;

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				nextIndex = index === lastIndex ? 0 : index + 1;
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				nextIndex = index === 0 ? lastIndex : index - 1;
				break;
			case 'Home':
				event.preventDefault();
				nextIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				nextIndex = lastIndex;
				break;
			default:
				return;
		}

		setActiveTab(nextIndex);
		focusTabByIndex(nextIndex);
	}
</script>

<section
	class={cn('inset-shadow relative w-full rounded-lg bg-background-inset p-1.5')}
	{...restProps}
>
	<div class="flex h-full flex-col rounded-md">
		<div
			class="card relative flex min-h-96 flex-1 flex-col items-center justify-center rounded-md bg-background"
		>
			<div
				class="group/preview relative flex h-full w-full flex-1 flex-col overflow-hidden rounded-md bg-background"
			>
				<ScrollArea
					mode="both"
					id="component-preview-live"
					class={cn('w-full flex-1', className)}
					viewportClass="min-h-full w-full flex flex-col"
				>
					<div class="flex w-full flex-1 flex-col items-center justify-center">
						{#key previewKey}
							{@render children?.()}
						{/key}
					</div>
				</ScrollArea>
			</div>
		</div>
		<div
			class="card mt-2 flex flex-1 flex-col overflow-hidden rounded-md rounded-b-md bg-background"
		>
			{#if tabs.length}
				<div class="flex items-center border-b border-border bg-background text-sm">
					<div
						class="flex flex-1 items-center overflow-x-auto"
						role="tablist"
						aria-label="Source files"
					>
						{#each tabs as tab, index (tab.name)}
							<button
								type="button"
								id={`${tabsInstanceId}-tab-${index}`}
								role="tab"
								aria-selected={index === activeTab}
								aria-controls={panelId}
								tabindex={index === activeTab ? 0 : -1}
								class={cn(
									'border-b-2 px-4 py-2.5 text-sm font-medium tracking-normal whitespace-nowrap transition-colors duration-150 ease-out',
									index === activeTab
										? 'border-accent text-foreground'
										: 'border-transparent text-foreground-muted hover:text-foreground'
								)}
								onclick={() => setActiveTab(index)}
								onkeydown={(event) => handleTabKeydown(event, index)}
							>
								{tab.name}
							</button>
						{/each}
					</div>
					<div class="mr-2 w-fit flex-none">
						{#if activeSource}
							<CopyCodeButton class="size-6" code={activeSource.code} />
						{/if}
					</div>
				</div>
			{/if}
			<div
				id={panelId}
				role="tabpanel"
				tabindex="0"
				aria-labelledby={activeTabId}
				class="flex-1"
			>
				<ScrollArea id="component-preview" class="relative max-h-96">
					<div
						class="p-4 text-sm *:mt-0 *:rounded-none *:border-0 *:bg-transparent *:p-0 *:inset-shadow-none"
					>
						{#if activeSource}
							{#if highlightedSources[activeSource.name]}
								<ShikiCodeBlock
									code=""
									htmlLight={highlightedSources[activeSource.name].light}
									htmlDark={highlightedSources[activeSource.name].dark}
									unstyled={true}
								/>
							{:else}
								<pre class="p-4">{activeSource.code}</pre>
							{/if}
						{:else}
							{@render codeSlot?.()}
						{/if}
					</div>
				</ScrollArea>
			</div>
		</div>
	</div>
</section>
