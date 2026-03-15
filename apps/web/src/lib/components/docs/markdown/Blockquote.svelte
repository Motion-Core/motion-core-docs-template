<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	type ComponentProps = {
		class?: string;
		children?: Snippet;
		[prop: string]: unknown;
	};

	const { children, class: className = '', ...restProps }: ComponentProps = $props();
</script>

<blockquote
	{...restProps}
	class={cn(
		'relative mt-6 rounded-lg border border-l-2 border-border border-l-accent bg-background px-5 py-3 text-base font-normal text-foreground-muted italic shadow-md',
		className
	)}
>
	{@render children?.()}
</blockquote>
