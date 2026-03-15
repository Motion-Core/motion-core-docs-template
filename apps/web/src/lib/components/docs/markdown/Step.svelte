<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	let {
		class: className,
		children,
		title
	} = $props<{
		class?: string;
		children?: Snippet;
		title?: string;
	}>();
</script>

<div class={cn('relative pb-10 pl-8', className)}>
	{#if title}
		<div class="mb-4 flex h-8 items-center">
			<h3
				class="relative z-10 size-8 items-center justify-center rounded-full border border-border bg-background text-lg leading-none font-medium text-foreground [counter-increment:step] before:content-[counter(step)]"
			>
				{title}
			</h3>
		</div>
	{:else}
		<span
			class="absolute top-0 -left-4 flex size-8 items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-foreground [counter-increment:step] before:content-[counter(step)]"
		></span>
	{/if}
	<div class="text-base leading-relaxed font-normal text-pretty text-foreground-muted">
		{@render children?.()}
	</div>
</div>
