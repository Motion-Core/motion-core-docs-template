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
			<div
				class="inset-shadow absolute -left-4 flex size-8 rounded-full border border-border bg-background-inset p-0.5"
			>
				<span
					class="flex h-full w-full items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-foreground shadow-md [counter-increment:step] before:content-[counter(step)]"
				>
					<span class="card-highlight absolute z-0 size-8 rounded-full shadow-sm"></span>
				</span>
			</div>
			<h3 class="relative z-10 text-lg leading-none font-medium tracking-tight">
				{title}
			</h3>
		</div>
	{:else}
		<div
			class="inset-shadow absolute -left-4 flex size-8 rounded-full border border-border bg-background-inset p-0.5"
		>
			<span
				class="flex h-full w-full items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-foreground shadow-md [counter-increment:step] before:content-[counter(step)]"
			>
				<span class="card-highlight absolute z-0 size-8 rounded-full shadow-sm"></span>
			</span>
		</div>
	{/if}
	<div class="text-base leading-relaxed tracking-normal text-foreground-muted">
		{@render children?.()}
	</div>
</div>
