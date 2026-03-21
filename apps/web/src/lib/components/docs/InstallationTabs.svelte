<script module lang="ts">
	let installationTabsCounter = 0;
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import CopyCodeButton from './markdown/CopyCodeButton.svelte';
	import ShikiCodeBlock from './ShikiCodeBlock.svelte';
	import { getHighlighter } from '$lib/utils/highlighter';
	import {
		packageManagers,
		packageManagerStore,
		type PackageManager
	} from '$lib/stores/package-manager.svelte';
	import { siteConfig } from '$lib/config/site';

	type Props = {
		pkg?: string;
		args?: string;
		isDev?: boolean;
	};

	let { pkg = siteConfig.package.name, args, isDev = false }: Props = $props();
	const tabsInstanceId = `installation-tabs-${++installationTabsCounter}`;
	const panelId = `${tabsInstanceId}-panel`;

	const commands: Record<PackageManager, string> = $derived(
		isDev
			? {
					npm: `npm install -D ${pkg} ${args ?? ''}`,
					pnpm: `pnpm add -D ${pkg} ${args ?? ''}`,
					bun: `bun add -D ${pkg} ${args ?? ''}`,
					yarn: `yarn add -D ${pkg} ${args ?? ''}`
				}
			: {
					npm: `npm install ${pkg} ${args ?? ''}`,
					pnpm: `pnpm add ${pkg} ${args ?? ''}`,
					bun: `bun add ${pkg} ${args ?? ''}`,
					yarn: `yarn add ${pkg} ${args ?? ''}`
				}
	);

	const activeCommand = $derived(commands[packageManagerStore.active]);
	const activeTabId = $derived(`${tabsInstanceId}-tab-${packageManagerStore.active}`);

	let highlightedCommands = $state<Record<PackageManager, { light: string; dark: string } | null>>({
		npm: null,
		pnpm: null,
		bun: null,
		yarn: null
	});

	$effect(() => {
		getHighlighter().then((highlighter) => {
			for (const pm of packageManagers) {
				const cmd = commands[pm];
				highlightedCommands[pm] = {
					light: highlighter.codeToHtml(cmd, {
						lang: 'bash',
						theme: 'github-light'
					}),
					dark: highlighter.codeToHtml(cmd, {
						lang: 'bash',
						theme: 'github-dark'
					})
				};
			}
		});
	});

	function setActivePackageManager(pm: PackageManager) {
		packageManagerStore.active = pm;
	}

	function focusTabByIndex(index: number) {
		const targetPm = packageManagers[index];
		if (!targetPm) return;
		const tabElement = document.getElementById(`${tabsInstanceId}-tab-${targetPm}`);
		if (tabElement instanceof HTMLButtonElement) {
			tabElement.focus();
		}
	}

	function handleTabKeydown(event: KeyboardEvent, index: number) {
		const lastIndex = packageManagers.length - 1;
		let nextIndex = index;

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

		const nextPm = packageManagers[nextIndex];
		if (!nextPm) return;
		setActivePackageManager(nextPm);
		focusTabByIndex(nextIndex);
	}
</script>

<div class="inset-shadow my-6 rounded-lg bg-background-inset p-1.5">
		<div class="card relative w-full rounded-md bg-background">
			<div class="flex items-center justify-between rounded-t-md border-b border-border">
				<div class="flex items-center" role="tablist" aria-label="Package managers">
					{#each packageManagers as pm, index (pm)}
						<button
							id={`${tabsInstanceId}-tab-${pm}`}
							role="tab"
							aria-selected={packageManagerStore.active === pm}
							aria-controls={panelId}
							tabindex={packageManagerStore.active === pm ? 0 : -1}
							onclick={() => setActivePackageManager(pm)}
							onkeydown={(event) => handleTabKeydown(event, index)}
							class={cn(
								'relative px-4 py-2.5 text-sm font-medium tracking-normal transition-colors duration-150 ease-out outline-none select-none',
								packageManagerStore.active === pm
								? 'text-foreground'
								: 'text-foreground-muted hover:text-foreground'
						)}
					>
						{pm}
						{#if packageManagerStore.active === pm}
							<div class="absolute bottom-0 left-0 h-0.5 w-full bg-accent"></div>
						{/if}
					</button>
				{/each}
			</div>

			<CopyCodeButton code={activeCommand} class="mr-2" />
		</div>

			<div
				id={panelId}
				role="tabpanel"
				tabindex="0"
				aria-labelledby={activeTabId}
				class="min-h-12.5 p-4 [&>div]:mt-0 [&>div]:rounded-none [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:shadow-none [&>div]:[box-shadow:none]!"
			>
			{#if highlightedCommands[packageManagerStore.active]}
				<ShikiCodeBlock
					code=""
					htmlLight={highlightedCommands[packageManagerStore.active]!.light}
					htmlDark={highlightedCommands[packageManagerStore.active]!.dark}
					unstyled={true}
				/>
			{:else}
				<code class="block font-mono text-sm leading-relaxed whitespace-pre text-foreground">
					{activeCommand}
				</code>
			{/if}
		</div>
	</div>
</div>
